import { db } from '@/lib/db'
import { hashPlayer } from '@/lib/hash'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.ANONYMIZE_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const specificGameId: string | undefined = body.gameId

  const d = db()

  const games = specificGameId
    ? d.prepare(`SELECT id, played_at FROM games WHERE status = 'ended' AND id = ?`).all(specificGameId) as { id: string; played_at: string }[]
    : d.prepare(`SELECT id, played_at FROM games WHERE status = 'ended' AND played_at < ?`)
        .all(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) as { id: string; played_at: string }[]

  for (const game of games) {
    const cards = d.prepare(
      `SELECT pc.player_id, pc.claimed_at, p.name as player_name
       FROM player_cards pc JOIN players p ON p.id = pc.player_id
       WHERE pc.game_id = ?`
    ).all(game.id) as { player_id: string; claimed_at: string | null; player_name: string }[]

    const byPlayer = new Map<string, { name: string; times: string[] }>()
    for (const row of cards) {
      if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, { name: row.player_name, times: [] })
      if (row.claimed_at) byPlayer.get(row.player_id)!.times.push(row.claimed_at)
    }

    const gameStart = game.played_at ? new Date(game.played_at).getTime() : null
    const upsertStat = d.prepare(
      `INSERT INTO player_game_stats (game_id, player_hash, squares_claimed, completion_seconds, got_bingo)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(game_id, player_hash) DO UPDATE SET
         squares_claimed = excluded.squares_claimed,
         completion_seconds = excluded.completion_seconds,
         got_bingo = excluded.got_bingo`
    )

    const statsRows: { got_bingo: boolean; squares_claimed: number; completion_seconds: number | null }[] = []

    const insertStats = d.transaction(async () => {
      for (const [, { name, times }] of byPlayer.entries()) {
        const hash = await hashPlayer(name, game.id)
        const got_bingo = times.length >= 16
        const completion_seconds = got_bingo && gameStart
          ? Math.floor((Math.max(...times.map(t => new Date(t).getTime())) - gameStart) / 1000)
          : null
        upsertStat.run(game.id, hash, times.length, completion_seconds, got_bingo ? 1 : 0)
        statsRows.push({ got_bingo, squares_claimed: times.length, completion_seconds })
      }
    })
    await insertStats()

    const playerCount = byPlayer.size
    const bingoCount = statsRows.filter(r => r.got_bingo).length
    const completionTimes = statsRows.filter(r => r.completion_seconds !== null).map(r => r.completion_seconds!)
    const avgCompletion = completionTimes.length
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : null

    d.prepare(
      `INSERT INTO game_analytics (game_id, played_at, player_count, bingo_count, avg_completion_seconds, participation_rate)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(game_id) DO UPDATE SET
         player_count = excluded.player_count,
         bingo_count = excluded.bingo_count,
         avg_completion_seconds = excluded.avg_completion_seconds,
         participation_rate = excluded.participation_rate`
    ).run(
      game.id, game.played_at, playerCount, bingoCount, avgCompletion,
      playerCount > 0 ? Math.round((statsRows.filter(r => r.squares_claimed > 0).length / playerCount) * 100) : 0
    )

    d.prepare(`DELETE FROM player_truths WHERE game_id = ?`).run(game.id)
    d.prepare(`DELETE FROM player_cards WHERE game_id = ?`).run(game.id)

    const livePlayerIds = new Set(
      (d.prepare(`SELECT DISTINCT player_id FROM player_cards WHERE game_id != ?`).all(game.id) as { player_id: string }[])
        .map(r => r.player_id)
    )

    const toAnonymize = Array.from(byPlayer.keys()).filter(id => !livePlayerIds.has(id))
    if (toAnonymize.length > 0) {
      const placeholders = toAnonymize.map(() => '?').join(',')
      d.prepare(`UPDATE players SET name = 'Anonymized' WHERE id IN (${placeholders})`).run(...toAnonymize)
    }
  }

  return NextResponse.json({ success: true, gamesProcessed: games.length })
}
