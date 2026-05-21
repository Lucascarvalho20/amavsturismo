import { NextRequest } from 'next/server'

/**
 * Verifies that the request originates from the same site.
 * Supabase SSR cookies are SameSite=Lax, which already blocks most CSRF,
 * but this explicit origin check adds a second layer for admin API routes.
 *
 * Returns true if the origin is trusted, false otherwise.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Server-to-server calls (no Origin header) are allowed — e.g. Vercel cron jobs
  if (!origin) return true

  // Strip protocol and compare with host
  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}
