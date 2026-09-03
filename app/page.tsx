import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/join')

  const supabase = await createClient()

  // Find live game
  const { data: game } = await supabase
    .from('games')
    .select('id, status')
    .in('status', ['lobby', 'live'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!game) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500">No active game right now.</p>
      </main>
    )
  }

  // Find player record
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!player) redirect(`/profile?game=${game.id}`)

  // Check if truth profile exists
  const { count } = await supabase
    .from('player_truths')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', player.id)
    .eq('game_id', game.id)

  if (!count || count === 0) redirect(`/profile?game=${game.id}`)

  if (game.status === 'lobby') redirect('/lobby')
  redirect('/card')
}
