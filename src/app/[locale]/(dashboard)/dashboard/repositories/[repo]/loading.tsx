export default function RepoLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-4 md:p-6">
      {/* Repo header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-7 w-48 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
          <div className="h-5 w-16 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-16 bg-bg-secondary rounded-sm animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-border-default rounded-md p-4"
          >
            <div className="h-3 w-20 bg-bg-hover rounded-sm animate-pulse mb-3" />
            <div className="h-7 w-12 bg-bg-hover rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-bg-secondary border border-border-default rounded-md p-5 mb-6">
        <div className="h-3 w-40 bg-bg-hover rounded-sm animate-pulse mb-4" />
        <div className="h-32 bg-bg-hover rounded-sm animate-pulse" />
      </div>

      {/* Issues */}
      <div className="bg-bg-secondary border border-border-default rounded-md p-5">
        <div className="h-3 w-28 bg-bg-hover rounded-sm animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-3 py-2.5 border-b border-border-default last:border-0"
          >
            <div className="h-3 w-full bg-bg-hover rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
