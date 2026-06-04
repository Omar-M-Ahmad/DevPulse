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
      accessToken,
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        accessToken,
        name: session?.user?.name ?? null,
        avatarUrl: session?.user?.image ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!user) redirect('/auth');

  const lastSync = await getLastSyncTime(user.id);
  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    after(async () => {
      await syncUserRepos(user.id, accessToken).catch(console.error);
    });
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Desktop sidebar — hidden on mobile */}
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
