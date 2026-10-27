import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, clientIp } from '@/lib/supabase-admin'
import { isSameOrigin } from '@/lib/csrf'
import { hitRateLimit } from '@/lib/rate-limit'
import { bidSchema } from '@/lib/validation'

// Recebe pedidos de proposta/cotação vindos de órgãos públicos (pregoeiros,
// setores de compras, fiscais de contrato). Grava em bid_requests via service_role.

function bidCode() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 4).toUpperCase().padStart(4, '0')
  return `LIC-${ymd}-${rand}`
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 })
  }
  if (hitRateLimit(`bid:${clientIp(request.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas solicitações. Tente novamente em alguns minutos.' }, { status: 429 })
  }

  const parsed = bidSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', fields: Object.keys(parsed.error.flatten().fieldErrors) },
      { status: 400 },
    )
  }
  const d = parsed.data

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  const code = bidCode()
  const { error } = await supabase.from('bid_requests').insert({
    code,
    organization: d.organization,
    contact_name: d.contact_name,
    role: d.role || null,
    email: d.email.toLowerCase(),
    phone: d.phone,
    modality: d.modality,
    process_number: d.process_number || null,
    session_date: d.session_date || null,
    service_start: d.service_start || null,
    vehicles_needed: d.vehicles_needed || null,
    object: d.object,
    edital_url: d.edital_url || null,
  })

  if (error) {
    console.error('[api/licitacoes] insert failed:', error.message)
    return NextResponse.json({ error: 'Não foi possível registrar a solicitação', code }, { status: 500 })
  }
  return NextResponse.json({ ok: true, code }, { status: 201 })
}
