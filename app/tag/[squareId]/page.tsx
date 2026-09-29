import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
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

  const question = db().prepare(`SELECT text FROM questions WHERE id = ?`).get(squareId) as { text: string } | undefined

  return (
    <TagClient
      questionId={squareId}
      questionText={question?.text ?? ''}
      gameId={gameId ?? ''}
    />
  )
}
