import { createClient } from '@/lib/supabase/server'
import { LibraryClient } from './LibraryClient'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>
}) {
  const { game: gameId } = await searchParams
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('id, text, category')
    .order('category')

  const { data: usageCounts } = await supabase
    .from('game_questions')
    .select('question_id')

  const usageMap = new Map<string, number>()
  for (const row of usageCounts ?? []) {
    usageMap.set(row.question_id, (usageMap.get(row.question_id) ?? 0) + 1)
  }

  const enriched = (questions ?? []).map(q => ({
    ...q,
    usedCount: usageMap.get(q.id) ?? 0,
  }))

  return <LibraryClient questions={enriched} gameId={gameId} />
}
