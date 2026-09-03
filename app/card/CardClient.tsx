'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BingoCard } from '@/components/BingoCard'
import { QRCode } from '@/components/QRCode'

type Square = { questionId: string; text: string; claimedAt: string | null; claimedByName: string | null }

export function CardClient({
  playerId, playerName, gameId, squares: initialSquares, claimedCount: initialCount,
}: {
  playerId: string; playerName: string; gameId: string
  squares: Square[]; claimedCount: number
}) {
  const [squares] = useState(initialSquares)
  const [claimedCount] = useState(initialCount)
  const [showQR, setShowQR] = useState(false)
  const router = useRouter()

  const isBingo = claimedCount >= 16

  function handleSquareTap(questionId: string) {
    router.push(`/tag/${questionId}?game=${gameId}`)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-6" style={{ maxWidth: 'min(390px, 100vw)', margin: '0 auto' }}>
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
        <div className="text-[#73d13d] font-bold text-base">🚌 FlixBingo</div>
        <div className="text-xs text-gray-500">{claimedCount}/16 squares</div>
      </header>

      {isBingo && (
        <div className="mx-3 mt-3 bg-[#0d2010] border-2 border-[#73d13d] rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-[#73d13d]">🎉 BINGO!</div>
        </div>
      )}

      <BingoCard squares={squares} onSquareTap={handleSquareTap} />

      <div className="px-3 mt-2">
        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-3 text-sm font-semibold text-gray-300 flex items-center justify-center gap-2"
        >
          📱 {showQR ? 'Hide my QR' : 'Show my QR'}
        </button>
        {showQR && (
          <div className="mt-3 flex justify-center">
            <QRCode playerId={playerId} />
          </div>
        )}
      </div>
    </main>
  )
}
