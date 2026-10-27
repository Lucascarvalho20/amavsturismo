import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { loadPortfolio, staticPortfolio } from '@/lib/portfolio'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amavsturismo.com'

export const revalidate = 3600

async function portfolioSlugs(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return staticPortfolio.map((p) => p.slug)
  const items = await loadPortfolio(createClient(url, key, { auth: { persistSession: false } }))
  return items.map((p) => p.slug)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: Array<[string, number]> = [
    ['/', 1],
    ['/licitacoes', 0.9],
    ['/frota', 0.7],
    ['/sobre', 0.6],
    ['/contato', 0.6],
    ['/orcamento', 0.4],
  ]
  const slugs = await portfolioSlugs()
  return [
    ...pages.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' as const, priority })),
    ...slugs.map((slug) => ({ url: `${SITE_URL}/licitacoes/${slug}`, changeFrequency: 'yearly' as const, priority: 0.7 })),
  ]
}
