'use client'
import { useRealtimeGame } from '@/hooks/useRealtimeGame'

export function LobbyClient({
  gameId, gameName, playerId, readyCount, myTruthCount,
}: {
  gameId: string
  gameName: string
  playerId: string
  readyCount: number
  myTruthCount: number
}) {
  useRealtimeGame(gameId)

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 gap-6 text-center">
      <div className="text-6xl animate-pulse">🎯</div>

      <div>
        <h1 className="text-2xl font-extrabold text-white">You&apos;re all set!</h1>
        <p className="text-sm text-gray-500 mt-1">{gameName}</p>
      </div>

      <div className="bg-[#0d2010] border border-[#73d13d44] rounded-xl p-4 w-full max-w-xs flex items-center gap-3">
        <span className="text-xl">✅</span>
        <div className="text-left">
          <div className="text-sm font-bold text-[#73d13d]">Truth profile saved</div>
          <div className="text-xs text-gray-500">{myTruthCount} squares marked as true for you</div>
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed">
        The game hasn&apos;t started yet.<br />
        <strong className="text-white">Grab a drink and hang tight —</strong><br />
        you&apos;ll be redirected automatically when it does.
      </p>

      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-[#73d13d] animate-pulse" />
        <span className="text-sm text-gray-400">
          <span className="font-bold text-[#73d13d]">{readyCount}</span> players ready so far
        </span>
      </div>

      <a href="/profile" className="text-xs text-gray-600 underline">
        Edit your truth profile
      </a>
    </main>
  )
}
