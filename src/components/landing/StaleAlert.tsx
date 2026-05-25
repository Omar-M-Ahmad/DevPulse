import Link from 'next/link'

export function StaleAlert(): React.JSX.Element {
  return (
    <section className="px-6 max-w-6xl mx-auto pb-20">
      <div className="border border-status-stale-border bg-status-stale-bg rounded-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        {/* Left */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-status-stale-text tracking-widest uppercase">
            [!] stale project detected
          </p>
          <p className="font-mono text-sm text-text-primary">
            learn-rust{' '}
            <span className="text-text-muted">— last commit 91 days ago</span>
          </p>
          <p className="font-sans text-xs text-text-muted max-w-sm">
            This project has gone quiet. Connect GitHub to get alerts like this
            before your repos fade into the void.
          </p>
        </div>

        {/* Right */}
        <Link
          href="/auth"
          className="font-mono text-sm text-bg-primary bg-status-stale-text hover:opacity-90 transition-opacity px-5 py-2.5 rounded-sm font-semibold whitespace-nowrap self-start sm:self-auto"
        >
          $ revive-project →
        </Link>

      </div>
    </section>
  )
}