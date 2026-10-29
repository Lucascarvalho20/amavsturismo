import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSameOrigin } from '@/lib/csrf'
import { createAdminClient, clientIp } from '@/lib/supabase-admin'

// Registra tentativas de login do painel.
// Falha: gravada com e-mail + IP (o bloqueio é por IP, então registrar falhas falsas
// só prejudica o próprio IP de quem envia).
// Sucesso: só é gravado se a requisição carregar uma sessão válida do MESMO e-mail —
// ninguém consegue forjar "login com sucesso" no log de auditoria.

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim().slice(0, 254) : ''
  if (!email) return NextResponse.json({ ok: true })

  const admin = createAdminClient()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!admin || !url || !anonKey) return NextResponse.json({ ok: true })

  const ip = clientIp(request.headers)
  const userAgent = request.headers.get('user-agent')?.slice(0, 300) ?? ''

  if (body?.success !== true) {
    await admin.from('login_attempts').insert({ email, ip_address: ip, success: false })
    return NextResponse.json({ ok: true })
  }

  // Confirma a sessão pelos cookies da própria requisição
  const supabase = createServerClient(url, anonKey, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== email) {
    return NextResponse.json({ ok: true })
  }

  await Promise.all([
    admin.from('login_attempts').insert({ email, ip_address: ip, success: true }),
    admin.from('audit_log').insert({
      user_id: user.id,
      user_email: email,
      action: 'login',
      resource: 'auth',
      ip_address: ip,
      user_agent: userAgent,
    }),
  ])
  return NextResponse.json({ ok: true })
}
