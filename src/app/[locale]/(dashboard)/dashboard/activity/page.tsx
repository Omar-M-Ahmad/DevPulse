import { ActivityFilterTabs } from '@/components/dashboard/ActivityFilterTabs';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { commits, repos } from '@/lib/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Activity — DevPulse',
    description: 'Explore your commit timeline across all repositories.',
  };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildDateLabel(date: Date, locale: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const toKey = (d: Date) => d.toDateString();

  if (toKey(date) === toKey(today)) return locale === 'ar' ? 'اليوم' : 'TODAY';
  if (toKey(date) === toKey(yesterday))
    return locale === 'ar' ? 'أمس' : 'YESTERDAY';

  // Use locale-aware date formatting for older dates
  return date
    .toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

/** Returns a Date set to midnight N days ago. */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface ActivityPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ days?: string }>;
}

export default async function ActivityPage({
  params,
  searchParams,
}: ActivityPageProps): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const t = await getTranslations('dashboard');
  const { locale } = await params;
  const { days: daysParam } = await searchParams;

  // Build the date cutoff from ?days= param (7 | 30 | 90 | undefined = all)
  const dayCount = daysParam ? parseInt(daysParam, 10) : null;
  const cutoff = dayCount && !isNaN(dayCount) ? daysAgo(dayCount) : null;

  const baseCondition = eq(repos.userId, user.id);
  const dateCondition = cutoff
    ? and(baseCondition, gte(commits.committedAt, cutoff))
    : baseCondition;

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
    .where(dateCondition)
    .orderBy(desc(commits.committedAt));

  // Group commits by human-readable date label
  const grouped = allCommits.reduce<Record<string, typeof allCommits>>(
    (acc, commit) => {
      const label = buildDateLabel(new Date(commit.committedAt), locale);
      if (!acc[label]) acc[label] = [];
      acc[label]!.push(commit);
      return acc;
    },
    {},
  );

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      {/* ── Header ── */}
      <h1 className="font-mono text-sm font-bold text-text-primary uppercase tracking-widest mb-6">
        {t('activity_title')}
      </h1>

      {/* ── Filter tabs ── */}
      <ActivityFilterTabs totalCount={allCommits.length} />

      {allCommits.length === 0 ? (
        <p className="font-mono text-xs text-text-disabled mt-8">
          {t('no_activity')}
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
                    className={`flex items-start gap-3 md:items-center md:gap-4 px-4 py-3 hover:bg-bg-hover transition-colors ${
                      i < dayCommits.length - 1
                        ? 'border-b border-border-default'
                        : ''
                    }`}
                  >
                    {/* Repo name — fixed width on desktop, full width label on mobile */}
                    <p className="font-mono text-xs text-accent-green shrink-0 w-24 md:w-32 truncate">
                      {commit.repoName}
                    </p>

                    {/* Commit message — takes remaining space */}
                    <p className="font-mono text-xs text-text-secondary truncate flex-1">
                      {commit.message}
                    </p>

                    {/* Time + SHA — hidden on small screens to avoid overflow */}
                    <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0">
                      <p className="font-mono text-xs text-text-disabled">
                        {new Date(commit.committedAt).toLocaleTimeString(
                          locale === 'ar' ? 'ar-SA' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </p>
                      <p className="font-mono text-xs text-text-disabled">
                        {commit.sha.slice(0, 7)}
                      </p>
                    </div>
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
