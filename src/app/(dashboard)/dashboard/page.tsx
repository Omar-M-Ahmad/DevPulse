import { db } from '@/lib/db';
import { getCurrentUser, getUserRepos } from '@/lib/db/queries';
import { commits, repos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const userRepos = await getUserRepos(user.id);

  const activeCount = userRepos.filter((r) => r.status === 'active').length;
  const staleCount = userRepos.filter((r) => r.status === 'stale').length;
  const totalIssues = userRepos.reduce((sum, r) => sum + r.openIssues, 0);

  // Fetch the 10 most recent commits across all repos
  const recentCommits = await db
    .select({
      sha: commits.sha,
      message: commits.message,
      committedAt: commits.committedAt,
      url: commits.url,
      repoName: repos.name,
    })
    .from(commits)
    .innerJoin(repos, eq(commits.repoId, repos.id))
    .where(eq(repos.userId, user.id))
    .orderBy(desc(commits.committedAt))
    .limit(10);

  const statusStyle = {
    active:
      'text-status-active-text bg-status-active-bg border-status-active-border',
    cooling:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    stale:
      'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  } as const;

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Terminal-style top bar */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-xs text-text-muted">
          $ system_stat --verbose
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL_REPOS', value: userRepos.length, accent: false },
          { label: 'ACTIVE_INSTANCES', value: activeCount, accent: false },
          {
            label: 'STALE_PROCESSES',
            value: staleCount,
            accent: staleCount > 0,
          },
          { label: 'OPEN_ISSUES', value: totalIssues, accent: false },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-bg-secondary border rounded-md p-4 ${
              card.accent
                ? 'border-status-stale-border'
                : 'border-border-default'
            }`}
          >
            <p className="font-mono text-xs text-text-disabled mb-2">
              {card.label}
            </p>
            <p
              className={`font-mono text-3xl font-bold ${
                card.accent ? 'text-status-stale-text' : 'text-text-primary'
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main content — 2/3 table + 1/3 commits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Repository index table */}
        <div className="md:col-span-2 bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Repository_Index
            </p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
            {['NAME', 'STATUS', 'LAST_COMMIT', 'ISSUES'].map((col) => (
              <p key={col} className="font-mono text-xs text-text-disabled">
                {col}
              </p>
            ))}
          </div>

          {/* Table rows */}
          {userRepos.slice(0, 8).map((repo, i) => (
            <div
              key={repo.id}
              className={`grid grid-cols-4 px-4 py-2.5 items-center hover:bg-bg-hover transition-colors ${
                i < Math.min(userRepos.length, 8) - 1
                  ? 'border-b border-border-default'
                  : ''
              }`}
            >
              <p className="font-mono text-xs text-text-primary truncate">
                {repo.name}
              </p>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-sm border w-fit ${statusStyle[repo.status]}`}
              >
                {repo.status.toUpperCase()}
              </span>
              <p className="font-mono text-xs text-text-muted">
                {repo.lastCommitAt
                  ? new Date(repo.lastCommitAt).toLocaleDateString()
                  : '—'}
              </p>
              <p className="font-mono text-xs text-text-muted">
                {repo.openIssues > 0 ? `${repo.openIssues} open` : '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Recent commits panel */}
        <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Recent_Commits
            </p>
          </div>

          <div className="divide-y divide-border-default">
            {recentCommits.map((commit) => (
              <a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                <p className="font-mono text-xs text-accent-green mb-1 truncate">
                  {commit.repoName}
                </p>
                <p className="font-mono text-xs text-text-secondary truncate">
                  {commit.message}
                </p>
                <p className="font-mono text-xs text-text-disabled mt-1">
                  {new Date(commit.committedAt).toLocaleDateString()}
                </p>
              </a>
            ))}

            {recentCommits.length === 0 && (
              <p className="px-4 py-6 font-mono text-xs text-text-disabled">
                // no commits yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-8 pt-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-disabled">
          ● CONNECTION STABLE | LATENCY: 14MS
        </p>
      </div>
    </div>
  );
}
