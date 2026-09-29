import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gameId, questionIds } = await req.json()
  if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 })

  const d = db()
  const playerId = session.user.id

  const save = d.transaction(() => {
    d.prepare(`DELETE FROM player_truths WHERE player_id = ? AND game_id = ?`).run(playerId, gameId)
    const insert = d.prepare(
      `INSERT INTO player_truths (player_id, game_id, question_id) VALUES (?, ?, ?)`
    )
    for (const qid of (questionIds ?? [])) {
      insert.run(playerId, gameId, qid)
    }
  })
  save()

  return NextResponse.json({ ok: true })
}
