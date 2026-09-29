import { adminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  const trimmed = (name ?? '').trim()
  if (!trimmed) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Upsert player by name so re-joining returns the same record
  const { data: player, error } = await adminClient()
    .from('players')
    .upsert({ name: trimmed }, { onConflict: 'name' })
    .select('id')
    .single()

  if (error || !player) {
    return NextResponse.json({ error: 'Could not create player' }, { status: 500 })
  }

  await createSession(player.id)
  return NextResponse.json({ ok: true })
}
