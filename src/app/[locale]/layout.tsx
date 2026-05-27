import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { getCurrentUser, getLastSyncTime } from '@/lib/db/queries';
import { syncUserRepos } from '@/lib/github/sync';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// How long (in ms) before we trigger a background refresh.
const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  // Always fire sync in the background — never block the render.
  // First-time users will see an empty dashboard with a loading state
  // (handled in dashboard/page.tsx) while sync runs behind the scenes.
  const lastSync = await getLastSyncTime(user.id);
  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    // Fire-and-forget: do NOT await. The page renders immediately.
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
