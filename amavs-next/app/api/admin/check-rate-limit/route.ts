import { NextRequest, NextResponse } from 'next/server'
import { isSameOrigin } from '@/lib/csrf'
import { createAdminClient, clientIp } from '@/lib/supabase-admin'

// Bloqueio de força bruta no login do admin.
//  - 5 falhas do MESMO IP para o mesmo e-mail em 15 min → bloqueia esse IP para esse e-mail
//  - 20 falhas de qualquer IP para o mesmo e-mail em 15 min → bloqueia o e-mail (ataque distribuído)
// Contar só por e-mail (como antes) deixava qualquer pessoa trancar o dono da conta fora do painel.

const WINDOW_MS = 15 * 60 * 1000
const PER_IP_LIMIT = 5
const GLOBAL_LIMIT = 20

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim().slice(0, 254) : ''
  if (!email) return NextResponse.json({ blocked: false })

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ blocked: false })

  const ip = clientIp(request.headers)
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const { data: attempts, error } = await supabase
    .from('login_attempts')
    .select('created_at, ip_address')
    .eq('email', email)
    .eq('success', false)
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
    .limit(GLOBAL_LIMIT + 1)

  if (error) return NextResponse.json({ blocked: false })

  const fromThisIp = (attempts ?? []).filter((a) => a.ip_address === ip)
  const blockedRows =
    fromThisIp.length >= PER_IP_LIMIT ? fromThisIp : (attempts ?? []).length >= GLOBAL_LIMIT ? attempts! : null

  if (blockedRows) {
    const resetAt = new Date(new Date(blockedRows[0].created_at).getTime() + WINDOW_MS).toISOString()
    return NextResponse.json({ blocked: true, resetAt })
  }
  return NextResponse.json({ blocked: false })
}
