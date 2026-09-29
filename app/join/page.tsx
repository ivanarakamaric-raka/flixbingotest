'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <div className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="text-5xl">🚌</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">FlixBingo</h1>
            <p className="text-sm text-gray-500 mt-1">FlixTech Summit 2026</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tag your colleagues, fill your card, <strong className="text-white">have fun</strong>.
          </p>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-base focus:outline-none focus:border-[#73d13d]"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-[#73d13d] text-black font-bold py-4 px-6 rounded-2xl text-base disabled:opacity-50"
            >
              {loading ? 'Joining…' : 'Join'}
            </button>
          </form>
          <p className="text-xs text-gray-600">FlixTech employees only</p>
        </div>
      </div>
    </main>
  )
}
