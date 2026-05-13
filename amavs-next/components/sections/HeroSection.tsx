'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Shield, Clock, Award, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'

const trustBadges = [
  { icon: Shield, label: 'Documentação Regularizada' },
  { icon: Clock, label: 'Atendimento 24/7' },
  { icon: Award, label: '+15 Anos de Experiência' },
]

const stats = [
  { value: 500, suffix: '+', label: 'Viagens Realizadas' },
  { value: 6, suffix: '', label: 'Veículos na Frota' },
  { value: 4, suffix: '', label: 'Contratos Públicos' },
]

const marqueeItems = [
  '500+ Viagens Realizadas',
  'Frota Certificada',
  'Contratos Governamentais',
  'Documentação Regularizada',
  '+15 Anos de Experiência',
  'Motoristas Habilitados',
  'Rastreamento GPS',
  'Atendimento 24/7',
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-navy-200">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Subtle animated grid */}
      <div className="absolute inset-0 bg-grid opacity-25" />

      {/* Gradient blob — top right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.03) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Gradient blob — bottom left */}
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Radial glow center */}
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-200 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-28 pb-6 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
            <span className="text-gold text-sm font-semibold tracking-wide">
              Fretamento Profissional em Brasília
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 tracking-tight"
          >
            <span className="text-white">Transporte </span>
            <span className="text-gradient-gold">Premium</span>
            <br />
            <span className="text-white">Para Sua </span>
            <span className="text-gradient-gold">Empresa</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Ônibus, micro-ônibus e vans para contratos governamentais, eventos corporativos e
            excursões. Frota moderna, motoristas habilitados e documentação em dia.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Button
              as="a"
              href="/orcamento"
              variant="gold"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Solicitar Orçamento Grátis
            </Button>
            <Button as="a" href="/frota" variant="outline" size="lg">
              Ver Nossa Frota
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-14"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon size={15} className="text-gold shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`text-center px-4 py-5 ${
                      i < stats.length - 1 ? 'border-r border-white/10' : ''
                    }`}
                    style={{ borderTop: '2px solid #D4AF37' }}
                  >
                    <div className="font-heading font-black text-2xl text-gold mb-1">
                      <StatCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-gray-400 text-xs leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee trust signals */}
      <div className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-navy-100/40 backdrop-blur-sm py-4">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-gray-500 text-sm px-8 shrink-0"
            >
              <span className="w-1 h-1 rounded-full bg-gold/50 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600"
      >
        <span className="text-xs tracking-widest uppercase">Rolar</span>
        <ChevronDown size={16} className="animate-bounce" />
      </motion.div>
    </section>
  )
}

function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 2200
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
    <div ref={ref}>
      {count}{suffix}
    </div>
  )
}
