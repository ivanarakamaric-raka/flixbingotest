import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scannedPlayerId, squareQuestionId, gameId } = await req.json()
  const taggerId = session.user.id

  if (taggerId === scannedPlayerId) {
    return NextResponse.json({ error: 'You cannot tag yourself' }, { status: 400 })
  }

  const d = db()

  const existingUse = d.prepare(
    `SELECT 1 FROM player_cards
     WHERE player_id = ? AND game_id = ? AND claimed_by_player_id = ? AND claimed_at IS NOT NULL
     LIMIT 1`
  ).get(taggerId, gameId, scannedPlayerId)

  if (existingUse) {
    return NextResponse.json({ error: 'already_used', message: 'You already used this person on your card' }, { status: 400 })
  }

  const truth = d.prepare(
    `SELECT 1 FROM player_truths WHERE player_id = ? AND game_id = ? AND question_id = ?`
  ).get(scannedPlayerId, gameId, squareQuestionId)

  if (!truth) {
    const scannedPlayer = d.prepare(`SELECT name FROM players WHERE id = ?`).get(scannedPlayerId) as { name: string } | undefined
    const firstName = scannedPlayer?.name?.split(' ')[0] ?? 'them'
    return NextResponse.json({
      error: 'no_match',
      message: `This square isn't true for ${firstName}`,
      scannedName: firstName,
    }, { status: 400 })
  }

  d.prepare(
    `UPDATE player_cards SET claimed_at = ?, claimed_by_player_id = ?
     WHERE player_id = ? AND game_id = ? AND question_id = ?`
  ).run(new Date().toISOString(), scannedPlayerId, taggerId, gameId, squareQuestionId)

  const { claimed } = d.prepare(
    `SELECT COUNT(*) as claimed FROM player_cards
     WHERE player_id = ? AND game_id = ? AND claimed_at IS NOT NULL`
  ).get(taggerId, gameId) as { claimed: number }

  const scannedPlayer = d.prepare(`SELECT name FROM players WHERE id = ?`).get(scannedPlayerId) as { name: string } | undefined

  return NextResponse.json({
    success: true,
    bingo: claimed >= 16,
    scannedName: scannedPlayer?.name?.split(' ')[0] ?? '',
  })
}
