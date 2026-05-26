import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { commits, issues, repos, users } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

interface RepoPageProps {
  params: Promise<{ repo: string }>;
}

export default async function RepoPage({
  params,
}: RepoPageProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  const { repo: repoName } = await params;

  const githubUser = (await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    next: { revalidate: 300 },
  }).then((r) => r.json())) as { id: number };

  const user = await db.query.users.findFirst({
    where: eq(users.githubId, githubUser.id),
  });

  if (!user) redirect('/auth');

  const repo = await db.query.repos.findFirst({
    where: and(eq(repos.userId, user.id), eq(repos.name, repoName)),
  });

  if (!repo) notFound();

  const repoCommits = await db.query.commits.findMany({
    where: eq(commits.repoId, repo.id),
    orderBy: desc(commits.committedAt),
    limit: 20,
  });

  const repoIssues = await db.query.issues.findMany({
    where: eq(issues.repoId, repo.id),
    orderBy: desc(issues.createdAt),
  });

  const statusStyle = {
    active:
      'text-status-active-text bg-status-active-bg border-status-active-border',
    cooling:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    stale:
      'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  }[repo.status];

  const labelColors: Record<string, string> = {
    bug: 'text-status-stale-text bg-status-stale-bg border-status-stale-border',
    ui: 'text-purple-400 bg-purple-950 border-purple-800',
    enhancement:
      'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
    documentation: 'text-blue-400 bg-blue-950 border-blue-800',
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="font-mono text-2xl font-bold text-text-primary mb-2">
              {repo.name}
            </h1>
            <div className="flex items-center gap-3">
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
            className="font-mono text-xs text-text-muted hover:text-text-primary border border-border-default hover:border-border-emphasis px-3 py-1.5 rounded-sm transition-colors"
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

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL_COMMITS', value: repoCommits.length },
          { label: 'OPEN_ISSUES', value: repo.openIssues },
          { label: 'STARS', value: repo.stars },
          {
            label: 'LAST_COMMIT',
            value: repo.lastCommitAt
              ? new Date(repo.lastCommitAt).toLocaleDateString()
              : '—',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-bg-secondary border border-border-default rounded-md p-4"
          >
            <p className="font-mono text-xs text-text-disabled mb-2">
              {card.label}
            </p>
            <p className="font-mono text-xl font-bold text-text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent commits */}
      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
            Recent_Commits
          </p>
        </div>
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
              <div className="flex items-center gap-4 shrink-0">
                <p className="font-mono text-xs text-text-disabled">
                  {new Date(commit.committedAt).toLocaleDateString()}
                </p>
                <p className="font-mono text-xs text-text-disabled">
                  {commit.sha.slice(0, 7)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Issues */}
      {repoIssues.length > 0 && (
        <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Recent_Issues
            </p>
          </div>
          <div className="divide-y divide-border-default">
            {repoIssues.map((issue) => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors gap-4"
              >
                <p className="font-mono text-xs text-text-secondary truncate flex-1">
                  #{issue.githubNumber} {issue.title}
                </p>
                <div className="flex items-center gap-2 shrink-0">
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
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="font-mono text-xs text-text-disabled mt-8">
        // devpulse is read-only. all actions open github.
      </p>
    </div>
  );
}
