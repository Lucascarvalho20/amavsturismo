'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 15, suffix: '+', label: 'Anos de Experiência', sub: 'Atuando desde 2009' },
  { value: 500, suffix: '+', label: 'Viagens Realizadas', sub: 'No Centro-Oeste' },
  { value: 100, suffix: '%', label: 'Documentação Regular', sub: 'ANTT · SICAF · CNH E' },
  { value: 4, suffix: '', label: 'Contratos Públicos', sub: 'Gov. Federal e DF' },
]

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true })

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const total = 50
    const timer = setInterval(() => {
      frame++
      setCount(Math.round((frame / total) * target))
      if (frame >= total) clearInterval(timer)
    }, 1600 / total)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsSection() {
  return (
    <section className="py-20 bg-[#111] relative overflow-hidden">
      {/* Gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)' }}
      />
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.05]">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-[#111] px-6 md:px-10 py-10 text-center"
            >
              <div className="font-heading font-black text-5xl md:text-6xl text-gold tracking-tight mb-2">
                <AnimatedNumber target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-white font-semibold text-sm mb-1">{s.label}</div>
              <div className="text-gray-600 text-xs">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
