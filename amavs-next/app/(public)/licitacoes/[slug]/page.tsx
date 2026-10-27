import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileCheck2, MapPin, CalendarDays, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { loadPortfolioItem, portfolioAreaLabel, portfolioKindLabel } from '@/lib/portfolio'
import { formatDate } from '@/lib/utils'
import PhotoGallery from '@/components/PhotoGallery'

interface Props {
  params: { slug: string }
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

async function getItem(slug: string) {
  if (!SLUG_RE.test(slug) || slug.length > 120) return null
  return loadPortfolioItem(createClient(), slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItem(params.slug)
  if (!item) return { title: 'Serviço não encontrado' }
  return {
    title: `${item.acronym ?? item.organization} — Serviço prestado`,
    description: item.summary,
    openGraph: item.photos[0] ? { images: [{ url: item.photos[0] }] } : undefined,
  }
}

export default async function PortfolioItemPage({ params }: Props) {
  const item = await getItem(params.slug)
  if (!item) notFound()

  const facts = [
    item.period_label && { icon: CalendarDays, label: 'Período', value: item.period_label },
    item.location && { icon: MapPin, label: 'Local', value: item.location },
    item.attested_at && { icon: FileCheck2, label: 'Atestado emitido em', value: formatDate(item.attested_at) },
  ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string; value: string }>

  return (
    <div className="surface min-h-screen pt-28 md:pt-36 pb-32">
      <div className="container mx-auto px-6 md:px-10 max-w-5xl">
        <Link href="/licitacoes#atestados" className="inline-flex items-center gap-1.5 text-sm mb-10 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Serviços prestados
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-dim)' }}>
              {portfolioKindLabel[item.kind]}
            </span>
            {item.areas.map((a) => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {portfolioAreaLabel[a] ?? a}
              </span>
            ))}
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            {item.organization}
          </h1>
          {item.parent_org && <p className="mt-2 text-lg" style={{ color: 'var(--text-muted)' }}>{item.parent_org}</p>}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-12 mb-14">
          <div>
            <p className="text-xl font-light leading-relaxed" style={{ color: 'var(--text)' }}>{item.summary}</p>
            {item.description && (
              <div className="mt-6 text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{item.description}</div>
            )}
            {item.reference && (
              <p className="mt-8 text-sm font-mono" style={{ color: 'var(--text-dim)' }}>{item.reference}</p>
            )}
          </div>
          <aside className="space-y-6">
            {item.highlight_value && (
              <div className="rounded-3xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="font-heading font-semibold text-5xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>{item.highlight_value}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{item.highlight_label}</div>
              </div>
            )}
            {facts.length > 0 && (
              <dl className="space-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="flex gap-3">
                    <f.icon size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gold-strong)' }} />
                    <div>
                      <dt className="text-xs" style={{ color: 'var(--text-dim)' }}>{f.label}</dt>
                      <dd className="font-medium" style={{ color: 'var(--text)' }}>{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </div>

        {item.photos.length > 0 && (
          <section className="mb-14">
            <h2 className="font-heading font-semibold text-2xl tracking-tight mb-6">Fotos da operação</h2>
            <PhotoGallery photos={item.photos} alt={item.organization} />
          </section>
        )}

        <div className="rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            O atestado original, assinado pelo contratante, é enviado à comissão de licitação mediante solicitação.
          </p>
          <a href="https://wa.me/5561984222205" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full font-medium flex-shrink-0" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            <MessageCircle size={16} /> Solicitar atestado
          </a>
        </div>
      </div>
    </div>
  )
}
