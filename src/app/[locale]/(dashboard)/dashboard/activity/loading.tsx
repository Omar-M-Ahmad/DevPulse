export default function ActivityLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-24 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-7 w-10 bg-bg-secondary border border-border-default rounded-sm animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Timeline groups */}
      {[1, 2].map((group) => (
        <div key={group} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-3 w-20 bg-bg-secondary rounded-sm animate-pulse" />
            <div className="flex-1 h-px bg-border-default" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-2.5 border-b border-border-default last:border-0"
            >
              <div className="h-3 w-20 bg-bg-secondary rounded-sm animate-pulse shrink-0" />
              <div className="h-3 w-56 bg-bg-secondary rounded-sm animate-pulse flex-1" />
              <div className="h-3 w-12 bg-bg-secondary rounded-sm animate-pulse shrink-0" />
              <div className="h-3 w-16 bg-bg-secondary rounded-sm animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
