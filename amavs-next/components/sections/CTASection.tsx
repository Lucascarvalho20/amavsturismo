'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="py-20 bg-navy-100">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-dark rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
          style={{ borderTopColor: '#D4AF37', borderTopWidth: '3px' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-radial-gold opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-3 block font-heading">
              Pronto para Contratar?
            </span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4 leading-tight">
              Solicite seu Orçamento
              <br />
              <span className="text-gradient-gold">Sem Compromisso</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Resposta em até 30 minutos durante o horário comercial. Atendemos Brasília, Goiânia,
              Entorno e viagens para todo o Brasil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              >
                Chamar no WhatsApp
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              Ou ligue: (61) 98422-2205 — Atendimento 24 horas
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
