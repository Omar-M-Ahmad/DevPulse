const repos = [
    {
      name: 'portfolio-v3',
      language: 'TypeScript',
      stars: 12,
      lastCommit: '2h ago',
      status: 'active' as const,
      issues: 2,
    },
    {
      name: 'cli-toolkit',
      language: 'Go',
      stars: 47,
      lastCommit: '12d ago',
      status: 'cooling' as const,
      issues: 5,
    },
    {
      name: 'learn-rust',
      language: 'Rust',
      stars: 3,
      lastCommit: '91d ago',
      status: 'stale' as const,
      issues: 0,
    },
  ]
  
  const statusStyles = {
    active: {
      text: 'text-status-active-text',
      bg: 'bg-status-active-bg',
      border: 'border-status-active-border',
      label: 'ACTIVE',
    },
    cooling: {
      text: 'text-status-cooling-text',
      bg: 'bg-status-cooling-bg',
      border: 'border-status-cooling-border',
      label: 'COOLING',
    },
    stale: {
      text: 'text-status-stale-text',
      bg: 'bg-status-stale-bg',
      border: 'border-status-stale-border',
      label: 'STALE',
    },
  }
  
  export function RepoFeed(): React.JSX.Element {
    return (
      <section className="px-6 max-w-6xl mx-auto pb-20">
  
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green animate-blink-dot" />
          <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
            Live_Repository_Feed
          </p>
        </div>
  
        {/* Table */}
        <div className="border border-border-default rounded-md overflow-hidden">
  
          {/* Table header */}
          <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default bg-bg-secondary">
            {['NAME', 'STATUS', 'LAST_COMMIT', 'ISSUES'].map((col) => (
              <p key={col} className="font-mono text-xs text-text-disabled uppercase">
                {col}
              </p>
            ))}
          </div>
  
          {/* Rows */}
          {repos.map((repo, i) => {
            const s = statusStyles[repo.status]
            return (
              <div
                key={repo.name}
                className={`grid grid-cols-4 px-4 py-3 items-center hover:bg-bg-hover transition-colors ${
                  i < repos.length - 1 ? 'border-b border-border-default' : ''
                }`}
              >
                {/* Name */}
                <div className="flex flex-col gap-0.5">
                  <p className="font-mono text-sm text-text-primary">{repo.name}</p>
                  <p className="font-mono text-xs text-text-muted">{repo.language} · ★ {repo.stars}</p>
                </div>
  
                {/* Status badge */}
                <div>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-sm border ${s.text} ${s.bg} ${s.border}`}
                  >
                    {s.label}
                  </span>
                </div>
  
                {/* Last commit */}
                <p className="font-mono text-xs text-text-secondary">{repo.lastCommit}</p>
  
                {/* Issues */}
                <p className={`font-mono text-xs ${repo.issues > 0 ? 'text-status-cooling-text' : 'text-text-muted'}`}>
                  {repo.issues > 0 ? `${repo.issues} open` : '—'}
                </p>
              </div>
            )
          })}
        </div>
  
      </section>
    )
  }