import { db } from '@/lib/db'
import { LibraryClient } from './LibraryClient'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>
}) {
  const { game: gameId } = await searchParams
  const d = db()

  const questions = d.prepare(
    `SELECT id, text, category FROM questions ORDER BY category`
  ).all() as { id: string; text: string; category: string }[]

  const usageRows = d.prepare(
    `SELECT question_id FROM game_questions`
  ).all() as { question_id: string }[]

  const usageMap = new Map<string, number>()
  for (const row of usageRows) {
    usageMap.set(row.question_id, (usageMap.get(row.question_id) ?? 0) + 1)
  }

  const enriched = questions.map(q => ({
    ...q,
    usedCount: usageMap.get(q.id) ?? 0,
  }))

  return <LibraryClient questions={enriched} gameId={gameId} />
}
