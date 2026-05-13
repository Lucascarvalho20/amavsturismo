import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import type { Vehicle } from '@/lib/types'
import FrotaClient from './FrotaClient'

export const metadata: Metadata = {
  title: 'Frota — Ônibus, Micro-ônibus e Vans',
  description: 'Conheça a frota completa da Amav\'s Turismo: ônibus executivos, micro-ônibus e vans para transporte de grupos em Brasília e todo o Brasil.',
}

export default async function FrotaPage() {
  let vehicles: Vehicle[] = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('name', { ascending: true })
    vehicles = (data ?? []) as Vehicle[]
  } catch {
    vehicles = []
  }

  return <FrotaClient vehicles={vehicles} />
}
