import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/session'

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { text, category } = await req.json()
  if (!text?.trim() || !category) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const d = db()
  const id = d.prepare(
    `INSERT INTO questions (id, text, category) VALUES (lower(hex(randomblob(16))), ?, ?) RETURNING id, text, category`
  ).get(text.trim(), category) as { id: string; text: string; category: string }

  return NextResponse.json(id)
}
