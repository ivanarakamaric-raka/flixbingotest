'use client'
import { useEffect, useState } from 'react'

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
    async function refresh() {
      const res = await fetch(`/api/scoreboard/${gameId}`)
      if (res.ok) setRows(await res.json())
    }

    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [gameId])

  return rows
}
