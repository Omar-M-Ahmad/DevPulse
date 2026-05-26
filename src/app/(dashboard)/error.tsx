'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({
  error,
  reset,
}: ErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex-1 p-6 flex flex-col justify-center items-center min-h-[400px]">
      <div className="bg-bg-secondary border border-status-stale-border rounded-md p-8 max-w-md w-full">
        {/* Error header */}
        <p className="font-mono text-xs text-status-stale-text uppercase tracking-widest mb-4">
          [!] system_error
        </p>

        {/* Error message */}
        <p className="font-mono text-sm text-text-primary mb-2">
          {error.message || 'An unexpected error occurred.'}
        </p>

        {error.digest && (
          <p className="font-mono text-xs text-text-disabled mb-6">
            digest: {error.digest}
          </p>
        )}

        {/* Retry button */}
        <button
          type="button"
          onClick={reset}
          className="font-mono text-xs text-accent-green border border-status-active-border bg-status-active-bg hover:bg-bg-hover px-4 py-2 rounded-sm transition-colors"
        >
          $ retry --force
        </button>
      </div>
    </div>
  );
}
