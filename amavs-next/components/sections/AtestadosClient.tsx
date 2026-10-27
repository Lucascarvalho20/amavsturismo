'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FileCheck2 } from 'lucide-react'
import type { PortfolioItem } from '@/lib/portfolio'

// Serviços prestados a órgãos públicos (portfólio). Destaque para os que têm números
// ou fotos; os demais aparecem como siglas.

export default function AtestadosClient({ items }: { items: PortfolioItem[] }) {
  const publicItems = items.filter((a) => a.kind === 'orgao_publico')
  const featured = publicItems.filter((a) => a.highlight_value || a.photos.length > 0).slice(0, 4)
  const others = publicItems.filter((a) => !featured.includes(a))
  if (publicItems.length === 0) return null

  return (
    <section className="py-32 md:py-40 surface" id="atestados">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between flex-wrap gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
              Atestados de capacidade técnica
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
              Quem já contratou,<br />
              <span className="text-gradient-gold">atesta.</span>
            </h2>
          </div>
          <p className="text-lg font-light leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
            {publicItems.length} órgãos públicos emitiram atestado de que os serviços foram
            prestados no prazo e com a qualidade contratada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((a, i) => (
            <motion.a
              key={a.id}
              href={`/licitacoes/${a.slug}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="surface-card rounded-3xl overflow-hidden flex flex-col card-hover"
            >
              {a.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photos[0]} alt={a.organization} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              )}
              <div className="p-7 flex flex-col flex-1">
                {a.highlight_value && (
                  <>
                    <div className="font-heading font-semibold text-5xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>
                      {a.highlight_value}
                    </div>
                    <div className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>{a.highlight_label}</div>
                  </>
                )}
                <div className="mt-auto pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="font-medium text-[15px]" style={{ color: 'var(--text)' }}>{a.organization}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {a.parent_org ? `${a.parent_org} · ` : ''}{a.period_label}
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
          <FileCheck2 size={16} style={{ color: 'var(--gold-strong)' }} />
          <span className="text-sm mr-2" style={{ color: 'var(--text-muted)' }}>Também atestam:</span>
          {others.map((a) => (
            <a
              key={a.id}
              href={`/licitacoes/${a.slug}`}
              title={a.organization}
              className="px-3 h-8 inline-flex items-center rounded-full text-xs font-medium hover:opacity-70"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {a.acronym ?? a.organization}
            </a>
          ))}
          <a
            href="/licitacoes#atestados"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--gold-strong)' }}
          >
            Ver serviços prestados <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
