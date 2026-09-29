import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const session = await getSession()
  const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim())
  if (!session || !adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { gameId } = await params
  const d = db()

  const game = d.prepare(`SELECT * FROM games WHERE id = ?`).get(gameId)
  const analytics = d.prepare(`SELECT * FROM game_analytics WHERE game_id = ?`).get(gameId)
  const stats = d.prepare(`SELECT * FROM player_game_stats WHERE game_id = ?`).all(gameId)
  const questions = d.prepare(
    `SELECT gq.position, q.text, q.category
     FROM game_questions gq JOIN questions q ON q.id = gq.question_id
     WHERE gq.game_id = ? ORDER BY gq.position`
  ).all(gameId)

  const json = JSON.stringify({ game, questions, analytics, playerStats: stats }, null, 2)

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="flixbingo-${gameId}.json"`,
    },
  })
}
