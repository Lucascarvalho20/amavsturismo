import { createClient } from '@/lib/supabase-server'
import { heroFallbackSlides } from '@/lib/fleet-photos'
import HeroClient from './HeroClient'
import type { Vehicle } from '@/lib/types'

export default async function HeroSection() {
  const supabase = createClient()

  const [{ data: heroData }, { data: vehiclesData }] = await Promise.all([
    supabase
      .from('hero_images')
      .select('image_url,title,subtitle,display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('vehicles')
      .select('id,name,model,category,capacity,year,status,photo_url,images')
      .order('created_at', { ascending: false }),
  ])

  const configuredSlides = (heroData ?? []).map(
    (h: { image_url: string; title: string | null; subtitle: string | null }) => ({
      image_url: h.image_url,
      title: h.title,
      subtitle: h.subtitle,
      meta: null,
      capacity: null,
    }),
  )

  const vehiclesFallback: Vehicle[] = (vehiclesData ?? []) as Vehicle[]
  // Sem imagens no admin e sem fotos de veículos: usa as fotos reais da frota em /public.
  const slides =
    configuredSlides.length > 0 || vehiclesFallback.some((v) => v.photo_url)
      ? configuredSlides
      : heroFallbackSlides.map((s) => ({ ...s, capacity: null }))

  return <HeroClient slides={slides} vehiclesFallback={vehiclesFallback} />
}
