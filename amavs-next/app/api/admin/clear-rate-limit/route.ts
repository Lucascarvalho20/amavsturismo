import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { timingSafeEqual } from 'crypto'
import { isSameOrigin } from '@/lib/csrf'

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a), bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

// Apaga as tentativas de login de um e-mail, desbloqueando-o na hora.
// Exige o cabeçalho Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>.
// A chave vai no cabeçalho e não no corpo, que aparece em logs com mais frequência.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 })
  }

  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!expectedKey || !token || !safeEqual(token, expectedKey)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, expectedKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    })

    const { error } = await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email.toLowerCase().trim())

    if (error) {
      return NextResponse.json({ error: 'Erro ao remover bloqueio' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: `Bloqueio removido para ${email}` })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
