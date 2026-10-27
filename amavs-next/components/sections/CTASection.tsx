'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Instagram, Phone } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-32 md:py-44 relative overflow-hidden surface">
      <div className="container mx-auto px-6 md:px-10 max-w-5xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="text-xs font-medium tracking-[0.28em] uppercase mb-6"
            style={{ color: 'var(--text-dim)' }}
          >
            Fale com a gente
          </div>

          <h2 className="font-heading font-semibold tracking-tight leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)] mb-8">
            Tem um edital<br />
            <span className="text-gradient-gold">em andamento?</span>
          </h2>

          <p
            className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12"
            style={{ color: 'var(--text-muted)' }}
          >
            Envie o objeto ou o número do processo. Respondemos com proposta,
            documentação de habilitação e atestados. Para fretamento particular,
            o orçamento sai pelo site ou WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="/licitacoes#proposta"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Solicitar proposta
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/orcamento"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
              style={{
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border-md)',
              }}
            >
              <MessageCircle size={16} />
              Orçamento particular
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--text-dim)' }}>
            <a href="tel:+5561984222205" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone size={14} />
              (61) 98422-2205
            </a>
            <span className="w-px h-4" style={{ background: 'var(--border)' }} />
            <a
              href="https://instagram.com/amavsturismo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Instagram size={14} />
              @amavsturismo
            </a>
            <span className="w-px h-4" style={{ background: 'var(--border)' }} />
            <span>Brasília, DF</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
