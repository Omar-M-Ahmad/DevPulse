'use client';

import type { User } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: User;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '▣' },
  { href: '/dashboard/repositories', label: 'Repositories', icon: '⬡' },
  { href: '/dashboard/issues', label: 'Issues', icon: '◎' },
  { href: '/dashboard/activity', label: 'Activity', icon: '≋' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar({ user }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-e border-border-default bg-bg-secondary flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-blink-dot" />
          <span className="font-mono text-sm font-semibold text-text-primary">
            DevPulse_Root
          </span>
        </div>
        <p className="font-mono text-xs text-text-disabled ms-4">
          v1.0.4-stable
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 font-mono text-xs transition-colors border-s-2 ${
                isActive
                  ? 'border-accent-green text-text-primary bg-bg-hover'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <span
                className={
                  isActive ? 'text-accent-green' : 'text-text-disabled'
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-secondary truncate">
          @{user.name ?? user.email}
        </p>
        <p className="font-mono text-xs text-text-disabled mt-0.5">
          ADMINISTRATOR
        </p>
      </div>
    </aside>
  );
}
