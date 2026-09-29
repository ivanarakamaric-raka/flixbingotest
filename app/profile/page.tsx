import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/join')

  const params = await searchParams
  const gameId = params.game
  if (!gameId) redirect('/')

  const d = db()

  const questions = d.prepare(
    `SELECT q.id, q.text, q.category FROM game_questions gq
     JOIN questions q ON q.id = gq.question_id
     WHERE gq.game_id = ? ORDER BY gq.position`
  ).all(gameId) as { id: string; text: string; category: string }[]

  const trueBefore = (d.prepare(
    `SELECT question_id FROM player_truths WHERE player_id = ? AND game_id = ?`
  ).all(session.user.id, gameId) as { question_id: string }[]).map(r => r.question_id)

  return (
    <ProfileForm
      playerId={session.user.id}
      gameId={gameId}
      questions={questions}
      trueBefore={trueBefore}
    />
  )
}
