'use client'
import { useRef } from 'react'

export function QRScanner({ onScan }: { onScan: (value: string) => void }) {
  const fired = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    if (!videoRef.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        const scan = async () => {
          if (fired.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0 && !fired.current) {
              fired.current = true
              stream.getTracks().forEach(t => t.stop())
              onScan(barcodes[0].rawValue)
              return
            }
          } catch {}
          if (!fired.current) requestAnimationFrame(scan)
        }
        requestAnimationFrame(scan)
      }
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        className="w-full rounded-2xl border border-gray-700"
        playsInline
        muted
        onCanPlay={startCamera}
      />
      <p className="text-xs text-gray-600 text-center">
        Point the camera at someone&apos;s QR code
      </p>
    </div>
  )
}
