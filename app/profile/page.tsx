import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>
}) {
  const session = await auth()
  if (!session?.user?.email) redirect('/join')

  const params = await searchParams
  const gameId = params.game
  if (!gameId) redirect('/')

  const supabase = await createClient()

  // Ensure player record exists
  let { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!player) {
    const { data: newPlayer } = await adminClient()
      .from('players')
      .insert({
        email: session.user.email,
        name: session.user.name ?? session.user.email.split('@')[0],
      })
      .select('id')
      .single()
    player = newPlayer
  }

  // Load game questions
  const { data: gameQuestions } = await supabase
    .from('game_questions')
    .select('question_id, questions(id, text, category)')
    .eq('game_id', gameId)
    .order('position')

  // Load existing truths
  const { data: existingTruths } = await supabase
    .from('player_truths')
    .select('question_id')
    .eq('player_id', player!.id)
    .eq('game_id', gameId)

  const trueBefore = existingTruths?.map(t => t.question_id) ?? []
  const questions = gameQuestions?.map(gq => gq.questions).filter(Boolean) ?? []

  return (
    <ProfileForm
      playerId={player!.id}
      gameId={gameId}
      questions={questions as any}
      trueBefore={trueBefore}
    />
  )
}
