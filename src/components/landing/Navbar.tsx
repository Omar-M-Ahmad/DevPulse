'use client';

import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar(): React.JSX.Element {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function toggleLocale(): void {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/';
    const newPath =
      nextLocale === 'en' ? pathWithoutLocale : `/ar${pathWithoutLocale}`;
    router.push(newPath);
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border-default bg-bg-primary/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-accent-green animate-blink-dot"
            aria-hidden="true"
          />
          <span className="font-mono text-sm font-semibold text-text-primary tracking-tight">
            DevPulse
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* EN/AR toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors border border-border-default hover:border-border-emphasis px-3 py-1.5 rounded-sm"
          >
            {locale === 'en' ? 'AR' : 'EN'}
          </button>

          <Button
            asChild={!isLoggingIn}
            disabled={isLoggingIn}
            onClick={() => setIsLoggingIn(true)}
            className="font-mono text-xs text-bg-primary bg-accent-green hover:bg-accent-green-light transition-colors px-4 py-1.5 rounded-sm font-semibold h-auto"
          >
            {isLoggingIn ? (
              <span>connecting...</span>
            ) : (
              <Link href="/auth">{t('login')}</Link>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
