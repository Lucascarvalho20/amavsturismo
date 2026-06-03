import { createClient } from '@/lib/supabase-server'
import GaleriaClient from './GaleriaClient'

export default async function GaleriaSection() {
  const supabase = createClient()
  const { data } = await supabase
    .from('trip_gallery')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(12)

  if (!data || data.length === 0) return null

  return <GaleriaClient items={data} />
}
