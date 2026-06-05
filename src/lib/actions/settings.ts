'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/db/queries';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface SaveSettingsResult {
  success: boolean;
  error?: string;
}

/** Persists the settings form to the user_settings table. */
export async function saveSettings(
  formData: FormData,
): Promise<SaveSettingsResult> {
  const session = await auth();
  if (!session?.githubId) return { success: false, error: 'Not authenticated' };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'User not found' };

  const staleDays = Number(formData.get('stale_days') ?? 22);
  const issueUrgencyThreshold = Number(formData.get('issue_urgency') ?? 10);
  const emailAlerts = formData.get('email_alerts') === 'on';
  const weeklyDigest = formData.get('weekly_digest') === 'on';
  const terminalTheme = String(formData.get('terminal_theme') ?? 'dark-green');

  try {
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

    // Revalidate settings page so saved values reflect immediately
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Save failed',
    };
  }
}

/** Purges all cached repo/commit/issue data for the current user. */
export async function purgeCache(): Promise<SaveSettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'User not found' };

  try {
    const { repos } = await import('@/lib/db/schema');
    await db.delete(repos).where(eq(repos.userId, user.id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Purge failed',
    };
  }
}
