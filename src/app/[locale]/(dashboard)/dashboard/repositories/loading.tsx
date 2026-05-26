export default function RepositoriesLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-6">
      <div className="h-6 w-48 bg-bg-secondary border border-border-default rounded-sm mb-6 animate-pulse" />

      <div className="flex gap-4 mb-6 border-b border-border-default pb-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-bg-secondary border border-border-default rounded-sm animate-pulse"
          />
        ))}
      </div>

      <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border-default">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-3 w-16 bg-bg-hover rounded-sm animate-pulse"
            />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-4 py-3 border-b border-border-default"
          >
            <div className="h-3 w-32 bg-bg-hover rounded-sm animate-pulse" />
            <div className="h-5 w-16 bg-bg-hover rounded-sm animate-pulse" />
            <div className="h-3 w-20 bg-bg-hover rounded-sm animate-pulse" />
            <div className="h-3 w-12 bg-bg-hover rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
