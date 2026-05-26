import { RepoFilterTabs } from '@/components/dashboard/RepoFilterTabs';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { repos, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type FilterTab = 'all' | 'active' | 'cooling' | 'stale';

interface RepositoriesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function RepositoriesPage({
  searchParams,
}: RepositoriesPageProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  const { filter = 'all' } = await searchParams;

  const githubUser = (await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    next: { revalidate: 300 },
  }).then((r) => r.json())) as { id: number };

  const user = await db.query.users.findFirst({
    where: eq(users.githubId, githubUser.id),
  });

  if (!user) redirect('/auth');

  const allRepos = await db.query.repos.findMany({
    where: eq(repos.userId, user.id),
    orderBy: desc(repos.lastCommitAt),
  });

  const filtered =
    filter === 'all' ? allRepos : allRepos.filter((r) => r.status === filter);

  const counts = {
    all: allRepos.length,
    active: allRepos.filter((r) => r.status === 'active').length,
    cooling: allRepos.filter((r) => r.status === 'cooling').length,
    stale: allRepos.filter((r) => r.status === 'stale').length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'active', label: 'ACTIVE' },
    { key: 'cooling', label: 'COOLING' },
    { key: 'stale', label: 'STALE' },
  ];

  const statusStyle = {
    active:
      'text-status-active-text bg-status-active-bg border-status-active-border',
    cooling:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    stale:
      'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text-primary font-bold">
            {'>'} REPOSITORIES
          </span>
          <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
        </div>
      </div>

      {/* Tabs */}
      <RepoFilterTabs counts={counts} />

      {/* Table */}
      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
          {['NAME', 'STATUS', 'LAST_COMMIT', 'ISSUES'].map((col) => (
            <p key={col} className="font-mono text-xs text-text-disabled">
              {col}
            </p>
          ))}
        </div>

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
      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-xs text-text-disabled">
          SHOWING {filtered.length} OF {allRepos.length}
        </p>
      </div>
    </div>
  );
}
