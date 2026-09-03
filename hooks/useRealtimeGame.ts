'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useRealtimeGame(gameId: string) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          if (payload.new.status === 'live') {
            router.push('/card')
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId, router])
}
