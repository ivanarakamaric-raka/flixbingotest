'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LobbyAdminClient({
  game, readyCount, totalPlayers, players,
}: {
  game: { id: string; name: string }
  readyCount: number
  totalPlayers: number
  players: { id: string; name: string; email: string; status: string }[]
}) {
  const [starting, setStarting] = useState(false)
  const router = useRouter()

  async function startGame() {
    setStarting(true)
    const res = await fetch('/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.id }),
    })
    if (res.ok) {
      router.push('/admin/scoreboard')
    } else {
      setStarting(false)
      alert('Failed to start game')
    }
  }

  const pct = totalPlayers > 0 ? Math.round((readyCount / totalPlayers) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-white">{game.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">Lobby open</div>
          </div>
          <div className="text-xs font-bold bg-[#1a1a2e] text-[#69b1ff] px-2 py-1 rounded-md">Lobby open</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-3 text-center">
            <div className="text-xl font-extrabold text-[#73d13d]">{readyCount}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">Profile ready</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-3 text-center">
            <div className="text-xl font-extrabold text-yellow-400">{totalPlayers - readyCount}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">No profile yet</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-3 text-center">
            <div className="text-xl font-extrabold text-gray-600">{totalPlayers}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">Total players</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
            <span>Players with profile ready</span>
            <span className="text-[#73d13d] font-bold">{pct}% · {readyCount}/{totalPlayers}</span>
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#73d13d] to-[#52c41a] rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={starting}
          className="w-full bg-[#73d13d] text-black font-extrabold py-4 rounded-xl text-base disabled:opacity-50"
        >
          {starting ? 'Starting…' : "🚌 Let's Play!"}
        </button>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          All waiting players will be sent to their bingo card instantly
        </p>
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="text-xs font-bold text-gray-400">Player readiness</div>
        </div>
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1a1a1a] last:border-0">
            <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[9px] font-bold text-gray-500 flex-shrink-0">
              {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-300">{p.name}</div>
              <div className="text-[9px] text-gray-600 truncate">{p.email}</div>
            </div>
            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              p.status === 'ready' ? 'bg-[#0d2010] text-[#73d13d]' : 'bg-[#1a1a2e] text-[#69b1ff]'
            }`}>
              {p.status === 'ready' ? 'Profile ready' : 'No profile yet'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
