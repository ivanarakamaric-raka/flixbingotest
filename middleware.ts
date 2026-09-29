import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'bingo_session'

function hasSession(req: NextRequest): boolean {
  return !!req.cookies.get(COOKIE_NAME)?.value
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authenticated = hasSession(req)

  if (pathname.startsWith('/admin')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/join', req.url))
    }
  }

  if (['/profile', '/lobby', '/card', '/tag'].some(p => pathname.startsWith(p))) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/join', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
