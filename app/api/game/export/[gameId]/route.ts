import { getSession } from '@/lib/session'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const session = await getSession()
  const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim())
  if (!session || !adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { gameId } = await params

  const { data: game } = await adminClient()
    .from('games').select('*').eq('id', gameId).single()

  const { data: analytics } = await adminClient()
    .from('game_analytics').select('*').eq('game_id', gameId).single()

  const { data: stats } = await adminClient()
    .from('player_game_stats').select('*').eq('game_id', gameId)

  const { data: questions } = await adminClient()
    .from('game_questions')
    .select('position, questions(text, category)')
    .eq('game_id', gameId)
    .order('position')

  const exportData = { game, questions, analytics, playerStats: stats }
  const json = JSON.stringify(exportData, null, 2)

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="flixbingo-${gameId}.json"`,
    },
  })
}
