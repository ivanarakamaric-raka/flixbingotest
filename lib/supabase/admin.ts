import { createClient } from '@supabase/supabase-js'

// Service role — bypasses RLS. Server-side only.
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
