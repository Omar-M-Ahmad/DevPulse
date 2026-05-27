'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface TabLabels {
  all: string;
  active: string;
  cooling: string;
  stale: string;
}

interface RepoFilterTabsProps {
  counts: {
    all: number;
    active: number;
    cooling: number;
    stale: number;
  };
  // Labels passed from the Server Component that has access to t()
  labels: TabLabels;
}

type FilterTab = 'all' | 'active' | 'cooling' | 'stale';

export function RepoFilterTabs({
  counts,
  labels,
}: RepoFilterTabsProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentFilter = (searchParams.get('filter') ?? 'all') as FilterTab;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: labels.all },
    { key: 'active', label: labels.active },
    { key: 'cooling', label: labels.cooling },
    { key: 'stale', label: labels.stale },
  ];

  function handleTabClick(tab: FilterTab): void {
    startTransition(() => {
      router.push(`/dashboard/repositories?filter=${tab}`);
    });
  }

  return (
    <div className="relative mb-4">
      {/* Loading bar */}
      {isPending && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-border-default overflow-hidden">
          <div className="h-full bg-accent-green animate-pulse w-full" />
        </div>
      )}

      <div
        className={`flex items-center gap-0 border-b border-border-default transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}
      >
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              disabled={isPending}
              className={`font-mono text-xs px-4 py-2.5 border-b-2 transition-colors cursor-pointer disabled:cursor-wait ${
                isActive
                  ? 'border-accent-green text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              <span className="ms-1.5 text-text-disabled">
                ({counts[tab.key]})
              </span>
            </button>
          );
        })}

        {/* Pending indicator */}
        {isPending && (
          <span className="ms-auto me-2 font-mono text-xs text-text-disabled animate-pulse">
            loading...
          </span>
        )}
      </div>
    </div>
  );
}