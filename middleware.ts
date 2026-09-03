import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Admin routes require login AND admin email
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/join', req.url))
    }
    const email = req.auth?.user?.email ?? ''
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
    if (!adminEmails.includes(email)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Player routes require login
  if (['/profile', '/lobby', '/card', '/tag'].some(p => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/join', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
