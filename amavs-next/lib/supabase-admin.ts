import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

// Cliente com service_role: ignora RLS. Uso EXCLUSIVO em Route Handlers e Server Components
// que devolvem dados já filtrados/agregados ao navegador. Nunca importar em 'use client'.
if (typeof window !== 'undefined') {
  throw new Error('supabase-admin não pode ser usado no navegador')
}

let cached: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!cached) {
    cached = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cached
}

/** IP do cliente como informado pela Vercel (primeiro valor de x-forwarded-for). */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
}
