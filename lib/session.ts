import { cookies } from 'next/headers'

const COOKIE_NAME = 'bingo_session'
const MAX_AGE = 60 * 60 * 24 // 24 hours

async function sign(playerId: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(playerId))
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${playerId}.${b64}`
}

async function verify(token: string): Promise<string | null> {
  const dot = token.indexOf('.')
  if (dot === -1) return null
  const playerId = token.slice(0, dot)
  const expected = await sign(playerId)
  return expected === token ? playerId : null
}

export async function createSession(playerId: string): Promise<void> {
  const token = await sign(playerId)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function getSession(): Promise<{ user: { id: string; name: string } } | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  const playerId = await verify(token)
  if (!playerId) return null
  return { user: { id: playerId, name: '' } }
}

export async function clearSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  if (!session) return false
  const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean)
  return adminIds.includes(session.user.id)
}
