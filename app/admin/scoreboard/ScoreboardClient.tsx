'use client'
import { useRealtimeScoreboard } from '@/hooks/useRealtimeScoreboard'

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function ScoreboardClient({ gameId, gameName }: { gameId: string; gameName: string }) {
  const rows = useRealtimeScoreboard(gameId, [])

  const bingoCount = rows.filter(r => r.bingo).length
  const totalClaimed = rows.reduce((sum, r) => sum + r.claimed, 0)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm font-bold text-gray-400 mb-4">{gameName}</div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-[#73d13d]">{rows.length}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Players</div>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-[#73d13d]">{totalClaimed}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Squares claimed</div>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-[#73d13d]">{bingoCount}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Full cards</div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {rows.map((row, i) => (
          <div key={row.playerId} className="flex items-center gap-4 px-5 py-3 border-b border-[#1a1a1a] last:border-0">
            <div className="text-sm font-bold text-gray-600 w-5">{i + 1}</div>
            <div className="flex-1 text-sm font-semibold text-gray-200">{row.name}</div>
            {row.bingo && (
              <div className="bg-[#0d2010] text-[#73d13d] text-xs font-bold px-2.5 py-1 rounded-md">
                BINGO {row.completionTime ? `· ${fmt(row.completionTime)}` : ''}
              </div>
            )}
            <div className="text-sm font-bold text-[#73d13d]">{row.claimed}/16</div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-6 text-center text-gray-600 text-sm">Waiting for players to start tagging…</div>
        )}
      </div>
    </div>
  )
}
