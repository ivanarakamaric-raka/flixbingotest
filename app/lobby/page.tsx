import { getSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LobbyClient } from './LobbyClient'

export default async function LobbyPage() {
  const session = await getSession()
  if (!session) redirect('/join')

  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games')
    .select('id, name, status')
    .eq('status', 'lobby')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!game) redirect('/')
  if (game.status === 'live') redirect('/card')

  const { data: readyPlayers } = await supabase
    .from('player_truths')
    .select('player_id')
    .eq('game_id', game.id)

  const readyCount = new Set(readyPlayers?.map(r => r.player_id) ?? []).size

  const { count: myTruthCount } = await supabase
    .from('player_truths')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', session.user.id)
    .eq('game_id', game.id)

  return (
    <LobbyClient
      gameId={game.id}
      gameName={game.name}
      playerId={session.user.id}
      readyCount={readyCount}
      myTruthCount={myTruthCount ?? 0}
    />
  )
}
