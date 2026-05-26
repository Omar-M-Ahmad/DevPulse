import { db } from '@/lib/db';
import { commits, issues, repos, syncLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchRepoCommits, fetchRepoIssues, fetchUserRepos } from './client';

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

export async function syncUserRepos(
  userId: number,
  accessToken: string,
): Promise<void> {
  const startedAt = Date.now();

  try {
    const githubRepos = await fetchUserRepos(accessToken);

    for (const repo of githubRepos) {
      const status = computeStatus(repo.pushed_at);

      // Upsert repo
      const [savedRepo] = await db
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

      if (!savedRepo) continue;

      // Fetch and save commits
      try {
        const repoCommits = await fetchRepoCommits(repo.full_name, accessToken);

        for (const commit of repoCommits) {
          await db
            .insert(commits)
            .values({
              repoId: savedRepo.id,
              sha: commit.sha,
              message:
                commit.commit.message.split('\n')[0] ?? commit.commit.message,
              committedAt: new Date(commit.commit.author.date),
              url: commit.html_url,
            })
            .onConflictDoNothing();
        }
      } catch {
        // Ignore repos that do not have commits or are protected.
      }

      // Fetch and save issues
      try {
        const repoIssues = await fetchRepoIssues(repo.full_name, accessToken);

        // Delete the old one and add the new one.
        await db.delete(issues).where(eq(issues.repoId, savedRepo.id));

        for (const issue of repoIssues) {
          await db.insert(issues).values({
            repoId: savedRepo.id,
            githubNumber: issue.number,
            title: issue.title,
            labels: issue.labels.map((l) => l.name),
            createdAt: new Date(issue.created_at),
            url: issue.html_url,
          });
        }
      } catch {
        // Ignore
      }
    }

    // Log Successfully synced
    await db.insert(syncLogs).values({
      userId,
      status: 'success',
      reposSynced: githubRepos.length,
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
