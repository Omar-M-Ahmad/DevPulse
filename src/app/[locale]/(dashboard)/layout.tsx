import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLastSyncTime } from '@/lib/db/queries';
import { users } from '@/lib/db/schema';
import { syncUserRepos } from '@/lib/github/sync';
import { redirect } from 'next/navigation';
import { after } from 'next/server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SYNC_INTERVAL_MS = 10 * 60 * 1000;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth();

  if (!session?.accessToken || !session?.githubId) {
    redirect('/auth');
  }

  // Always upsert the user — this refreshes the accessToken on every session.
  // Without this, a token stored months ago causes 401 errors on GitHub API calls.
  const [user] = await db
    .insert(users)
    .values({
      githubId: session.githubId,
      login: session.user?.name ?? String(session.githubId),
      name: session.user?.name ?? null,
      avatarUrl: session.user?.image ?? null,
      accessToken: session.accessToken,
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        // Refresh token and name on every login in case they changed
        accessToken: session.accessToken,
        name: session.user?.name ?? null,
        avatarUrl: session.user?.image ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!user) redirect('/auth');

  // Fire sync in the background — never block page rendering.
  const lastSync = await getLastSyncTime(user.id);
  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    // after() runs the callback after the response is sent to the client.
    // On Vercel this keeps the serverless function alive until sync finishes,
    // instead of cutting it off the moment the HTML is flushed.
    after(async () => {
      await syncUserRepos(user.id, session.accessToken).catch(console.error);
    });
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          user={session.user ?? { name: null, email: null, image: null }}
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
