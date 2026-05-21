import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Clears login_attempts for a given email so a blocked user can retry immediately.
// Protected by SUPABASE_SERVICE_ROLE_KEY — only callable server-side or by someone
// who already has the service role key (admin recovery scenario).
export async function POST(request: NextRequest) {
  try {
    const { email, serviceKey } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })
    }

    // Validate the caller knows the service role key to prevent abuse
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!expectedKey || serviceKey !== expectedKey) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: `Bloqueio removido para ${email}` })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
