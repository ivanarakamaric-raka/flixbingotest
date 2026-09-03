'use client'
import { useEffect, useState } from 'react'
import { generatePlayerQR } from '@/lib/qr'

export function QRCode({ playerId }: { playerId: string }) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    generatePlayerQR(playerId).then(setDataUrl)
  }, [playerId])

  if (!dataUrl) return <div className="w-32 h-32 bg-gray-800 rounded-lg animate-pulse" />
  return (
    <img
      src={dataUrl}
      alt="Your QR code"
      className="w-32 h-32 rounded-lg border border-gray-700"
    />
  )
}
