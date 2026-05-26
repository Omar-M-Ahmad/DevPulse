import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { commits, repos, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  // Get user from DB
  const githubUser = (await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    next: { revalidate: 300 },
  }).then((r) => r.json())) as { id: number };

  const user = await db.query.users.findFirst({
    where: eq(users.githubId, githubUser.id),
  });

  if (!user) redirect('/auth');

  // Get Statistics
  const userRepos = await db.query.repos.findMany({
    where: eq(repos.userId, user.id),
    orderBy: desc(repos.lastCommitAt),
  });

  const activeCount = userRepos.filter((r) => r.status === 'active').length;
  const staleCount = userRepos.filter((r) => r.status === 'stale').length;
  const totalIssues = userRepos.reduce((sum, r) => sum + r.openIssues, 0);

  // Last 10 commits
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

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-muted">
            $ system_stat --verbose
          </span>
          <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
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

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Repo table — 2/3 */}
        <div className="col-span-2 bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Repository_Index
            </p>
          </div>

          <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
            {['NAME', 'STATUS', 'LAST_COMMIT', 'ISSUES'].map((col) => (
              <p key={col} className="font-mono text-xs text-text-disabled">
                {col}
              </p>
            ))}
          </div>

          {userRepos.slice(0, 8).map((repo, i) => {
            const statusStyle = {
              active:
                'text-status-active-text bg-status-active-bg border-status-active-border',
              cooling:
                'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
              stale:
                'text-status-stale-text bg-status-stale-bg border-status-stale-border',
            }[repo.status];

            return (
              <div
                key={repo.id}
                className={`grid grid-cols-4 px-4 py-2.5 items-center hover:bg-bg-hover transition-colors ${
                  i < userRepos.slice(0, 8).length - 1
                    ? 'border-b border-border-default'
                    : ''
                }`}
              >
                <p className="font-mono text-xs text-text-primary truncate">
                  {repo.name}
                </p>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-sm border w-fit ${statusStyle}`}
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
            );
          })}
        </div>

        {/* Recent commits — 1/3 */}
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
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 pt-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-disabled">
          ● CONNECTION STABLE | LATENCY: 14MS
        </p>
      </div>
    </div>
  );
}
