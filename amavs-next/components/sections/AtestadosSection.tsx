import { createClient } from '@/lib/supabase-server'
import { loadPortfolio } from '@/lib/portfolio'
import AtestadosClient from './AtestadosClient'

export default async function AtestadosSection() {
  const items = await loadPortfolio(createClient())
  return <AtestadosClient items={items} />
}
