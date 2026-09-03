import { createClient } from '@/lib/supabase/server'
import { ScoreboardClient } from './ScoreboardClient'

export default async function ScoreboardPage() {
  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games').select('id, name, status, played_at')
    .in('status', ['live', 'ended'])
    .order('created_at', { ascending: false })
    .limit(1).single()

  if (!game) {
    return <div className="p-8 text-gray-500 text-sm">No live game right now.</div>
  }

  return <ScoreboardClient gameId={game.id} gameName={game.name} />
}
