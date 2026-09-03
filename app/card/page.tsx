import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CardClient } from './CardClient'

export default async function CardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/join')

  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games').select('id, name, status')
    .eq('status', 'live').order('created_at', { ascending: false })
    .limit(1).single()

  if (!game) redirect('/')

  const { data: player } = await supabase
    .from('players').select('id, name').eq('email', session.user.email).single()
  if (!player) redirect('/')

  const { data: cardRows } = await supabase
    .from('player_cards')
    .select(`
      question_id, position, claimed_at,
      questions(text),
      claimed_player:players!player_cards_claimed_by_player_id_fkey(name)
    `)
    .eq('player_id', player.id)
    .eq('game_id', game.id)
    .order('position')

  const squares = (cardRows ?? []).map(row => ({
    questionId: row.question_id,
    text: (row.questions as any)?.text ?? '',
    claimedAt: row.claimed_at,
    claimedByName: (row.claimed_player as any)?.name?.split(' ')[0] ?? null,
  }))

  const claimedCount = squares.filter(s => s.claimedAt).length

  return (
    <CardClient
      playerId={player.id}
      playerName={player.name}
      gameId={game.id}
      squares={squares}
      claimedCount={claimedCount}
    />
  )
}
