'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Clock, Award, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const trustBadges = [
  { icon: Shield, label: 'Documentação Regularizada' },
  { icon: Clock, label: 'Atendimento 24/7' },
  { icon: Award, label: '+15 Anos de Experiência' },
]

const stats = [
  { value: '500+', label: 'Viagens Realizadas' },
  { value: '6', label: 'Veículos na Frota' },
  { value: '4', label: 'Contratos Públicos' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-200">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-200 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6"
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6"
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
            className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon size={16} className="text-gold shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Floating stats card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="glass-gold rounded-2xl px-6 py-5 max-w-md mx-auto"
          >
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-heading font-black text-2xl text-gold">{stat.value}</div>
                  <div className="text-gray-400 text-xs mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500"
      >
        <span className="text-xs tracking-widest uppercase">Rolar</span>
        <ChevronDown size={18} className="animate-bounce" />
      </motion.div>
    </section>
  )
}
