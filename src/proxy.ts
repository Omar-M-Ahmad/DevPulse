import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Never intercept API routes — Auth.js session cookie is written
  // during /api/auth/callback and must not be interrupted.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Strip locale prefix to get the canonical pathname.
  const pathnameWithoutLocale = routing.locales.reduce(
    (path, locale) => path.replace(new RegExp(`^\\/${locale}(\\/|$)`), '/'),
    pathname,
  );

  const isProtected = pathnameWithoutLocale.startsWith('/dashboard');
  const isAuthPage = pathnameWithoutLocale === '/auth';

  // Public pages — no auth check needed.
  if (!isProtected && !isAuthPage) {
    return intlMiddleware(request);
  }

  const session = await auth();

  // Detect active locale from URL.
  // request.nextUrl.locale is unreliable with next-intl's as-needed mode.
  const activeLocale =
    routing.locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
    ) ?? routing.defaultLocale;

  // Build locale-aware path.
  // Default locale (en) has no prefix under as-needed mode.
  const withLocale = (path: string): string =>
    activeLocale === routing.defaultLocale ? path : `/${activeLocale}${path}`;

  if (isProtected && !session) {
    return NextResponse.redirect(new URL(withLocale('/auth'), request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(
      new URL(withLocale('/dashboard'), request.url),
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
