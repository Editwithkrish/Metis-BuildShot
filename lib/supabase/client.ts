import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // A harmless placeholder lets preview-only screens render without a
  // Supabase project. Calls that actually require persisted data remain
  // unavailable until real credentials are provided.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://local-preview.invalid'
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'local-preview-key'

  return createBrowserClient(
    url,
    key
  )
}
