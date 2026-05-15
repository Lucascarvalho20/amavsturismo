import { createClient } from '@/lib/supabase-server'
import HeroClient from './HeroClient'
import type { Vehicle } from '@/lib/types'

export default async function HeroSection() {
  const supabase = createClient()

  const [{ data: heroData }, { data: vehiclesData }, { count: contractsCount }] =
    await Promise.all([
      supabase
        .from('hero_images')
        .select('image_url,title,subtitle,display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('vehicles')
        .select('id,name,model,category,capacity,year,status,photo_url,images')
        .order('created_at', { ascending: false }),
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativo'),
    ])

  const slides =
    (heroData ?? []).map(
      (h: { image_url: string; title: string | null; subtitle: string | null }) => ({
        image_url: h.image_url,
        title: h.title,
        subtitle: h.subtitle,
        meta: null,
        capacity: null,
      }),
    )

  const vehiclesFallback: Vehicle[] = (vehiclesData ?? []) as Vehicle[]
  const fleetCount = vehiclesFallback.length
  const availableNow = vehiclesFallback.filter((v) => v.status === 'disponivel').length
  const activeContracts = contractsCount ?? 0

  return (
    <HeroClient
      slides={slides}
      vehiclesFallback={vehiclesFallback}
      fleetCount={fleetCount}
      availableNow={availableNow}
      activeContracts={activeContracts}
    />
  )
}
