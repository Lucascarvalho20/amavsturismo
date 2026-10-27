import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import StatsClient from './StatsClient'

export interface SiteStat {
  key: string
  label: string
  sub: string
  value: number
  format: 'number' | 'currency' | 'percent'
}

export default async function StatsSection() {
  const supabase = createClient()
  // Valores de contratos e leads são lidos com service_role SOMENTE no servidor;
  // ao navegador chegam apenas os números agregados.
  const admin = createAdminClient() ?? supabase

  const [
    { data: configRows },
    { data: vehiclesData },
    { data: contractsData },
    { data: leadsData },
  ] = await Promise.all([
    supabase
      .from('site_stats')
      .select('key,label,sub,value_override,display_order,is_active,format')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase.from('vehicles').select('capacity,status'),
    admin.from('contracts').select('status,value'),
    admin.from('leads').select('status,travel_date'),
  ])

  const fleetSize = vehiclesData?.length ?? 0
  const totalCapacity = (vehiclesData ?? []).reduce(
    (s: number, v: { capacity: number }) => s + (v.capacity ?? 0),
    0,
  )
  const vehiclesAvailable = (vehiclesData ?? []).filter(
    (v: { status: string }) => v.status === 'disponivel',
  ).length
  const activeContracts = (contractsData ?? []).filter(
    (c: { status: string }) => c.status === 'ativo',
  ).length
  const activeContractsValue = (contractsData ?? [])
    .filter((c: { status: string }) => c.status === 'ativo')
    .reduce((s: number, c: { value: number }) => s + (c.value ?? 0), 0)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const tripsYear = (leadsData ?? []).filter((l: { status: string; travel_date: string }) => {
    if (l.status !== 'convertido' || !l.travel_date) return false
    return new Date(l.travel_date).getFullYear() === year
  }).length
  const tripsMonth = (leadsData ?? []).filter((l: { status: string; travel_date: string }) => {
    if (l.status !== 'convertido' || !l.travel_date) return false
    const d = new Date(l.travel_date)
    return d.getFullYear() === year && d.getMonth() === month
  }).length

  const computeAuto = (key: string): number => {
    switch (key) {
      case 'fleet_size': return fleetSize
      case 'total_capacity': return totalCapacity
      case 'vehicles_available': return vehiclesAvailable
      case 'active_contracts': return activeContracts
      case 'active_contracts_value': return activeContractsValue
      case 'trips_year': return tripsYear
      case 'trips_month': return tripsMonth
      default: return 0
    }
  }

  const stats: SiteStat[] = (configRows ?? []).map((row: {
    key: string
    label: string
    sub: string
    value_override: number | null
    format: 'number' | 'currency' | 'percent'
  }) => ({
    key: row.key,
    label: row.label,
    sub: row.sub ?? '',
    value: row.value_override ?? computeAuto(row.key),
    format: row.format ?? 'number',
  }))

  if (stats.length === 0) return null

  return <StatsClient stats={stats} />
}
