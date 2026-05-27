import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const session = await auth();

  const locales = routing.locales;
  const pathnameWithoutLocale = locales.reduce(
    (path, locale) => path.replace(new RegExp(`^\\/${locale}(\\/|$)`), '/'),
    pathname,
  );

  const isProtected = pathnameWithoutLocale.startsWith('/dashboard');
  const isAuthPage = pathnameWithoutLocale === '/auth';

  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL(`/${request.nextUrl.locale || ''}/auth`, request.url),
    );
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(
      new URL(`/${request.nextUrl.locale || ''}/dashboard`, request.url),
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
