'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import type { SiteStat } from './StatsSection'

function formatValue(n: number, format: SiteStat['format']) {
  if (format === 'currency') {
    if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
    if (n >= 1_000) return `R$ ${Math.round(n / 1_000)}k`
    return `R$ ${n}`
  }
  if (format === 'percent') return `${n}%`
  return n.toLocaleString('pt-BR')
}

function AnimatedNumber({ target, format }: { target: number; format: SiteStat['format'] }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    if (target === 0) {
      setCount(0)
      return
    }
    const duration = 1700
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  return <span ref={ref}>{formatValue(count, format)}</span>
}

export default function StatsClient({ stats }: { stats: SiteStat[] }) {
  return (
    <section className="py-32 md:py-40 surface" id="numeros">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16 md:mb-24"
        >
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Em números
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            Operação real,<br />
            dados ao vivo.
          </h2>
          <p className="mt-6 text-lg leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
            Cada número aqui é calculado pelo sistema conforme o trabalho acontece —
            ou ajustado manualmente pelo administrador quando faz sentido.
          </p>
        </motion.div>

        <div
          className={`grid gap-px ${
            stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
          }`}
          style={{ background: 'var(--border)' }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="surface py-10 md:py-14 px-6 md:px-10"
            >
              <div
                className="font-heading font-semibold tracking-tight text-[clamp(3rem,5.5vw,4.5rem)] leading-none mb-3"
                style={{ color: 'var(--text)' }}
              >
                <AnimatedNumber target={s.value} format={s.format} />
              </div>
              <div className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>
                {s.label}
              </div>
              {s.sub && (
                <div className="text-sm font-light" style={{ color: 'var(--text-dim)' }}>
                  {s.sub}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
