'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, Bus, Route, FileCheck } from 'lucide-react'

const stats = [
  {
    icon: Calendar,
    value: 15,
    suffix: '+',
    label: 'Anos de Experiência',
    desc: 'Transportando com segurança desde 2009',
  },
  {
    icon: Bus,
    value: 6,
    suffix: '',
    label: 'Veículos na Frota',
    desc: 'Ônibus, micro-ônibus e vans',
  },
  {
    icon: Route,
    value: 500,
    suffix: '+',
    label: 'Viagens Realizadas',
    desc: 'Em todo o Centro-Oeste',
  },
  {
    icon: FileCheck,
    value: 4,
    suffix: '',
    label: 'Contratos Públicos',
    desc: 'Ativos com órgãos governamentais',
  },
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
    <section className="py-20 bg-navy-100 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
      {/* Gold radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-navy-100 px-6 py-8 text-center group hover:bg-navy-50/20 transition-colors duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 100%)',
                  }}
                >
                  <Icon size={22} className="text-gold" />
                </div>

                <div
                  className="font-heading font-black text-4xl mb-1.5"
                  style={{ color: '#D4AF37' }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>

                <div className="text-white font-semibold text-sm mb-1.5 font-heading">
                  {stat.label}
                </div>
                <div className="text-gray-500 text-xs leading-relaxed">{stat.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
