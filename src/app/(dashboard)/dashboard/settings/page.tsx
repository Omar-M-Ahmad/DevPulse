import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session) redirect('/auth');

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-xs text-text-muted">
          $ system_config --edit
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — config */}
        <div className="col-span-2 space-y-6">
          {/* Alert thresholds */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              Alert_Thresholds
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs text-text-secondary block mb-2">
                  STALE_DURATION (days)
                </label>
                <input
                  type="number"
                  defaultValue={22}
                  className="font-mono text-sm text-text-primary bg-bg-terminal border border-border-default rounded-sm px-3 py-2 w-32 focus:outline-none focus:border-border-emphasis"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-text-secondary block mb-2">
                  ISSUE_URGENCY_CAP
                </label>
                <input
                  type="number"
                  defaultValue={10}
                  className="font-mono text-sm text-text-primary bg-bg-terminal border border-border-default rounded-sm px-3 py-2 w-32 focus:outline-none focus:border-border-emphasis"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              Notifications
            </p>
            <div className="space-y-3">
              {[
                { label: 'EMAIL_ALERTS', defaultChecked: false },
                { label: 'WEEKLY_DIGEST', defaultChecked: true },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="accent-accent-green"
                  />
                  <span className="font-mono text-xs text-text-secondary">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Display */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              Display_Settings
            </p>
            <div>
              <label className="font-mono text-xs text-text-secondary block mb-2">
                TERMINAL_THEME
              </label>
              <select className="font-mono text-sm text-text-primary bg-bg-terminal border border-border-default rounded-sm px-3 py-2 focus:outline-none focus:border-border-emphasis">
                <option>dark-green (default)</option>
                <option>dark-amber</option>
                <option>dark-blue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right — connection + danger */}
        <div className="space-y-6">
          {/* GitHub connection */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              GitHub_Connection
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <p className="font-mono text-xs text-text-secondary">
                connected as
              </p>
            </div>
            <p className="font-mono text-sm text-text-primary mb-4">
              {session.user?.name ?? session.user?.email}
            </p>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="font-mono text-xs text-text-muted border border-border-default hover:border-border-emphasis hover:text-text-primary px-4 py-2 rounded-sm transition-colors w-full"
              >
                RECONNECT
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-bg-secondary border border-status-stale-border rounded-md p-5">
            <p className="font-mono text-xs text-status-stale-text uppercase tracking-widest mb-4">
              Danger_Zone
            </p>
            <button
              type="button"
              className="font-mono text-xs text-status-stale-text border border-status-stale-border hover:bg-status-stale-bg px-4 py-2 rounded-sm transition-colors w-full"
            >
              PURGE_LOCAL_CACHE
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 pt-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-disabled">
          ● CONNECTION STABLE | LATENCY: 14MS
        </p>
      </div>
    </div>
  );
}
