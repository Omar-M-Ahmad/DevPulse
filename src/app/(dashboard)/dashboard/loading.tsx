export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-6">
      <div className="h-4 w-48 bg-bg-secondary border border-border-default rounded-sm mb-8 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-border-default rounded-md p-4"
          >
            <div className="h-3 w-24 bg-bg-hover rounded-sm animate-pulse mb-3" />
            <div className="h-8 w-12 bg-bg-hover rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
