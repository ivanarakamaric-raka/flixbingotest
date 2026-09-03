'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Question = { id: string; text: string; category: string; usedCount: number }

const CATEGORIES = ['flix', 'engineering', 'personal', 'fun', 'custom'] as const

export function LibraryClient({ questions, gameId }: { questions: Question[]; gameId?: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState<string>('custom')
  const [allQuestions, setAllQuestions] = useState(questions)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = allQuestions.filter(q => {
    if (filter !== 'all' && q.category !== filter) return false
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter(q => q.category === cat)
    return acc
  }, {} as Record<string, Question[]>)

  async function saveSelection() {
    if (!gameId || selected.size !== 20) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('game_questions').delete().eq('game_id', gameId)
    await supabase.from('game_questions').insert(
      Array.from(selected).map((question_id, i) => ({ game_id: gameId, question_id, position: i + 1 }))
    )
    setSaving(false)
    alert('Questions saved for this game!')
  }

  async function addQuestion() {
    if (!newText.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('questions')
      .insert({ text: newText.trim(), category: newCategory })
      .select('id, text, category')
      .single()
    if (data) {
      setAllQuestions(prev => [...prev, { ...data, usedCount: 0 }])
      setNewText('')
      setShowAddModal(false)
    }
  }

  const canSave = selected.size === 20 && !!gameId

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 mb-5">
        <div className="text-3xl font-extrabold text-[#73d13d]">{selected.size}</div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-300">questions selected</div>
          <div className="text-xs text-gray-500">need 20 to save</div>
          <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-gradient-to-r from-[#73d13d] to-[#52c41a] rounded-full transition-all" style={{ width: `${Math.min((selected.size / 20) * 100, 100)}%` }} />
          </div>
        </div>
        <button
          onClick={saveSelection}
          disabled={!canSave || saving}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap ${
            canSave ? 'bg-[#73d13d] text-black cursor-pointer' : 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving…' : 'Save for this game'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="flex-1 min-w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(['all', ...CATEGORIES]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                filter === cat
                  ? 'bg-[#0d2010] border-[#73d13d] text-[#73d13d]'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-1.5 border border-[#73d13d44] text-[#73d13d] rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap"
        >
          + Add question
        </button>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {CATEGORIES.map(cat => {
          const qs = grouped[cat]
          if (!qs.length) return null
          return [
            <div key={`header-${cat}`} style={{ gridColumn: '1 / -1' }} className="text-xs font-bold text-gray-600 uppercase tracking-wide pt-4 pb-1 border-b border-[#1e1e1e] flex items-center gap-2">
              {cat}
            </div>,
            ...qs.map(q => (
              <button
                key={q.id}
                onClick={() => toggle(q.id)}
                className={`text-left p-3 rounded-xl border flex gap-2.5 items-start transition-colors ${
                  selected.has(q.id)
                    ? 'bg-[#0d2010] border-[#73d13d]'
                    : 'bg-[#161616] border-[#2a2a2a] hover:border-[#73d13d33]'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                  selected.has(q.id) ? 'bg-[#73d13d] border-[#73d13d] text-black' : 'border-gray-700'
                }`}>
                  {selected.has(q.id) && '✓'}
                </div>
                <div className="flex-1">
                  <div className={`text-xs leading-snug font-medium ${selected.has(q.id) ? 'text-[#c8f08f]' : 'text-gray-300'}`}>
                    {q.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      cat === 'flix' ? 'bg-[#0d2010] text-[#73d13d]' :
                      cat === 'engineering' ? 'bg-[#1a1a2e] text-[#69b1ff]' :
                      cat === 'fun' ? 'bg-[#2a1f00] text-[#ffd666]' :
                      cat === 'personal' ? 'bg-[#1f0a2a] text-[#d3adf7]' :
                      'bg-[#2a1a1a] text-[#ff9c6e]'
                    }`}>
                      {cat}
                    </span>
                    {q.usedCount > 0 && <span className="text-[9px] text-gray-600">used {q.usedCount}×</span>}
                  </div>
                </div>
              </button>
            )),
          ]
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white">Add custom question</h3>
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Write your question…"
              rows={3}
              className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-sm text-white placeholder-gray-600 resize-none outline-none"
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    newCategory === cat ? 'bg-[#0d2010] border-[#73d13d] text-[#73d13d]' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 text-sm">Cancel</button>
              <button onClick={addQuestion} className="flex-1 py-3 rounded-xl bg-[#73d13d] text-black font-bold text-sm">Add question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
