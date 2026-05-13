'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, Bus, Route, FileCheck } from 'lucide-react'

const stats = [
  { icon: Calendar, value: 15, suffix: '+', label: 'Anos de Experiência', desc: 'Transportando com segurança desde 2009' },
  { icon: Bus, value: 6, suffix: '', label: 'Veículos na Frota', desc: 'Ônibus, micro-ônibus e vans' },
  { icon: Route, value: 500, suffix: '+', label: 'Viagens Realizadas', desc: 'Em todo o Centro-Oeste' },
  { icon: FileCheck, value: 4, suffix: '', label: 'Contratos Públicos', desc: 'Ativos com órgãos governamentais' },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 bg-navy-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-gold rounded-2xl p-6 text-center group hover:shadow-glow-gold/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-all">
                  <Icon size={22} className="text-gold" />
                </div>
                <div className="font-heading font-black text-4xl text-gold mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white font-semibold text-sm mb-1 font-heading">{stat.label}</div>
                <div className="text-gray-500 text-xs">{stat.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
