import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { getCurrentUser, getLastSyncTime } from '@/lib/db/queries';
import { syncUserRepos } from '@/lib/github/sync';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// How long (in ms) before we trigger a fresh sync on page visit.
const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.accessToken) redirect('/auth');

  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  // Auto-sync: run in the background if data is stale.
  const lastSync = await getLastSyncTime(user.id);
  const needsSync =
    !lastSync || Date.now() - lastSync.getTime() > SYNC_INTERVAL_MS;

  if (needsSync) {
    if (!lastSync) {
      // First-time user — await so they don't see an empty dashboard
      await syncUserRepos(user.id, session.accessToken).catch(console.error);
    } else {
      // Returning user — sync in background, show current data immediately
      syncUserRepos(user.id, session.accessToken).catch(console.error);
    }
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
