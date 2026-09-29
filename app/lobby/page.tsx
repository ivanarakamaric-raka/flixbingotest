import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { LobbyClient } from './LobbyClient'

export default async function LobbyPage() {
  const session = await getSession()
  if (!session) redirect('/join')

  const d = db()
  const game = d.prepare(
    `SELECT id, name, status FROM games WHERE status IN ('lobby','live') ORDER BY created_at DESC LIMIT 1`
  ).get() as { id: string; name: string; status: string } | undefined

  if (!game) redirect('/')
  if (game!.status === 'live') redirect('/card')

  const { readyCount } = d.prepare(
    `SELECT COUNT(DISTINCT player_id) as readyCount FROM player_truths WHERE game_id = ?`
  ).get(game!.id) as { readyCount: number }

  const { myTruthCount } = d.prepare(
    `SELECT COUNT(*) as myTruthCount FROM player_truths WHERE player_id = ? AND game_id = ?`
  ).get(session.user.id, game!.id) as { myTruthCount: number }

  return (
    <LobbyClient
      gameId={game!.id}
      gameName={game!.name}
      playerId={session.user.id}
      readyCount={readyCount}
      myTruthCount={myTruthCount}
    />
  )
}
