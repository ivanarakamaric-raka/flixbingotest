import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const session = await getSession()
  if (!session) redirect('/join')

  const supabase = await createClient()

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

  const { count } = await supabase
    .from('player_truths')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', session.user.id)
    .eq('game_id', game.id)

  if (!count || count === 0) redirect(`/profile?game=${game.id}`)

  if (game.status === 'lobby') redirect('/lobby')
  redirect('/card')
}
