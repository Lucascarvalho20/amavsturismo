import Link from 'next/link'
import { ArrowUpRight, Images } from 'lucide-react'
import { portfolioAreaLabel, portfolioKindLabel, type PortfolioItem } from '@/lib/portfolio'

// Card de um serviço prestado. Com foto: capa no topo. Sem foto: destaque numérico.

export default function PortfolioCard({ item }: { item: PortfolioItem }) {
  const cover = item.photos[0]
  return (
    <Link
      href={`/licitacoes/${item.slug}`}
      className="group flex flex-col rounded-3xl overflow-hidden transition-shadow hover:shadow-lg"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {cover && (
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={item.organization} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {item.photos.length > 1 && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-black/60" style={{ color: '#fff' }}>
              <Images size={12} /> {item.photos.length}
            </span>
          )}
        </div>
      )}
      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="font-heading font-semibold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
                {item.acronym || item.organization}
              </span>
              {item.kind === 'orgao_publico' && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}>
                  {portfolioKindLabel[item.kind]}
                </span>
              )}
            </div>
            {item.acronym && <div className="text-sm" style={{ color: 'var(--text)' }}>{item.organization}</div>}
            {item.parent_org && <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{item.parent_org}</div>}
          </div>
          {item.highlight_value && (
            <div className="text-right flex-shrink-0">
              <div className="font-heading font-semibold text-3xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>{item.highlight_value}</div>
              <div className="text-[11px] max-w-[8rem]" style={{ color: 'var(--text-dim)' }}>{item.highlight_label}</div>
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.summary}</p>
        <div className="mt-auto pt-5 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          {item.period_label && <span className="font-medium" style={{ color: 'var(--text)' }}>{item.period_label}</span>}
          {item.areas.map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
              {portfolioAreaLabel[a] ?? a}
            </span>
          ))}
          <ArrowUpRight size={16} className="ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: 'var(--gold-strong)' }} />
        </div>
      </div>
    </Link>
  )
}
