import { Sidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session) redirect('/auth');

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
