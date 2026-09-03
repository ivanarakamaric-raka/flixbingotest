'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Question = { id: string; text: string; category: string }

export function ProfileForm({
  playerId,
  gameId,
  questions,
  trueBefore,
}: {
  playerId: string
  gameId: string
  questions: Question[]
  trueBefore: string[]
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(trueBefore))
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()

    // Delete old truths for this game
    await supabase
      .from('player_truths')
      .delete()
      .eq('player_id', playerId)
      .eq('game_id', gameId)

    // Insert new truths
    if (selected.size > 0) {
      await supabase.from('player_truths').insert(
        Array.from(selected).map(question_id => ({
          player_id: playerId,
          game_id: gameId,
          question_id,
        }))
      )
    }

    router.push('/lobby')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-4 sticky top-0 z-10">
        <div className="text-[#73d13d] font-bold text-base">🚌 FlixBingo</div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-6">
        <h1 className="text-xl font-extrabold text-white mb-1">Which ones are true for you?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Select everything that applies. This is how we make sure tags are accurate.
        </p>

        <div className="flex flex-col gap-2">
          {questions.map(q => (
            <button
              key={q.id}
              onClick={() => toggle(q.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selected.has(q.id)
                  ? 'bg-[#0d2010] border-[#73d13d] text-[#c8f08f]'
                  : 'bg-[#161616] border-[#2a2a2a] text-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  selected.has(q.id)
                    ? 'bg-[#73d13d] border-[#73d13d] text-black'
                    : 'border-gray-600'
                }`}>
                  {selected.has(q.id) && '✓'}
                </div>
                <span className="text-sm leading-snug">{q.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#2a2a2a] p-4">
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#73d13d] text-black font-bold py-4 rounded-2xl text-base disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Save — ${selected.size} selected`}
        </button>
      </div>
    </main>
  )
}
