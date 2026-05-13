'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Instagram, Phone } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="py-28 bg-[#0a0a0a] relative overflow-hidden">
      {/* Gold gradient at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.1) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Top separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center gap-2 mb-5">
            <span className="w-6 h-px bg-gold" />
            Fale com a Gente
            <span className="w-6 h-px bg-gold" />
          </span>

          <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[0.95] mb-6">
            Pronto para a<br />
            <span style={{ color: '#D4AF37' }}>próxima viagem?</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Resposta em minutos pelo WhatsApp. Orçamento gratuito, sem compromisso.
            Atendemos Brasília e todo o Centro-Oeste.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              as="a"
              href="https://wa.me/5561984222205?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento."
              variant="gold"
              size="lg"
              leftIcon={<MessageCircle size={18} />}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </Button>
            <Button
              as="a"
              href="/orcamento"
              variant="outline"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Solicitar Orçamento
            </Button>
          </div>

          {/* Secondary contacts */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <a
              href="tel:+5561984222205"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <Phone size={14} />
              (61) 98422-2205
            </a>
            <span className="w-px h-4 bg-white/10" />
            <a
              href="https://instagram.com/amavsturismo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <Instagram size={14} />
              @amavsturismo
            </a>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-gray-600">Base: Brasília, DF</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
