import { getSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TagClient } from './TagClient'

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ squareId: string }>
  searchParams: Promise<{ game?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/join')

  const { squareId } = await params
  const { game: gameId } = await searchParams

  const supabase = await createClient()
  const { data: question } = await supabase
    .from('questions').select('text').eq('id', squareId).single()

  return (
    <TagClient
      questionId={squareId}
      questionText={question?.text ?? ''}
      gameId={gameId ?? ''}
    />
  )
}
