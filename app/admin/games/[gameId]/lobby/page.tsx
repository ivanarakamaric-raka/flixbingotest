import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { LobbyAdminClient } from './LobbyAdminClient'

export const dynamic = 'force-dynamic'

export default async function GameLobbyPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games').select('id, name, status').eq('id', gameId).single()

  const { data: readyPlayerIds } = await adminClient()
    .from('player_truths')
    .select('player_id')
    .eq('game_id', gameId)

  const readyIds = new Set((readyPlayerIds ?? []).map(r => r.player_id))
  const readyCount = readyIds.size

  const { data: allPlayers } = await adminClient()
    .from('players').select('id, name, email, created_at')

  const totalPlayers = (allPlayers ?? []).length

  const playersWithStatus = (allPlayers ?? []).map(p => ({
    ...p,
    status: readyIds.has(p.id) ? 'ready' : 'joined',
  }))

  return (
    <LobbyAdminClient
      game={game!}
      readyCount={readyCount}
      totalPlayers={totalPlayers}
      players={playersWithStatus}
    />
  )
}
