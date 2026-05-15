import { createClient } from '@/lib/supabase-server'
import ClientsClient from './ClientsClient'

export interface FeaturedClient {
  id: string
  name: string
  acronym: string | null
  logo_url: string | null
}

export default async function ClientsSection() {
  const supabase = createClient()
  const { data } = await supabase
    .from('featured_clients')
    .select('id,name,acronym,logo_url,display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const clients: FeaturedClient[] = (data ?? []) as FeaturedClient[]
  if (clients.length === 0) return null

  return <ClientsClient clients={clients} />
}
