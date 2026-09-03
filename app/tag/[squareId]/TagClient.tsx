'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from '@/components/QRScanner'
import { parseQRValue } from '@/lib/qr'

type State = 'scanning' | 'success' | 'no_match' | 'already_used' | 'error'

export function TagClient({
  questionId, questionText, gameId,
}: {
  questionId: string; questionText: string; gameId: string
}) {
  const [state, setState] = useState<State>('scanning')
  const [scannedName, setScannedName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleScan(raw: string) {
    const scannedPlayerId = parseQRValue(raw)

    const res = await fetch('/api/tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scannedPlayerId, squareQuestionId: questionId, gameId }),
    })
    const data = await res.json()

    if (data.success) {
      setScannedName(data.scannedName)
      setState('success')
      setTimeout(() => router.push('/card'), 2000)
    } else if (data.error === 'no_match') {
      setScannedName(data.scannedName)
      setState('no_match')
    } else if (data.error === 'already_used') {
      setState('already_used')
    } else {
      setErrorMsg(data.message ?? 'Something went wrong')
      setState('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col" style={{ maxWidth: 'min(390px, 100vw)', margin: '0 auto' }}>
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 text-lg">←</button>
        <div className="text-[#73d13d] font-bold text-base">🚌 FlixBingo</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 w-full text-center">
          <div className="text-xs text-gray-500 mb-1">Claiming square</div>
          <div className="text-sm font-semibold text-white">{questionText}</div>
        </div>

        {state === 'scanning' && (
          <>
            <p className="text-sm text-gray-400 text-center">Scan someone&apos;s QR code</p>
            <QRScanner onScan={handleScan} />
          </>
        )}

        {state === 'success' && (
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-xl font-extrabold text-white">Tagged!</div>
            <div className="text-sm text-gray-400 mt-1">Square claimed from {scannedName}</div>
          </div>
        )}

        {state === 'no_match' && (
          <div className="text-center flex flex-col gap-4">
            <div className="text-5xl">❌</div>
            <div className="text-base font-bold text-white">No match</div>
            <div className="text-sm text-gray-400">This square isn&apos;t true for {scannedName}</div>
            <button
              onClick={() => setState('scanning')}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-xl py-3 px-6 text-sm font-semibold"
            >
              Try a different square for {scannedName}
            </button>
            <button
              onClick={() => router.push('/card')}
              className="text-gray-600 text-sm"
            >
              Back to card
            </button>
          </div>
        )}

        {state === 'already_used' && (
          <div className="text-center flex flex-col gap-4">
            <div className="text-5xl">🚫</div>
            <div className="text-base font-bold text-white">Already used</div>
            <div className="text-sm text-gray-400">You already tagged this person on your card</div>
            <button onClick={() => router.push('/card')} className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-xl py-3 px-6 text-sm font-semibold">
              Back to card
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center flex flex-col gap-4">
            <div className="text-5xl">⚠️</div>
            <div className="text-base font-bold text-white">Something went wrong</div>
            <div className="text-sm text-gray-400">{errorMsg}</div>
            <button onClick={() => router.push('/card')} className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-xl py-3 px-6 text-sm font-semibold">
              Back to card
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
