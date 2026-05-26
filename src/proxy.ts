import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isProtected = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/auth'

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
