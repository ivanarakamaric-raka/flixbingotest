import { adminClient } from '@/lib/supabase/admin'
import { hashPlayer } from '@/lib/hash'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.ANONYMIZE_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const specificGameId: string | undefined = body.gameId

  let query = adminClient().from('games').select('id, played_at').eq('status', 'ended')
  if (specificGameId) {
    query = query.eq('id', specificGameId) as any
  } else {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    query = query.lt('played_at', cutoff) as any
  }
  const { data: games } = await query

  for (const game of games ?? []) {
    const { data: cards } = await adminClient()
      .from('player_cards')
      .select('player_id, claimed_at, players(email)')
      .eq('game_id', game.id)

    const byPlayer = new Map<string, { email: string; times: string[] }>()
    for (const row of cards ?? []) {
      const email = (row.players as any)?.email ?? ''
      if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, { email, times: [] })
      if (row.claimed_at) byPlayer.get(row.player_id)!.times.push(row.claimed_at)
    }

    const gameStart = game.played_at ? new Date(game.played_at).getTime() : null
    const statsRows = []
    for (const [, { email, times }] of byPlayer.entries()) {
      const hash = await hashPlayer(email, game.id)
      const got_bingo = times.length >= 16
      const completion_seconds = got_bingo && gameStart
        ? Math.floor((Math.max(...times.map(t => new Date(t).getTime())) - gameStart) / 1000)
        : null
      statsRows.push({ game_id: game.id, player_hash: hash, squares_claimed: times.length, completion_seconds, got_bingo })
    }

    if (statsRows.length > 0) {
      await adminClient().from('player_game_stats').upsert(statsRows, { onConflict: 'game_id,player_hash' })
    }

    const playerCount = byPlayer.size
    const bingoCount = statsRows.filter(r => r.got_bingo).length
    const completionTimes = statsRows.filter(r => r.completion_seconds !== null).map(r => r.completion_seconds!)
    const avgCompletion = completionTimes.length
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : null

    await adminClient().from('game_analytics').upsert({
      game_id: game.id,
      played_at: game.played_at,
      player_count: playerCount,
      bingo_count: bingoCount,
      avg_completion_seconds: avgCompletion,
      participation_rate: playerCount > 0 ? Math.round((statsRows.filter(r => r.squares_claimed > 0).length / playerCount) * 100) : 0,
    }, { onConflict: 'game_id' })

    await adminClient().from('player_truths').delete().eq('game_id', game.id)
    await adminClient().from('player_cards').delete().eq('game_id', game.id)

    const { data: livePlayers } = await adminClient()
      .from('player_cards')
      .select('player_id')
      .neq('game_id', game.id)

    const livePlayerIds = new Set((livePlayers ?? []).map(r => r.player_id))
    const toAnonymize = Array.from(byPlayer.keys()).filter(id => !livePlayerIds.has(id))

    if (toAnonymize.length > 0) {
      await adminClient()
        .from('players')
        .update({ email: 'anonymized@deleted', name: 'Anonymized' })
        .in('id', toAnonymize)
    }
  }

  return NextResponse.json({ success: true, gamesProcessed: games?.length ?? 0 })
}
