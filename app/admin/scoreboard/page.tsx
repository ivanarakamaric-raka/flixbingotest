import { db } from '@/lib/db'
import { ScoreboardClient } from './ScoreboardClient'

export default async function ScoreboardPage() {
  const game = db().prepare(
    `SELECT id, name FROM games WHERE status IN ('live','ended') ORDER BY created_at DESC LIMIT 1`
  ).get() as { id: string; name: string } | undefined

  if (!game) {
    return <div className="p-8 text-gray-500 text-sm">No live game right now.</div>
  }

  return <ScoreboardClient gameId={game.id} gameName={game.name} />
}
