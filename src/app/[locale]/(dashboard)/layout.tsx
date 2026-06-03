import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLastSyncTime } from '@/lib/db/queries';
import { users } from '@/lib/db/schema';
import { syncUserRepos } from '@/lib/github/sync';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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

  // Fast path: look up existing user row.
  let user = await db.query.users.findFirst({
    where: eq(users.githubId, session.githubId),
  });

  // First login: no DB row yet — fetch GitHub profile and create it.
  if (!user) {
    const profile = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) =>
        r.ok
          ? (r.json() as Promise<{
              id: number;
              login: string;
              name: string | null;
              avatar_url: string;
            }>)
          : null,
      )
      .catch(() => null);

    // Token expired or GitHub unreachable — force re-auth.
    if (!profile) redirect('/auth');

    const [created] = await db
      .insert(users)
      .values({
        githubId: profile.id,
        login: profile.login,
        name: profile.name ?? profile.login,
        avatarUrl: profile.avatar_url,
        accessToken: session.accessToken,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          accessToken: session.accessToken,
          updatedAt: new Date(),
        },
      })
      .returning();

    user = created ?? null;
  }

  if (!user) redirect('/auth');

  // Fire sync in the background — never block page rendering.
  const lastSync = await getLastSyncTime(user.id);
  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    syncUserRepos(user.id, session.accessToken).catch(console.error);
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
