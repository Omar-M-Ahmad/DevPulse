'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '▣' },
  { href: '/dashboard/repositories', label: 'Repos', icon: '⬡' },
  { href: '/dashboard/issues', label: 'Issues', icon: '◎' },
  { href: '/dashboard/activity', label: 'Activity', icon: '≋' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
] as const;

export function MobileNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-secondary border-t border-border-default">
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname.endsWith('/dashboard')
              : pathname.includes(item.href.replace('/dashboard/', ''));

          return (
            /*
             * `relative` is required here — the active indicator span uses
             * `absolute` positioning and needs a positioned ancestor to
             * anchor to. Without it the indicator drifts outside the nav.
             */
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-accent-green'
                  : 'text-text-disabled hover:text-text-muted'
              }`}
            >
              {/* Active indicator line at the top of the nav item */}
              {isActive && (
                <span className="absolute top-0 inset-x-0 h-0.5 bg-accent-green rounded-full" />
              )}

              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}