import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { CardClient } from './CardClient'

export default async function CardPage() {
  const session = await getSession()
  if (!session) redirect('/join')

  const d = db()
  const game = d.prepare(
    `SELECT id, name, status FROM games WHERE status = 'live' ORDER BY created_at DESC LIMIT 1`
  ).get() as { id: string; name: string; status: string } | undefined
  if (!game) redirect('/')

  const player = d.prepare(`SELECT id, name FROM players WHERE id = ?`).get(session.user.id) as { id: string; name: string } | undefined
  if (!player) redirect('/')

  const cardRows = d.prepare(
    `SELECT pc.question_id, pc.position, pc.claimed_at, q.text, p.name as claimer_name
     FROM player_cards pc
     JOIN questions q ON q.id = pc.question_id
     LEFT JOIN players p ON p.id = pc.claimed_by_player_id
     WHERE pc.player_id = ? AND pc.game_id = ?
     ORDER BY pc.position`
  ).all(player.id, game.id) as {
    question_id: string; position: number; claimed_at: string | null; text: string; claimer_name: string | null
  }[]

  const squares = cardRows.map(row => ({
    questionId: row.question_id,
    text: row.text,
    claimedAt: row.claimed_at,
    claimedByName: row.claimer_name?.split(' ')[0] ?? null,
  }))

  return (
    <CardClient
      playerId={player.id}
      playerName={player.name}
      gameId={game.id}
      squares={squares}
      claimedCount={squares.filter(s => s.claimedAt).length}
    />
  )
}
