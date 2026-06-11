interface DayBar {
  date: string; // e.g. "Mon 6/2"
  count: number;
}

interface CommitChartProps {
  data: DayBar[];
  label: string;
}

export function CommitChart({
  data,
  label,
}: CommitChartProps): React.JSX.Element {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-bg-secondary border border-border-default rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
          {label}
        </p>
        <p className="font-mono text-xs text-text-disabled">
          {data.reduce((s, d) => s + d.count, 0)} commits
        </p>
      </div>

      {/* Chart */}
      <div className="px-4 py-4">
        <div className="flex items-end gap-0.5 h-20">
          {data.map((day) => {
            const heightPct = max > 0 ? (day.count / max) * 100 : 0;
            const isToday = day.date === data[data.length - 1]?.date;

            return (
              <div
                key={day.date}
                className="group relative flex-1 flex flex-col items-center justify-end h-full"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-sm transition-all ${
                    day.count === 0
                      ? 'bg-border-default'
                      : isToday
                        ? 'bg-accent-green'
                        : 'bg-accent-green opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, day.count > 0 ? 8 : 2)}%`,
                  }}
                />

                {/* Tooltip on hover */}
                {day.count > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                    <div className="bg-bg-hover border border-border-emphasis rounded-sm px-2 py-1 whitespace-nowrap">
                      <p className="font-mono text-xs text-text-primary">
                        {day.count}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* X-axis — show first, middle, and last label only */}
        <div className="flex justify-between mt-2">
          <p className="font-mono text-[9px] text-text-disabled">
            {data[0]?.date}
          </p>
          <p className="font-mono text-[9px] text-text-disabled">
            {data[Math.floor(data.length / 2)]?.date}
          </p>
          <p className="font-mono text-[9px] text-accent-green">
            {data[data.length - 1]?.date}
          </p>
        </div>
      </div>
    </div>
  );
}
