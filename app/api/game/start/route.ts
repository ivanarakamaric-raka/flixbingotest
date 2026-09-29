import { getSession } from '@/lib/session'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const adminIds = (process.env.ADMIN_PLAYER_IDS ?? '').split(',').map(id => id.trim())
  if (!session || !adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { gameId } = await req.json()

  const { data: gameQuestions } = await adminClient()
    .from('game_questions')
    .select('question_id')
    .eq('game_id', gameId)

  if (!gameQuestions || gameQuestions.length !== 20) {
    return NextResponse.json({ error: 'Game must have exactly 20 questions' }, { status: 400 })
  }

  const questionIds = gameQuestions.map(q => q.question_id)

  const { data: players } = await adminClient()
    .from('players')
    .select('id')

  if (!players) return NextResponse.json({ error: 'No players found' }, { status: 400 })

  const cardInserts = players.flatMap(player => {
    const picked = shuffle(questionIds).slice(0, 16)
    return picked.map((question_id, index) => ({
      player_id: player.id,
      game_id: gameId,
      question_id,
      position: index + 1,
    }))
  })

  const { error: insertError } = await adminClient()
    .from('player_cards')
    .upsert(cardInserts, { onConflict: 'player_id,game_id,question_id' })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  const { error: updateError } = await adminClient()
    .from('games')
    .update({ status: 'live', played_at: new Date().toISOString() })
    .eq('id', gameId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
