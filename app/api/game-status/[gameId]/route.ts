import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const game = db().prepare(`SELECT status FROM games WHERE id = ?`).get(gameId) as { status: string } | undefined

  if (!game) return NextResponse.json({ status: null })
  return NextResponse.json({ status: game.status })
}
