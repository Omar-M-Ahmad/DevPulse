import Link from 'next/link';

export function Hero(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      {/* Version badge */}
      <div className="mb-8">
        <span className="font-mono text-xs text-text-muted border border-border-default px-3 py-1 rounded-sm">
          {'>'} v1.0.0 — early access
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6 max-w-3xl">
        How many projects did you{' '}
        <span className="text-status-stale-text">quietly abandon?</span>
      </h1>

      <p className="font-sans text-base text-text-secondary max-w-xl mb-10 leading-relaxed">
        DevPulse monitors your GitHub repositories and tells you which projects
        are active, cooling down, or gone stale — before you forget they exist.
      </p>

      {/* CTA buttons */}
      <div className="flex items-center gap-4 mb-16">
        <Link
          href="/auth"
          className="font-mono text-sm text-bg-primary bg-accent-green hover:bg-accent-green-light transition-colors px-6 py-3 rounded-sm font-semibold"
        >
          $ connect --github
        </Link>
        <a
          href="#features"
          className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors border border-border-default hover:border-border-emphasis px-6 py-3 rounded-sm"
        >
          see how it works →
        </a>
      </div>

      {/* Trust stats */}
      <div className="flex items-center gap-8 border-t border-border-default pt-8">
        {[
          { value: '< 30s', label: 'to connect' },
          { value: 'read-only', label: 'GitHub access' },
          { value: 'zero', label: 'code stored' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="font-mono text-lg font-bold text-accent-green">
              {stat.value}
            </p>
            <p className="font-mono text-xs text-text-muted mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
