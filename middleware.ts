import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'bingo_session'

function getPlayerId(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const dot = token.indexOf('.')
  return dot === -1 ? null : token.slice(0, dot)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const playerId = getPlayerId(req)
  const authenticated = !!playerId

  if (pathname.startsWith('/admin')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/join', req.url))
    }
    const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean)
    if (!adminIds.includes(playerId!)) {
      return NextResponse.redirect(new URL('/', req.url))
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
