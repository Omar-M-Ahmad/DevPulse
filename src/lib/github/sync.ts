import { db } from '@/lib/db';
import { commits, issues, repos, syncLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchRepoCommits, fetchRepoIssues, fetchUserRepos } from './client';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Derive a repo's health status from its last push date. */
function computeStatus(
  pushedAt: string | null,
): 'active' | 'cooling' | 'stale' {
  if (!pushedAt) return 'stale';

  const daysSince =
    (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= 7) return 'active';
  if (daysSince <= 21) return 'cooling';
  return 'stale';
}

// ─── main export ─────────────────────────────────────────────────────────────

/**
 * Fetches all repos for a GitHub user and syncs them to the database.
 *
 * Strategy per repo:
 *   1. Upsert repo metadata
 *   2. Insert new commits (skip duplicates via onConflictDoNothing)
 *   3. Replace issues (delete-then-insert inside a transaction for consistency)
 *
 * Each repo runs in its own transaction so a failure in one repo does not
 * corrupt data for the others. A sync_log entry is written at the end.
 */
export async function syncUserRepos(
  userId: number,
  accessToken: string,
): Promise<void> {
  let reposSynced = 0;

  try {
    const githubRepos = await fetchUserRepos(accessToken);

    for (const repo of githubRepos) {
      try {
        await syncSingleRepo(userId, accessToken, repo);
        reposSynced++;
      } catch (err) {
        // One bad repo should not abort the whole sync — log and continue.
        console.error(`[sync] failed for ${repo.full_name}:`, err);
      }
    }

    await db.insert(syncLogs).values({
      userId,
      status: 'success',
      reposSynced,
    });
  } catch (error) {
    await db.insert(syncLogs).values({
      userId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ─── internal ────────────────────────────────────────────────────────────────

interface GitHubRepoShape {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
}

/**
 * Syncs a single repository inside a transaction.
 * Using a transaction guarantees that commits and issues are never saved
 * for a repo that failed to upsert, and that the issues delete+insert
 * is atomic (no window where issues appear empty).
 */
async function syncSingleRepo(
  userId: number,
  accessToken: string,
  repo: GitHubRepoShape,
): Promise<void> {
  const status = computeStatus(repo.pushed_at);

  // Fetch external data before opening the transaction to keep it short.
  const [repoCommits, repoIssues] = await Promise.allSettled([
    fetchRepoCommits(repo.full_name, accessToken),
    fetchRepoIssues(repo.full_name, accessToken),
  ]);

  await db.transaction(async (tx) => {
    // 1. Upsert repo row
    const [savedRepo] = await tx
      .insert(repos)
      .values({
        userId,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        openIssues: repo.open_issues_count,
        status,
        lastCommitAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: repos.githubId,
        set: {
          name: repo.name,
          stars: repo.stargazers_count,
          openIssues: repo.open_issues_count,
          status,
          lastCommitAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          syncedAt: new Date(),
        },
      })
      .returning();

    if (!savedRepo) return;

    // 2. Batch-insert commits — skip any SHAs already in the DB.
    if (repoCommits.status === 'fulfilled' && repoCommits.value.length > 0) {
      const commitRows = repoCommits.value.map((c) => ({
        repoId: savedRepo.id,
        sha: c.sha,
        message: c.commit.message.split('\n')[0] ?? c.commit.message,
        committedAt: new Date(c.commit.author.date),
        url: c.html_url,
      }));

      // Single INSERT … ON CONFLICT DO NOTHING is much faster than N inserts.
      await tx.insert(commits).values(commitRows).onConflictDoNothing();
    }

    // 3. Replace issues atomically — delete old, insert new in one transaction.
    if (repoIssues.status === 'fulfilled') {
      await tx.delete(issues).where(eq(issues.repoId, savedRepo.id));

      if (repoIssues.value.length > 0) {
        const issueRows = repoIssues.value.map((issue) => ({
          repoId: savedRepo.id,
          githubNumber: issue.number,
          title: issue.title,
          labels: issue.labels.map((l) => l.name),
          createdAt: new Date(issue.created_at),
          url: issue.html_url,
        }));

        await tx.insert(issues).values(issueRows);
      }
    }
  });
}