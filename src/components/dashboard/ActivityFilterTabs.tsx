'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type DayFilter = '7' | '30' | '90' | 'all';

interface ActivityFilterTabsProps {
  totalCount: number;
}

const FILTERS: { key: DayFilter; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: '7', label: '7D' },
  { key: '30', label: '30D' },
  { key: '90', label: '90D' },
];

export function ActivityFilterTabs({
  totalCount,
}: ActivityFilterTabsProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = (searchParams.get('days') ?? 'all') as DayFilter;

  function handleClick(key: DayFilter): void {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === 'all') {
        params.delete('days');
      } else {
        params.set('days', key);
      }
      router.push(`/dashboard/activity?${params.toString()}`);
    });
  }

  return (
    <div className="relative mb-6">
      {isPending && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-border-default overflow-hidden">
          <div className="h-full bg-accent-green animate-pulse w-full" />
        </div>
      )}

      <div
        className={`flex items-center justify-between transition-opacity ${isPending ? 'opacity-50' : ''}`}
      >
        {/* Filter tabs */}
        <div className="flex items-center gap-0 border-b border-border-default">
          {FILTERS.map(({ key, label }) => {
            const isActive = current === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleClick(key)}
                disabled={isPending}
                className={`font-mono text-xs px-4 py-2.5 border-b-2 transition-colors cursor-pointer disabled:cursor-wait ${
                  isActive
                    ? 'border-accent-green text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Commit count */}
        <p className="font-mono text-xs text-text-disabled">
          {totalCount} commits
        </p>
      </div>
    </div>
  );
}
