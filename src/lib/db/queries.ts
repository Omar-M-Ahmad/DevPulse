import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { repos, syncLogs, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { cache } from 'react';

/**
 * React.cache() deduplicates this call within a single request tree.
 * Multiple Server Components calling getCurrentUser() in parallel
 * will share the same DB query result — no extra round-trips.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.githubId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.githubId, session.githubId),
  });

  return user ?? null;
});

/**
 * Returns the timestamp of the last successful sync for a given user.
 * Used by the layout to decide whether auto-sync is needed.
 */
export async function getLastSyncTime(userId: number): Promise<Date | null> {
  const log = await db.query.syncLogs.findFirst({
    where: eq(syncLogs.userId, userId),
    orderBy: desc(syncLogs.createdAt),
  });

  return log?.createdAt ?? null;
}

/**
 * Fetch repos for a user used by multiple dashboard pages.
 */
export async function getUserRepos(userId: number) {
  return db.query.repos.findMany({
    where: eq(repos.userId, userId),
    orderBy: desc(repos.lastCommitAt),
  });
}
