'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Instagram, Star, Clock, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'

const socialProof = [
  { icon: Star, text: '5.0 no Google' },
  { icon: Clock, text: 'Resposta em 30 min' },
  { icon: Shield, text: 'ANTT Regularizada' },
]

export default function CTASection() {
  return (
    <section className="py-24 bg-navy-100 relative overflow-hidden">
      {/* Dramatic gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(212,175,55,0.12) 0%, transparent 65%)',
        }}
      />
      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 30%, rgba(212,175,55,0.6) 50%, rgba(212,175,55,0.4) 70%, transparent 100%)',
        }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              Pronto para Contratar?
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl md:text-6xl text-white mb-5 leading-[1.05] tracking-tight"
          >
            Solicite seu Orçamento{' '}
            <span className="text-gradient-gold block md:inline">Sem Compromisso</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Resposta em até 30 minutos durante o horário comercial. Atendemos Brasília, Goiânia,
            Entorno e viagens para todo o Brasil.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button
              as="a"
              href="/orcamento"
              variant="gold"
              size="xl"
              rightIcon={<ArrowRight size={20} />}
            >
              Solicitar Orçamento Grátis
            </Button>
            <Button
              as="a"
              href="https://wa.me/5561984222205"
              variant="outline"
              size="xl"
              leftIcon={<MessageCircle size={20} />}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chamar no WhatsApp
            </Button>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-6"
          >
            {socialProof.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Icon size={13} className="text-gold/70" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Instagram link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <a
              href="https://instagram.com/amavsturismo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gold text-sm transition-colors"
            >
              <Instagram size={14} />
              <span>@amavsturismo</span>
            </a>
            <span className="text-gray-700 mx-3 text-sm">·</span>
            <a
              href="tel:+5561984222205"
              className="text-gray-500 hover:text-gold text-sm transition-colors"
            >
              (61) 98422-2205
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
