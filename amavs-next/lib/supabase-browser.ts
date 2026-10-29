import { createBrowserClient } from '@supabase/ssr'

// Remove um /rest/v1/ colado por engano no fim da URL
function cleanUrl(raw: string): string {
  return raw.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
