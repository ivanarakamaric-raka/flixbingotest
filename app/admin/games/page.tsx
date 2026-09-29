import { db } from '@/lib/db'
import Link from 'next/link'

export default async function GamesPage() {
  const games = db().prepare(
    `SELECT id, name, status, played_at FROM games ORDER BY created_at DESC`
  ).all() as { id: string; name: string; status: string; played_at: string | null }[]

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-white">Games</h2>
      </div>
      <div className="flex flex-col gap-2">
        {games.map(game => (
          <div key={game.id} className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{game.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {game.played_at ? new Date(game.played_at).toLocaleDateString() : 'Not started'}
              </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-md ${
              game.status === 'live' ? 'bg-[#0d2010] text-[#73d13d]' :
              game.status === 'lobby' ? 'bg-[#1a1a2e] text-[#69b1ff]' :
              game.status === 'ended' ? 'bg-[#2a2a2a] text-gray-500' :
              'bg-[#1a1a1a] text-gray-600'
            }`}>
              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </div>
            {game.status === 'lobby' && (
              <Link href={`/admin/games/${game.id}/lobby`} className="text-xs text-[#73d13d] font-semibold">
                Manage →
              </Link>
            )}
          </div>
        ))}
        {games.length === 0 && (
          <div className="text-gray-600 text-sm text-center py-8">No games yet. Create one in the database.</div>
        )}
      </div>
    </div>
  )
}
