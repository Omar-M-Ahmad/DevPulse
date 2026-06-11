import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { commits, issues, repos } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

interface RepoPageProps {
  params: Promise<{ repo: string }>;
}

// ─── Label color map ──────────────────────────────────────────────────────────

const LABEL_COLORS: Record<string, string> = {
  bug: 'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  ui: 'text-purple-400 bg-purple-950 border-purple-800',
  enhancement:
    'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
  documentation: 'text-blue-400 bg-blue-950 border-blue-800',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: RepoPageProps): Promise<Metadata> {
  const { repo } = await params;
  const repoName = decodeURIComponent(repo);
  return {
    title: `${repoName} — DevPulse`,
    description: `Commit activity, open issues, and health status for ${repoName}.`,
  };
}

export default async function RepoPage({
  params,
}: RepoPageProps): Promise<React.JSX.Element> {
  // Use the cached helper — eliminates the raw GitHub API call that was here
  // before. getCurrentUser() is deduplicated via React.cache(), so if the
  // layout already resolved it in this request tree, this is a no-op.
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const { repo: repoName } = await params;

  const repo = await db.query.repos.findFirst({
    where: and(eq(repos.userId, user.id), eq(repos.name, repoName)),
  });

  if (!repo) notFound();

  // Fetch commits and issues in parallel — no reason to await them serially.
  const [repoCommits, repoIssues] = await Promise.all([
    db.query.commits.findMany({
      where: eq(commits.repoId, repo.id),
      orderBy: desc(commits.committedAt),
      limit: 20,
    }),
    db.query.issues.findMany({
      where: eq(issues.repoId, repo.id),
      orderBy: desc(issues.createdAt),
    }),
  ]);

  const statusStyle = {
    active:
      'text-status-active-text bg-status-active-bg border-status-active-border',
    cooling:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    stale:
      'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  }[repo.status];

  const statCards = [
    { label: 'TOTAL_COMMITS', value: repoCommits.length },
    { label: 'OPEN_ISSUES', value: repo.openIssues },
    { label: 'STARS', value: repo.stars },
    {
      label: 'LAST_COMMIT',
      value: repo.lastCommitAt
        ? new Date(repo.lastCommitAt).toLocaleDateString()
        : '—',
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      {/* ── Header ── */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-3">
          <div>
            <h1 className="font-mono text-xl md:text-2xl font-bold text-text-primary mb-2">
              {repo.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-sm border ${statusStyle}`}
              >
                {repo.status.toUpperCase()}
              </span>
              {repo.private && (
                <span className="font-mono text-xs text-text-disabled border border-border-default px-2 py-0.5 rounded-sm">
                  private
                </span>
              )}
              {repo.language && (
                <span className="font-mono text-xs text-text-muted">
                  {repo.language}
                </span>
              )}
              <span className="font-mono text-xs text-text-muted">
                ★ {repo.stars}
              </span>
            </div>
          </div>

          <a
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-text-primary border border-border-default hover:border-border-emphasis px-3 py-1.5 rounded-sm transition-colors self-start md:shrink-0"
          >
            ↗ open on github
          </a>
        </div>

        {repo.description && (
          <p className="font-sans text-sm text-text-muted">
            {repo.description}
          </p>
        )}
      </div>

      {/* ── Stat cards — 2 cols on mobile, 4 on desktop ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-secondary border border-border-default rounded-md p-4"
          >
            <p className="font-mono text-xs text-text-disabled mb-2 truncate">
              {card.label}
            </p>
            <p className="font-mono text-xl font-bold text-text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Recent commits ── */}
      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
            Recent_Commits
          </p>
        </div>

        {repoCommits.length === 0 ? (
          <p className="px-4 py-8 font-mono text-xs text-text-disabled">
            // no commits found
          </p>
        ) : (
          <div className="divide-y divide-border-default">
            {repoCommits.slice(0, 10).map((commit) => (
              <a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors gap-4"
              >
                <p className="font-mono text-xs text-text-secondary truncate flex-1">
                  {commit.message}
                </p>
                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                  <p className="font-mono text-xs text-text-disabled hidden sm:block">
                    {new Date(commit.committedAt).toLocaleDateString()}
                  </p>
                  <p className="font-mono text-xs text-text-disabled">
                    {commit.sha.slice(0, 7)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Issues (only rendered when present) ── */}
      {repoIssues.length > 0 && (
        <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Open_Issues
            </p>
          </div>
          <div className="divide-y divide-border-default">
            {repoIssues.map((issue) => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                <p className="font-mono text-xs text-text-secondary truncate flex-1 pe-2">
                  #{issue.githubNumber} {issue.title}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {issue.labels.slice(0, 2).map((label) => (
                    <span
                      key={label}
                      className={`font-mono text-xs px-2 py-0.5 rounded-sm border ${
                        LABEL_COLORS[label] ??
                        'text-text-muted bg-bg-hover border-border-default'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <p className="font-mono text-xs text-text-disabled mt-8">
        // devpulse is read-only. all actions open github.
      </p>
    </div>
  );
}
