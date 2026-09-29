import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim())
  if (!session || !adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { gameId } = await req.json()
  const d = db()

  const gameQuestions = d.prepare(
    `SELECT question_id FROM game_questions WHERE game_id = ?`
  ).all(gameId) as { question_id: string }[]

  if (gameQuestions.length !== 20) {
    return NextResponse.json({ error: 'Game must have exactly 20 questions' }, { status: 400 })
  }

  const questionIds = gameQuestions.map(q => q.question_id)
  const players = d.prepare(`SELECT id FROM players`).all() as { id: string }[]

  if (!players.length) return NextResponse.json({ error: 'No players found' }, { status: 400 })

  const insertCard = d.prepare(
    `INSERT INTO player_cards (player_id, game_id, question_id, position)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(player_id, game_id, question_id) DO NOTHING`
  )

  const insertAll = d.transaction(() => {
    for (const player of players) {
      const picked = shuffle(questionIds).slice(0, 16)
      picked.forEach((question_id, i) => insertCard.run(player.id, gameId, question_id, i + 1))
    }
  })

  insertAll()

  d.prepare(
    `UPDATE games SET status = 'live', played_at = ? WHERE id = ?`
  ).run(new Date().toISOString(), gameId)

  return NextResponse.json({ success: true })
}
