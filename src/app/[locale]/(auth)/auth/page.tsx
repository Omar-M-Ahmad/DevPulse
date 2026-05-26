'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function AuthPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn(): Promise<void> {
    setIsLoading(true);
    await signIn('github');
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-green animate-blink-dot" />
          <span className="font-mono text-sm font-semibold text-text-primary">
            DevPulse
          </span>
        </div>

        <div className="border border-border-default bg-bg-secondary rounded-md p-8">
          <h1 className="font-mono text-xl font-bold text-text-primary mb-2">
            {t('heading')}
          </h1>
          <p className="font-sans text-sm text-text-muted mb-8">
            {t('subheading')}
          </p>

          <div className="bg-bg-terminal border border-border-default rounded-sm p-4 mb-8">
            <p className="font-mono text-xs text-text-muted mb-2">
              // {t('scope_label')}
            </p>
            {['✓ read:user', '✓ repo (read-only)', '✓ read:org'].map(
              (scope) => (
                <p
                  key={scope}
                  className="font-mono text-xs text-status-active-text"
                >
                  {scope}
                </p>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full font-mono text-sm text-bg-primary bg-accent-green hover:bg-accent-green-light disabled:opacity-60 disabled:cursor-not-allowed transition-all py-3 rounded-sm font-semibold"
          >
            {isLoading ? t('processing') : t('cta')}
          </button>

          <p className="font-mono text-xs text-text-disabled text-center mt-4">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
