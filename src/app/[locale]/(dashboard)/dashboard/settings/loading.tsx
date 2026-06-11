export default function SettingsLoading(): React.JSX.Element {
  return (
    <div className="flex-1 p-4 md:p-6">
      {/* Top bar */}
      <div className="h-4 w-48 bg-bg-secondary border border-border-default rounded-sm animate-pulse mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {[1, 2, 3].map((section) => (
            <div
              key={section}
              className="bg-bg-secondary border border-border-default rounded-md p-5"
            >
              <div className="h-3 w-32 bg-bg-hover rounded-sm animate-pulse mb-5" />
              <div className="space-y-4">
                {[1, 2].map((field) => (
                  <div key={field}>
                    <div className="h-3 w-40 bg-bg-hover rounded-sm animate-pulse mb-2" />
                    <div className="h-9 w-32 bg-bg-hover border border-border-default rounded-sm animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="h-10 w-36 bg-bg-secondary border border-border-default rounded-sm animate-pulse" />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {[1, 2].map((card) => (
            <div
              key={card}
              className="bg-bg-secondary border border-border-default rounded-md p-5"
            >
              <div className="h-3 w-28 bg-bg-hover rounded-sm animate-pulse mb-4" />
              <div className="h-3 w-36 bg-bg-hover rounded-sm animate-pulse mb-3" />
              <div className="h-8 w-full bg-bg-hover border border-border-default rounded-sm animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
