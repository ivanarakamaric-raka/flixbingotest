import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const d = db()

  const game = d.prepare(`SELECT played_at FROM games WHERE id = ?`).get(gameId) as { played_at: string | null } | undefined
  const gameStart = game?.played_at ? new Date(game.played_at).getTime() : null

  const rows = d.prepare(
    `SELECT pc.player_id, pc.claimed_at, p.name
     FROM player_cards pc
     JOIN players p ON p.id = pc.player_id
     WHERE pc.game_id = ? AND pc.claimed_at IS NOT NULL`
  ).all(gameId) as { player_id: string; claimed_at: string; name: string }[]

  const byPlayer = new Map<string, { name: string; times: string[] }>()
  for (const row of rows) {
    if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, { name: row.name, times: [] })
    byPlayer.get(row.player_id)!.times.push(row.claimed_at)
  }

  const scored = Array.from(byPlayer.entries()).map(([playerId, { name, times }]) => {
    const claimed = times.length
    const bingo = claimed >= 16
    const completionTime = bingo && gameStart
      ? Math.floor((Math.max(...times.map(t => new Date(t).getTime())) - gameStart) / 1000)
      : null
    return { playerId, name, claimed, bingo, completionTime }
  })

  scored.sort((a, b) => b.claimed - a.claimed)

  return NextResponse.json(scored)
}
