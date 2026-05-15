'use client'

import { motion } from 'framer-motion'
import type { FeaturedClient } from './ClientsSection'

function initials(name: string): string {
  return name
    .replace(/[^\w\sÀ-ÿ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

export default function ClientsClient({ clients }: { clients: FeaturedClient[] }) {
  return (
    <section className="py-32 md:py-40" style={{ background: 'var(--bg-elevated)' }} id="clientes">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16 md:mb-20"
        >
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Clientes
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            Quem confia<br />
            no nosso trabalho.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px" style={{ background: 'var(--border)' }}>
          {clients.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="surface py-12 px-6 flex flex-col items-center justify-center text-center min-h-[170px]"
            >
              {c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.logo_url}
                  alt={c.name}
                  className="h-10 max-w-[140px] object-contain mb-3 opacity-80"
                />
              ) : (
                <div
                  className="font-heading font-semibold text-2xl tracking-tight mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {c.acronym || initials(c.name)}
                </div>
              )}
              <div className="text-xs leading-snug" style={{ color: 'var(--text-dim)' }}>
                {c.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
