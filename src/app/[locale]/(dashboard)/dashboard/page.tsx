import { db } from '@/lib/db';
import {
  getCurrentUser,
  getLastSyncTime,
  getUserRepos,
} from '@/lib/db/queries';
import { commits, repos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const t = await getTranslations('dashboard');

  const [userRepos, lastSync] = await Promise.all([
    getUserRepos(user.id),
    getLastSyncTime(user.id),
  ]);

  // If no sync has completed yet, show a friendly waiting state.
  // The layout already fired sync in the background — user just needs to refresh.
  if (!lastSync) {
    return <SyncPendingState t={t} />;
  }

  const activeCount = userRepos.filter((r) => r.status === 'active').length;
  const staleCount = userRepos.filter((r) => r.status === 'stale').length;
  const totalIssues = userRepos.reduce((sum, r) => sum + r.openIssues, 0);

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

  const statCards = [
    { label: t('total_repos'), value: userRepos.length, accent: false },
    { label: t('active_instances'), value: activeCount, accent: false },
    { label: t('stale_processes'), value: staleCount, accent: staleCount > 0 },
    { label: t('open_issues'), value: totalIssues, accent: false },
  ];

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-xs text-text-muted">
          {t('system_stat')}
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      {/* Stat cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-bg-secondary border rounded-md p-4 ${
              card.accent
                ? 'border-status-stale-border'
                : 'border-border-default'
            }`}
          >
            <p className="font-mono text-xs text-text-disabled mb-2 truncate">
              {card.label}
            </p>
            <p
              className={`font-mono text-3xl font-bold ${card.accent ? 'text-status-stale-text' : 'text-text-primary'}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Repo table */}
        <div className="md:col-span-2 bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              {t('repo_index')}
            </p>
          </div>

          {/* Table — hidden on mobile */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
              {[
                t('col_name'),
                t('col_status'),
                t('col_last_commit'),
                t('col_issues'),
              ].map((col) => (
                <p key={col} className="font-mono text-xs text-text-disabled">
                  {col}
                </p>
              ))}
            </div>
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
                  {t(
                    `status_${repo.status}` as
                      | 'status_active'
                      | 'status_cooling'
                      | 'status_stale',
                  )}
                </span>
                <p className="font-mono text-xs text-text-muted">
                  {repo.lastCommitAt
                    ? new Date(repo.lastCommitAt).toLocaleDateString()
                    : t('last_commit_never')}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {repo.openIssues > 0
                    ? `${repo.openIssues} ${t('open_issues')}`
                    : t('no_issues')}
                </p>
              </div>
            ))}
          </div>

          {/* Cards — mobile only */}
          <div className="md:hidden divide-y divide-border-default">
            {userRepos.slice(0, 8).map((repo) => (
              <div key={repo.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono text-xs text-text-primary truncate flex-1 me-2">
                    {repo.name}
                  </p>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-sm border shrink-0 ${statusStyle[repo.status]}`}
                  >
                    {t(
                      `status_${repo.status}` as
                        | 'status_active'
                        | 'status_cooling'
                        | 'status_stale',
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="font-mono text-xs text-text-disabled">
                    {repo.lastCommitAt
                      ? new Date(repo.lastCommitAt).toLocaleDateString()
                      : t('last_commit_never')}
                  </p>
                  {repo.openIssues > 0 && (
                    <p className="font-mono text-xs text-text-muted">
                      {repo.openIssues} {t('open_issues')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent commits */}
        <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              {t('recent_commits')}
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
                {t('no_commits')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-disabled">
          {t('connection_stable')}
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Shown when the user just connected and sync hasn't completed yet.
 * The layout fires sync in the background — user refreshes after a few seconds.
 */
function SyncPendingState({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations<'dashboard'>>>;
}): React.JSX.Element {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-bg-secondary border border-border-default rounded-md p-8 max-w-sm w-full text-center">
        {/* Animated dot */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-blink-dot" />
          <span className="font-mono text-xs text-accent-green uppercase tracking-widest">
            {t('sync_running')}
          </span>
        </div>

        <p className="font-mono text-xs text-text-muted mb-6">
          {t('sync_hint')}
        </p>

        {/* Manual refresh button */}
        <a
          href="/dashboard"
          className="font-mono text-xs text-text-primary border border-border-default hover:border-border-emphasis px-4 py-2 rounded-sm transition-colors inline-block"
        >
          {t('sync_refresh')}
        </a>
      </div>
    </div>
  );
}
