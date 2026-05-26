import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { commits, repos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ActivityPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const allCommits = await db
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
    .orderBy(desc(commits.committedAt));

  // Group commits by date label (TODAY / YESTERDAY / date string)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const grouped = allCommits.reduce<Record<string, typeof allCommits>>(
    (acc, commit) => {
      const date = new Date(commit.committedAt);
      let label: string;

      if (date.toDateString() === today.toDateString()) {
        label = 'TODAY';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'YESTERDAY';
      } else {
        label = date
          .toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })
          .toUpperCase();
      }

      if (!acc[label]) acc[label] = [];
      acc[label]!.push(commit);
      return acc;
    },
    {},
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <h1 className="font-mono text-sm font-bold text-text-primary uppercase tracking-widest mb-6">
        ACTIVITY
      </h1>

      {allCommits.length === 0 ? (
        <p className="font-mono text-xs text-text-disabled">
          // no activity found — sync may still be running
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, dayCommits]) => (
            <div key={dateLabel}>
              {/* Date group divider */}
              <div className="flex items-center gap-4 mb-3">
                <p className="font-mono text-xs text-text-disabled uppercase tracking-widest shrink-0">
                  {dateLabel}
                </p>
                <div className="flex-1 h-px bg-border-default" />
              </div>

              {/* Commits for this date */}
              <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
                {dayCommits.map((commit, i) => (
                  <a
                    key={commit.sha}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-bg-hover transition-colors ${
                      i < dayCommits.length - 1
                        ? 'border-b border-border-default'
                        : ''
                    }`}
                  >
                    <p className="font-mono text-xs text-accent-green shrink-0 w-32 truncate">
                      {commit.repoName}
                    </p>
                    <p className="font-mono text-xs text-text-secondary truncate flex-1">
                      {commit.message}
                    </p>
                    <p className="font-mono text-xs text-text-disabled shrink-0">
                      {new Date(commit.committedAt).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                    <p className="font-mono text-xs text-text-disabled shrink-0">
                      {commit.sha.slice(0, 7)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
