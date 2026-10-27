import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

// Disponibilidade pública da frota.
// Devolve APENAS períodos ocupados (datas + tipo). Nome de cliente, telefone,
// título e observações de bloqueios nunca saem do servidor.

export const dynamic = 'force-dynamic'

const VEHICLE_COLUMNS = 'id,slug,name,model,category,capacity,year,status,features,photo_url,images,price_km,price_day'
const UUID_RE = /^[0-9a-f-]{36}$/i

export interface BusyPeriod {
  id: string
  vehicle_id: string
  start_date: string
  end_date: string | null
  is_indefinite: boolean
  block_type: 'reserva' | 'contrato_privado' | 'manutencao' | 'outro'
}

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ vehicles: [], busy: [] }, { status: 503 })
  }

  const vehicleId = request.nextUrl.searchParams.get('vehicle')
  if (vehicleId && !UUID_RE.test(vehicleId)) {
    return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)

  let blocksQ = supabase
    .from('vehicle_blocks')
    .select('id,vehicle_id,start_date,end_date,is_indefinite,block_type')
    .or(`end_date.gte.${today},is_indefinite.eq.true,end_date.is.null`)
  let resQ = supabase
    .from('reservations')
    .select('id,vehicle_id,start_date,end_date,status')
    .neq('status', 'cancelada')
    .gte('end_date', today)
  if (vehicleId) {
    blocksQ = blocksQ.eq('vehicle_id', vehicleId)
    resQ = resQ.eq('vehicle_id', vehicleId)
  }

  const [vehiclesRes, blocksRes, resRes] = await Promise.all([
    vehicleId
      ? Promise.resolve({ data: [] })
      : supabase.from('vehicles').select(VEHICLE_COLUMNS).order('capacity'),
    blocksQ,
    resQ,
  ])

  const busy: BusyPeriod[] = [
    ...((blocksRes.data ?? []) as BusyPeriod[]).map((b) => ({
      id: b.id,
      vehicle_id: b.vehicle_id,
      start_date: b.start_date,
      end_date: b.end_date,
      is_indefinite: b.is_indefinite,
      block_type: b.block_type,
    })),
    ...((resRes.data ?? []) as Array<{ id: string; vehicle_id: string; start_date: string; end_date: string }>).map(
      (r) => ({
        id: r.id,
        vehicle_id: r.vehicle_id,
        start_date: r.start_date,
        end_date: r.end_date,
        is_indefinite: false,
        block_type: 'reserva' as const,
      }),
    ),
  ]

  return NextResponse.json(
    { vehicles: vehiclesRes.data ?? [], busy },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
