import { RepoFilterTabs } from '@/components/dashboard/RepoFilterTabs';
import { getCurrentUser, getUserRepos } from '@/lib/db/queries';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type FilterTab = 'all' | 'active' | 'cooling' | 'stale';

interface RepositoriesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

const statusStyle = {
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

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-sm text-text-primary font-bold">
          {'>'} REPOSITORIES
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      {/* Filter tabs */}
      <RepoFilterTabs counts={counts} />

      {/* Repository table */}
      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
          {['NAME', 'STATUS', 'LAST_COMMIT', 'ISSUES'].map((col) => (
            <p key={col} className="font-mono text-xs text-text-disabled">
              {col}
            </p>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-mono text-xs text-text-disabled">
              // no repositories found
            </p>
          </div>
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
            </Link>
          ))
        )}
      </div>

      {/* Pagination info */}
      <div className="mt-4">
        <p className="font-mono text-xs text-text-disabled">
          SHOWING {filtered.length} OF {allRepos.length}
        </p>
      </div>
    </div>
  );
}
