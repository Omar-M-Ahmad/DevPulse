'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/** Persists the settings form to the user_settings table. */
export async function saveSettings(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.githubId) return;

  const user = await getCurrentUser();
  if (!user) return;

  const staleDays = Number(formData.get('stale_days') ?? 22);
  const issueUrgencyThreshold = Number(formData.get('issue_urgency') ?? 10);
  const emailAlerts = formData.get('email_alerts') === 'on';
  const weeklyDigest = formData.get('weekly_digest') === 'on';
  const terminalTheme = String(formData.get('terminal_theme') ?? 'dark-green');

  await db
    .insert(userSettings)
    .values({
      userId: user.id,
      staleDays,
      issueUrgencyThreshold,
      emailAlerts,
      weeklyDigest,
      terminalTheme,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        staleDays,
        issueUrgencyThreshold,
        emailAlerts,
        weeklyDigest,
        terminalTheme,
        updatedAt: new Date(),
      },
    });

  // Revalidate so the page re-fetches saved values and the layout re-reads the theme
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard', 'layout');
}

/** Purges all cached repo/commit/issue data for the current user. */
export async function purgeCache(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const { repos } = await import('@/lib/db/schema');
  await db.delete(repos).where(eq(repos.userId, user.id));
  revalidatePath('/dashboard', 'layout');
}
