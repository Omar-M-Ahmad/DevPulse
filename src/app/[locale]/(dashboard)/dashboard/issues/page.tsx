import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { issues, repos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Map known GitHub label names to terminal-style color tokens. */
const LABEL_COLORS: Record<string, string> = {
  bug: 'text-status-stale-text bg-status-stale-bg border-status-stale-border',
  ui: 'text-purple-400 bg-purple-950 border-purple-800',
  enhancement:
    'text-status-cooling-text bg-status-cooling-bg border-status-cooling-border',
  documentation: 'text-blue-400 bg-blue-950 border-blue-800',
  rtl: 'text-status-active-text bg-status-active-bg border-status-active-border',
};

/** Returns a human-readable relative age string for a given date. */
function getAge(date: Date): string {
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

// ─── page ────────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Issues — DevPulse',
    description: 'View all open issues across your repositories.',
  };
}

export default async function IssuesPage(): Promise<React.JSX.Element> {
  // Use the cached helper instead of a raw GitHub API call on every render.
  // getCurrentUser() reads the session + DB in one place and is deduplicated
  // via React.cache(), so calling it here costs nothing if the layout already
  // called it in the same request tree.
  const user = await getCurrentUser();
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

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="font-mono text-sm font-bold text-text-primary uppercase tracking-widest">
          ISSUES
        </h1>
        <span className="font-mono text-xs text-status-cooling-text bg-status-cooling-bg border border-status-cooling-border px-2 py-0.5 rounded-sm">
          {allIssues.length} OPEN
        </span>
      </div>

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
          {['REPO', 'TITLE', 'LABEL', 'AGE'].map((col) => (
            <p key={col} className="font-mono text-xs text-text-disabled">
              {col}
            </p>
          ))}
        </div>

        {allIssues.length === 0 ? (
          <EmptyState />
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
              <p className="font-mono text-xs text-accent-green truncate pe-2">
                {issue.repoName}
              </p>
              <p className="font-mono text-xs text-text-secondary truncate pe-2">
                #{issue.githubNumber} {issue.title}
              </p>
              <LabelBadges labels={issue.labels} />
              <p className="font-mono text-xs text-text-muted">
                {getAge(new Date(issue.createdAt))}
              </p>
            </a>
          ))
        )}
      </div>

      {/* ── Mobile cards (< md) ── */}
      <div className="md:hidden bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        {allIssues.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border-default">
            {allIssues.map((issue) => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                {/* Repo name + age on same row */}
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono text-xs text-accent-green truncate flex-1 me-2">
                    {issue.repoName}
                  </p>
                  <p className="font-mono text-xs text-text-disabled shrink-0">
                    {getAge(new Date(issue.createdAt))}
                  </p>
                </div>

                {/* Issue title */}
                <p className="font-mono text-xs text-text-secondary truncate mb-2">
                  #{issue.githubNumber} {issue.title}
                </p>

                {/* Labels */}
                <LabelBadges labels={issue.labels} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

/** Renders up to 2 label badges for an issue. */
function LabelBadges({ labels }: { labels: string[] }): React.JSX.Element {
  if (labels.length === 0) {
    return <span className="font-mono text-xs text-text-disabled">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {labels.slice(0, 2).map((label) => (
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
  );
}

/** Shown when the issues list is empty. */
function EmptyState(): React.JSX.Element {
  return (
    <div className="px-4 py-12 text-center">
      <p className="font-mono text-xs text-text-disabled">// no open issues</p>
    </div>
  );
}
