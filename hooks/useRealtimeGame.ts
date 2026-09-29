'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useRealtimeGame(gameId: string) {
  const router = useRouter()

  useEffect(() => {
    async function poll() {
      const res = await fetch(`/api/game-status/${gameId}`)
      if (res.ok) {
        const { status } = await res.json()
        if (status === 'live') router.push('/card')
      }
    }

    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [gameId, router])
}
