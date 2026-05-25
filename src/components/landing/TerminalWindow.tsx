export function TerminalWindow(): React.JSX.Element {
  const lines = [
    { type: 'cmd', text: '$ devpulse scan --all' },
    { type: 'info', text: '→ scanning 24 repositories...' },
    { type: 'blank', text: '' },
    {
      type: 'active',
      text: '✓ [ACTIVE]   portfolio-v3         last commit: 2h ago',
    },
    {
      type: 'active',
      text: '✓ [ACTIVE]   api-gateway          last commit: 1d ago',
    },
    {
      type: 'cooling',
      text: '~ [COOLING]  cli-toolkit          last commit: 12d ago',
    },
    {
      type: 'stale',
      text: '✗ [STALE]    side-project-2023    last commit: 47d ago',
    },
    {
      type: 'stale',
      text: '✗ [STALE]    learn-rust           last commit: 91d ago',
    },
    { type: 'blank', text: '' },
    {
      type: 'summary',
      text: '→ 2 stale projects detected. run $ devpulse revive to act.',
    },
  ];

  const colorMap: Record<string, string> = {
    cmd: 'text-accent-green',
    info: 'text-text-muted',
    active: 'text-status-active-text',
    cooling: 'text-status-cooling-text',
    stale: 'text-status-stale-text',
    blank: '',
    summary: 'text-text-secondary',
  };

  return (
    <section className="px-6 max-w-6xl mx-auto pb-20">
      <div className="bg-bg-terminal border border-border-default rounded-md overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default">
          <span className="w-3 h-3 rounded-full bg-status-stale-text opacity-80" />
          <span className="w-3 h-3 rounded-full bg-status-cooling-text opacity-80" />
          <span className="w-3 h-3 rounded-full bg-status-active-text opacity-80" />
          <span className="font-mono text-xs text-text-muted ms-3">
            devpulse — zsh
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-6 space-y-1">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`font-mono text-sm ${colorMap[line.type] ?? 'text-text-primary'}`}
            >
              {line.text || '\u00A0'}
            </p>
          ))}
          {/* Blinking cursor */}
          <p className="font-mono text-sm text-accent-green">
            {'$ '}
            <span className="inline-block w-2 h-4 bg-accent-green align-middle animate-blink-cursor" />
          </p>
        </div>
      </div>
    </section>
  );
}
