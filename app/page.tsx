import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await getSession()
  if (!session) redirect('/join')

  const d = db()
  const game = d.prepare(
    `SELECT id, status FROM games WHERE status IN ('lobby','live') ORDER BY created_at DESC LIMIT 1`
  ).get() as { id: string; status: string } | undefined

  if (!game) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500">No active game right now.</p>
      </main>
    )
  }

  const { n } = d.prepare(
    `SELECT COUNT(*) as n FROM player_truths WHERE player_id = ? AND game_id = ?`
  ).get(session.user.id, game.id) as { n: number }

  if (n === 0) redirect(`/profile?game=${game.id}`)
  if (game.status === 'lobby') redirect('/lobby')
  redirect('/card')
}
