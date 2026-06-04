import { RepoFilterTabs } from '@/components/dashboard/RepoFilterTabs';
import { getCurrentUser, getUserRepos } from '@/lib/db/queries';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type FilterTab = 'all' | 'active' | 'cooling' | 'stale';

interface RepositoriesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

const STATUS_STYLE = {
  active:
    'text-status-active-text bg-status-active-bg border-status-active-border',
  cooling:
    'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
  stale: 'text-status-stale-text bg-status-stale-bg border-status-stale-border',
} as const;

export default async function RepositoriesPage({
  searchParams,
}: RepositoriesPageProps): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const t = await getTranslations('dashboard');
  const { filter = 'all' } = await searchParams;

  const allRepos = await getUserRepos(user.id);

  // Filter repos based on active tab
  const filtered =
    filter === 'all'
      ? allRepos
      : allRepos.filter((r) => r.status === (filter as FilterTab));

  const counts = {
    all: allRepos.length,
    active: allRepos.filter((r) => r.status === 'active').length,
    cooling: allRepos.filter((r) => r.status === 'cooling').length,
    stale: allRepos.filter((r) => r.status === 'stale').length,
  };

  // Tab labels come from the server — RepoFilterTabs is a Client Component
  // and cannot call t() directly, so we pass the strings from here.
  const tabLabels = {
    all: t('tab_all'),
    active: t('tab_active'),
    cooling: t('tab_cooling'),
    stale: t('tab_stale'),
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-sm text-text-primary font-bold">
          {'>'} {t('repositories_title')}
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      {/* Filter tabs — labels passed from server */}
      <RepoFilterTabs counts={counts} labels={tabLabels} />

      {/* Desktop table (md+) */}
      <div className="hidden md:block bg-bg-secondary border border-border-default rounded-md overflow-hidden">
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

        {filtered.length === 0 ? (
          <EmptyState label={t('no_repos')} />
        ) : (
          filtered.map((repo, i) => (
            <Link
              key={repo.id}
              href={`/dashboard/repositories/${repo.name}`}
              className={`grid grid-cols-4 px-4 py-3 items-center hover:bg-bg-hover transition-colors ${
                i < filtered.length - 1 ? 'border-b border-border-default' : ''
              }`}
            >
              <div>
                <p className="font-mono text-xs text-text-primary">
                  {repo.name}
                </p>
                {repo.language && (
                  <p className="font-mono text-xs text-text-disabled mt-0.5">
                    {repo.language}
                  </p>
                )}
              </div>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-sm border w-fit ${STATUS_STYLE[repo.status]}`}
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
                  : '—'}
              </p>
              <p className="font-mono text-xs text-text-muted">
                {repo.openIssues > 0
                  ? `${repo.openIssues} ${t('open_issues')}`
                  : '—'}
              </p>
            </Link>
          ))
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState label={t('no_repos')} />
        ) : (
          <div className="divide-y divide-border-default">
            {filtered.map((repo) => (
              <Link
                key={repo.id}
                href={`/dashboard/repositories/${repo.name}`}
                className="block px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-mono text-xs text-text-primary truncate flex-1 me-2">
                    {repo.name}
                  </p>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-sm border shrink-0 ${STATUS_STYLE[repo.status]}`}
                  >
                    {t(
                      `status_${repo.status}` as
                        | 'status_active'
                        | 'status_cooling'
                        | 'status_stale',
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <p className="font-mono text-xs text-text-disabled">
                      {repo.language}
                    </p>
                  )}
                  <p className="font-mono text-xs text-text-disabled">
                    {repo.lastCommitAt
                      ? new Date(repo.lastCommitAt).toLocaleDateString()
                      : '—'}
                  </p>
                  {repo.openIssues > 0 && (
                    <p className="font-mono text-xs text-status-cooling-text">
                      {repo.openIssues} {t('open_issues')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="font-mono text-xs text-text-disabled">
          {t('showing_count', {
            current: filtered.length,
            total: allRepos.length,
          })}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="px-4 py-12 text-center">
      <p className="font-mono text-xs text-text-disabled">{label}</p>
    </div>
  );
}
