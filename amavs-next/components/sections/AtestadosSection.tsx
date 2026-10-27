'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FileCheck2 } from 'lucide-react'
import { publicAtestados } from '@/lib/atestados'

// Prova de execução para comissões de licitação: órgãos que emitiram
// atestado de capacidade técnica. Destaque para os que têm números.

export default function AtestadosSection() {
  const featured = publicAtestados.filter((a) => a.highlight).slice(0, 4)
  const others = publicAtestados.filter((a) => !featured.includes(a))

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
            {publicAtestados.length} órgãos públicos emitiram atestado de que os serviços foram
            prestados no prazo e com a qualidade contratada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="surface-card rounded-3xl p-7 flex flex-col"
            >
              <div className="font-heading font-semibold text-5xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>
                {a.highlight!.value}
              </div>
              <div className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>{a.highlight!.label}</div>
              <div className="mt-auto pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="font-medium text-[15px]" style={{ color: 'var(--text)' }}>{a.issuer}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {a.parent ? `${a.parent} · ` : ''}{a.period}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
          <FileCheck2 size={16} style={{ color: 'var(--gold-strong)' }} />
          <span className="text-sm mr-2" style={{ color: 'var(--text-muted)' }}>Também atestam:</span>
          {others.map((a) => (
            <span
              key={a.id}
              title={a.issuer}
              className="px-3 h-8 inline-flex items-center rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {a.acronym}
            </span>
          ))}
          <a
            href="/licitacoes#atestados"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--gold-strong)' }}
          >
            Ver todos os atestados <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
