import { db } from '@/lib/db'
import { LobbyAdminClient } from './LobbyAdminClient'

export const dynamic = 'force-dynamic'

export default async function GameLobbyPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const d = db()

  const game = d.prepare(
    `SELECT id, name, status FROM games WHERE id = ?`
  ).get(gameId) as { id: string; name: string; status: string } | undefined

  if (!game) return <div className="p-8 text-gray-500 text-sm">Game not found.</div>

  const readyRows = d.prepare(
    `SELECT DISTINCT player_id FROM player_truths WHERE game_id = ?`
  ).all(gameId) as { player_id: string }[]

  const readyIds = new Set(readyRows.map(r => r.player_id))

  const allPlayers = d.prepare(
    `SELECT id, name FROM players ORDER BY created_at`
  ).all() as { id: string; name: string }[]

  const playersWithStatus = allPlayers.map(p => ({
    ...p,
    status: readyIds.has(p.id) ? 'ready' : 'joined',
  }))

  return (
    <LobbyAdminClient
      game={game}
      readyCount={readyIds.size}
      totalPlayers={allPlayers.length}
      players={playersWithStatus}
    />
  )
}
