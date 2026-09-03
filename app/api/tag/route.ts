import { auth } from '@/lib/auth'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { scannedPlayerId, squareQuestionId, gameId } = await req.json()

  const { data: tagger } = await adminClient()
    .from('players').select('id').eq('email', session.user.email).single()
  if (!tagger) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  if (tagger.id === scannedPlayerId) {
    return NextResponse.json({ error: 'You cannot tag yourself' }, { status: 400 })
  }

  const { data: existingUse } = await adminClient()
    .from('player_cards')
    .select('question_id')
    .eq('player_id', tagger.id)
    .eq('game_id', gameId)
    .eq('claimed_by_player_id', scannedPlayerId)
    .not('claimed_at', 'is', null)
    .limit(1)

  if (existingUse && existingUse.length > 0) {
    return NextResponse.json({ error: 'already_used', message: 'You already used this person on your card' }, { status: 400 })
  }

  const { data: truth } = await adminClient()
    .from('player_truths')
    .select('question_id')
    .eq('player_id', scannedPlayerId)
    .eq('game_id', gameId)
    .eq('question_id', squareQuestionId)
    .single()

  if (!truth) {
    const { data: scannedPlayer } = await adminClient()
      .from('players').select('name').eq('id', scannedPlayerId).single()
    return NextResponse.json({
      error: 'no_match',
      message: `This square isn't true for ${scannedPlayer?.name?.split(' ')[0] ?? 'them'}`,
      scannedName: scannedPlayer?.name?.split(' ')[0] ?? 'them',
    }, { status: 400 })
  }

  const { error } = await adminClient()
    .from('player_cards')
    .update({ claimed_at: new Date().toISOString(), claimed_by_player_id: scannedPlayerId })
    .eq('player_id', tagger.id)
    .eq('game_id', gameId)
    .eq('question_id', squareQuestionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await adminClient()
    .from('player_cards')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', tagger.id)
    .eq('game_id', gameId)
    .not('claimed_at', 'is', null)

  const isBingo = (count ?? 0) >= 16

  const { data: scannedPlayer } = await adminClient()
    .from('players').select('name').eq('id', scannedPlayerId).single()

  return NextResponse.json({
    success: true,
    bingo: isBingo,
    scannedName: scannedPlayer?.name?.split(' ')[0] ?? '',
  })
}
