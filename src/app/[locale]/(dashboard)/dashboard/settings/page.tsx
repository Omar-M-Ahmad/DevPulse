import { auth, signOut } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session) redirect('/auth');

  const t = await getTranslations('dashboard');

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-2 mb-6 md:mb-8">
        <span className="font-mono text-xs text-text-muted">
          {t('system_config')}
        </span>
        <span className="inline-block w-2 h-4 bg-text-muted animate-blink-cursor" />
      </div>

      {/*
        Single column on mobile, two-column grid on md+.
        Left column (config) takes 2/3, right column (connection) takes 1/3.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left — configuration panels ── */}
        <div className="md:col-span-2 space-y-6">
          {/* Alert thresholds */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              {t('alert_thresholds')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs text-text-secondary block mb-2">
                  {t('stale_duration')}
                </label>
                <input
                  type="number"
                  defaultValue={22}
                  className="font-mono text-sm text-text-primary bg-bg-terminal border border-border-default rounded-sm px-3 py-2 w-32 focus:outline-none focus:border-border-emphasis"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-text-secondary block mb-2">
                  {t('issue_urgency')}
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
              {t('notifications')}
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

          {/* Display — TERMINAL_THEME with visual preview */}
          <TerminalThemeSelector />
        </div>

        {/* ── Right — connection + danger ── */}
        <div className="space-y-6">
          {/* GitHub connection */}
          <div className="bg-bg-secondary border border-border-default rounded-md p-5">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              {t('github_connection')}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <p className="font-mono text-xs text-text-secondary">
                {t('connected_as')}
              </p>
            </div>
            <p className="font-mono text-sm text-text-primary mb-4 truncate">
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
                {t('reconnect')}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-bg-secondary border border-status-stale-border rounded-md p-5">
            <p className="font-mono text-xs text-status-stale-text uppercase tracking-widest mb-4">
              {t('danger_zone')}
            </p>
            <button
              type="button"
              className="font-mono text-xs text-status-stale-text border border-status-stale-border hover:bg-status-stale-bg px-4 py-2 rounded-sm transition-colors w-full"
            >
              {t('purge_cache')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="mt-8 pt-4 border-t border-border-default">
        <p className="font-mono text-xs text-text-disabled">
          {t('connection_stable')}
        </p>
      </div>
    </div>
  );
}

// ─── Terminal Theme Selector ──────────────────────────────────────────────────

async function TerminalThemeSelector(): Promise<React.JSX.Element> {
  const t = await getTranslations('dashboard');

  const themes = [
    { id: 'dark-green', label: 'dark-green (default)', accent: '#4ade80' },
    { id: 'dark-amber', label: 'dark-amber', accent: '#fbbf24' },
    { id: 'dark-blue', label: 'dark-blue', accent: '#60a5fa' },
  ] as const;

  return (
    <div className="bg-bg-secondary border border-border-default rounded-md p-5">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
        {t('display_settings')}
      </p>
      <label className="font-mono text-xs text-text-secondary block mb-3">
        {t('terminal_theme')}
      </label>

      <div className="space-y-2">
        {themes.map((theme, i) => (
          <label
            key={theme.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="radio"
              name="terminal_theme"
              value={theme.id}
              defaultChecked={i === 0}
              className="accent-accent-green"
            />
            <span
              className="w-4 h-4 rounded-sm border border-border-emphasis shrink-0"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors">
              {theme.label}
            </span>
          </label>
        ))}
      </div>

      <p className="font-mono text-xs text-text-disabled mt-4">
        // full theme switching coming in v1.1
      </p>
    </div>
  );
}
