import { getSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()

  const { data: gameQuestions } = await supabase
    .from('game_questions')
    .select('question_id, questions(id, text, category)')
    .eq('game_id', gameId)
    .order('position')

  const { data: existingTruths } = await supabase
    .from('player_truths')
    .select('question_id')
    .eq('player_id', session.user.id)
    .eq('game_id', gameId)

  const trueBefore = existingTruths?.map(t => t.question_id) ?? []
  const questions = gameQuestions?.map(gq => gq.questions).filter(Boolean) ?? []

  return (
    <ProfileForm
      playerId={session.user.id}
      gameId={gameId}
      questions={questions as any}
      trueBefore={trueBefore}
    />
  )
}
