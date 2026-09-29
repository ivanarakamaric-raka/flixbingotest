import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/session'

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { gameId, questionIds } = await req.json() as { gameId: string; questionIds: string[] }
  if (!gameId || !Array.isArray(questionIds) || questionIds.length !== 20) {
    return NextResponse.json({ error: 'Need exactly 20 question IDs' }, { status: 400 })
  }

  const d = db()
  const upsert = d.transaction(() => {
    d.prepare(`DELETE FROM game_questions WHERE game_id = ?`).run(gameId)
    const insert = d.prepare(
      `INSERT INTO game_questions (game_id, question_id, position) VALUES (?, ?, ?)`
    )
    questionIds.forEach((qId, i) => insert.run(gameId, qId, i + 1))
  })
  upsert()

  return NextResponse.json({ ok: true })
}
