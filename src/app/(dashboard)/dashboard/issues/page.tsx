import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { issues, repos, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function IssuesPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  const githubUser = (await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    next: { revalidate: 300 },
  }).then((r) => r.json())) as { id: number };

  const user = await db.query.users.findFirst({
    where: eq(users.githubId, githubUser.id),
  });

  if (!user) redirect('/auth');

  const allIssues = await db
    .select({
      id: issues.id,
      githubNumber: issues.githubNumber,
      title: issues.title,
      labels: issues.labels,
      createdAt: issues.createdAt,
      url: issues.url,
      repoName: repos.name,
    })
    .from(issues)
    .innerJoin(repos, eq(issues.repoId, repos.id))
    .where(eq(repos.userId, user.id))
    .orderBy(desc(issues.createdAt));

  const labelColors: Record<string, string> = {
    bug: 'text-status-stale-text bg-status-stale-bg border-status-stale-border',
    ui: 'text-purple-400 bg-purple-950 border-purple-800',
    enhancement:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    documentation: 'text-blue-400 bg-blue-950 border-blue-800',
    rtl: 'text-status-active-text bg-status-active-bg border-status-active-border',
  };

  function getAge(date: Date): string {
    const days = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return 'today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="font-mono text-sm font-bold text-text-primary uppercase tracking-widest">
          ISSUES
        </h1>
        <span className="font-mono text-xs text-status-cooling-text bg-status-cooling-bg border border-status-cooling-border px-2 py-0.5 rounded-sm">
          {allIssues.length} OPEN
        </span>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
          {['REPO', 'TITLE', 'LABEL', 'AGE'].map((col) => (
            <p key={col} className="font-mono text-xs text-text-disabled">
              {col}
            </p>
          ))}
        </div>

        {allIssues.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-mono text-xs text-text-disabled">
              // no open issues
            </p>
          </div>
        ) : (
          allIssues.map((issue, i) => (
            <a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`grid grid-cols-4 px-4 py-3 items-center hover:bg-bg-hover transition-colors ${
                i < allIssues.length - 1 ? 'border-b border-border-default' : ''
              }`}
            >
              <p className="font-mono text-xs text-accent-green truncate">
                {issue.repoName}
              </p>
              <p className="font-mono text-xs text-text-secondary truncate col-span-1">
                #{issue.githubNumber} {issue.title}
              </p>
              <div className="flex flex-wrap gap-1">
                {issue.labels.slice(0, 2).map((label) => (
                  <span
                    key={label}
                    className={`font-mono text-xs px-2 py-0.5 rounded-sm border ${
                      labelColors[label] ??
                      'text-text-muted bg-bg-hover border-border-default'
                    }`}
                  >
                    {label}
                  </span>
                ))}
                {issue.labels.length === 0 && (
                  <span className="font-mono text-xs text-text-disabled">
                    —
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-text-muted">
                {getAge(new Date(issue.createdAt))}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
