'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ScoreRow = {
  playerId: string
  name: string
  claimed: number
  bingo: boolean
  completionTime: number | null
}

export function useRealtimeScoreboard(gameId: string, initial: ScoreRow[]) {
  const [rows, setRows] = useState(initial)

  useEffect(() => {
    const supabase = createClient()

    async function refresh() {
      const { data } = await supabase
        .from('player_cards')
        .select('player_id, claimed_at, players(name)')
        .eq('game_id', gameId)
        .not('claimed_at', 'is', null)

      if (!data) return

      const byPlayer = new Map<string, { name: string; times: string[] }>()
      for (const row of data) {
        const name = (row.players as any)?.name ?? ''
        if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, { name, times: [] })
        byPlayer.get(row.player_id)!.times.push(row.claimed_at!)
      }

      const { data: gameData } = await supabase
        .from('games').select('played_at').eq('id', gameId).single()
      const gameStart = gameData?.played_at ? new Date(gameData.played_at).getTime() : null

      const scored: ScoreRow[] = Array.from(byPlayer.entries()).map(([playerId, { name, times }]) => {
        const claimed = times.length
        const bingo = claimed >= 16
        const completionTime = bingo && gameStart
          ? Math.floor((Math.max(...times.map(t => new Date(t).getTime())) - gameStart) / 1000)
          : null
        return { playerId, name, claimed, bingo, completionTime }
      })

      setRows(scored.sort((a, b) => b.claimed - a.claimed))
    }

    refresh()

    const channel = supabase
      .channel(`scoreboard:${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_cards', filter: `game_id=eq.${gameId}` }, refresh)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId])

  return rows
}
