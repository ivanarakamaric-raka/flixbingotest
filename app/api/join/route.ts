import { db } from '@/lib/db'
import { createSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  const trimmed = (name ?? '').trim()
  if (!trimmed) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    const d = db()
    d.prepare(
      `INSERT INTO players (id, name) VALUES (lower(hex(randomblob(16))), ?)
       ON CONFLICT(name) DO NOTHING`
    ).run(trimmed)

    const player = d.prepare(`SELECT id FROM players WHERE name = ?`).get(trimmed) as { id: string } | undefined
    if (!player) return NextResponse.json({ error: 'Could not create player' }, { status: 500 })

    await createSession(player.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not create player' }, { status: 500 })
  }
}
