const features = [
    {
      index: '01',
      title: 'Repo Health Status',
      description:
        'Every repository gets a status: active, cooling, or stale — based on real commit activity, not guesses.',
    },
    {
      index: '02',
      title: 'Stale Alerts',
      description:
        'Get notified when a project crosses your custom threshold. Never lose a repo to silence again.',
    },
    {
      index: '03',
      title: 'Unified Issue View',
      description:
        'See all open issues across every repo in one place, sorted by age and urgency.',
    },
    {
      index: '04',
      title: 'Commit Timeline',
      description:
        'A full activity log across all your projects — grouped by date, filterable by repo.',
    },
  ]
  
  export function FeaturesGrid(): React.JSX.Element {
    return (
      <section id="features" className="px-6 max-w-6xl mx-auto pb-24">
  
        {/* Section label */}
        <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-8">
          // capabilities
        </p>
  
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-default border border-border-default rounded-md overflow-hidden">
          {features.map((f) => (
            <div
              key={f.index}
              className="bg-bg-secondary p-6 hover:bg-bg-hover transition-colors"
            >
              <p className="font-mono text-xs text-text-disabled mb-4">
                [{f.index}]
              </p>
              <p className="font-mono text-sm text-text-primary font-semibold mb-2">
                {f.title}
              </p>
              <p className="font-sans text-xs text-text-muted leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
  
      </section>
    )
  }