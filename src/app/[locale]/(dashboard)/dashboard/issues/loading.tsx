export default function IssuesLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-5 w-24 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
        <div className="h-5 w-16 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-7 w-24 bg-bg-secondary border border-border-default rounded-sm animate-pulse"
          />
        ))}
      </div>

      {/* Table */}
      <div className="border border-border-default rounded-md overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default bg-bg-secondary">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-3 w-16 bg-bg-hover rounded-sm animate-pulse"
            />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-4 py-3 items-center border-b border-border-default last:border-0"
          >
            <div className="h-3 w-24 bg-bg-secondary rounded-sm animate-pulse" />
            <div className="h-3 w-40 bg-bg-secondary rounded-sm animate-pulse" />
            <div className="h-5 w-16 bg-bg-secondary rounded-sm animate-pulse" />
            <div className="h-3 w-12 bg-bg-secondary rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
