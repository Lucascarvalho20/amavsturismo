import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, clientIp } from '@/lib/supabase-admin'
import { isSameOrigin } from '@/lib/csrf'
import { hitRateLimit } from '@/lib/rate-limit'
import { generateLeadCode } from '@/lib/utils'
import { leadSchema } from '@/lib/validation'

// Recebe pedidos de orçamento (fretamento particular/corporativo).
// Validação no servidor: o navegador nunca grava direto na tabela leads.

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 })
  }
  if (hitRateLimit(`lead:${clientIp(request.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas solicitações. Tente novamente em alguns minutos.' }, { status: 429 })
  }

  const parsed = leadSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
  const d = parsed.data

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  let vehicleCategory: string | null = null
  if (d.vehicle_id) {
    const { data: v } = await supabase.from('vehicles').select('category').eq('id', d.vehicle_id).maybeSingle()
    vehicleCategory = v?.category ?? null
  }

  const code = generateLeadCode()
  const { error } = await supabase.from('leads').insert({
    code,
    name: d.name,
    phone: d.phone,
    email: d.email || null,
    origin: d.origin,
    destination: d.destination || d.origin,
    travel_date: d.travel_date,
    return_date: d.return_date || null,
    passengers: d.passengers,
    vehicle_category: vehicleCategory,
    vehicle_id: vehicleCategory ? d.vehicle_id : null,
    message: d.message || null,
    status: 'pendente',
    source: 'site',
  })

  if (error) {
    console.error('[api/leads] insert failed:', error.message)
    return NextResponse.json({ error: 'Não foi possível registrar o pedido' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, code }, { status: 201 })
}
