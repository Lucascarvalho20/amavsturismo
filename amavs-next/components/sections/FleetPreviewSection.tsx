import { createClient } from '@/lib/supabase-server'
import FleetPreviewClient from './FleetPreviewClient'
import type { Vehicle } from '@/lib/types'

export default async function FleetPreviewSection() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select('id,name,model,category,capacity,year,price_km,price_day,status,features,photo_url,images')
    .order('name')

  const vehicles: Vehicle[] = error || !data ? [] : (data as Vehicle[])

  return <FleetPreviewClient vehicles={vehicles} />
}
