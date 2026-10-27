import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amavsturismo.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<[string, number]> = [
    ['/', 1],
    ['/licitacoes', 0.9],
    ['/frota', 0.8],
    ['/sobre', 0.6],
    ['/contato', 0.6],
    ['/orcamento', 0.5],
  ]
  return pages.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority,
  }))
}
