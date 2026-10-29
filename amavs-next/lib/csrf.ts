import { NextRequest } from 'next/server'

/**
 * Confere se a requisição veio do próprio site.
 * Os cookies do Supabase já são SameSite=Lax, o que barra a maior parte dos
 * ataques CSRF; conferir o cabeçalho Origin é uma segunda camada.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Chamada de servidor para servidor (sem Origin), como um cron da Vercel, é aceita
  if (!origin) return true

  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}
