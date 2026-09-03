import { createClient } from '@supabase/supabase-js'

// Service role — bypasses RLS. Server-side only.
// Lazy factory so the client is not instantiated at module load time (build safety).
export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
