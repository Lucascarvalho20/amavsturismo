import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function cleanUrl(raw: string): string {
  return raw.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {
            // Server Component — cookies can only be set from Server Actions or Route Handlers
          }
        },
      },
    }
  )
}

export async function getAuthUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
