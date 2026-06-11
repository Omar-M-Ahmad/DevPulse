import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { db } from '@/lib/db';
import { getLastSyncTime, getUserSettings } from '@/lib/db/queries';
import { users } from '@/lib/db/schema';
import { syncUserRepos } from '@/lib/github/sync';
import { redirect } from 'next/navigation';
import { after } from 'next/server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SYNC_INTERVAL_MS = 10 * 60 * 1000;

/** Maps the saved terminalTheme slug to a CSS accent color. */
const THEME_ACCENT: Record<string, string> = {
  'dark-green': '#4ade80',
  'dark-amber': '#fbbf24',
  'dark-blue': '#60a5fa',
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth();

  const accessToken = session?.accessToken;
  const githubId = session?.githubId;

  if (!accessToken || !githubId) {
    redirect('/auth');
  }

  const [user] = await db
    .insert(users)
    .values({
      githubId,
      login: session?.user?.name ?? String(githubId),
      name: session?.user?.name ?? null,
      avatarUrl: session?.user?.image ?? null,
      // Encrypt the token before persisting — never store OAuth tokens as plain text.
      accessToken: encrypt(accessToken),
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        accessToken: encrypt(accessToken),
        name: session?.user?.name ?? null,
        avatarUrl: session?.user?.image ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!user) redirect('/auth');

  // Load user settings and sync state in parallel
  const [savedSettings, lastSync] = await Promise.all([
    getUserSettings(user.id),
    getLastSyncTime(user.id),
  ]);

  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    // Pass the plain accessToken from session (already decrypted by Auth.js)
    // — no need to decrypt from DB since we have it in scope here.
    after(async () => {
      await syncUserRepos(user.id, accessToken).catch(console.error);
    });
  }

  // Apply the user's saved theme by overriding --accent-green at runtime.
  // All components reference var(--accent-green) so a single override here
  // changes the accent colour across the entire dashboard instantly.
  const themeSlug = savedSettings?.terminalTheme ?? 'dark-green';
  const accentColor = THEME_ACCENT[themeSlug] ?? THEME_ACCENT['dark-green'];
  const themeStyle = {
    '--color-accent-green': accentColor,
  } as React.CSSProperties;

  return (
    <div className="flex min-h-screen bg-bg-primary" style={themeStyle}>
      <div className="hidden md:flex">
        <Sidebar
          user={session?.user ?? { name: null, email: null, image: null }}
        />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav />
    </div>
  );
}
