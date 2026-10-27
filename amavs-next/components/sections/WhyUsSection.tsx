'use client'

import { motion } from 'framer-motion'
import { FileCheck, Award, Clock, ShieldCheck, Headphones, MapPin } from 'lucide-react'

const reasons = [
  { icon: Award,       title: 'Experiência comprovada', desc: 'Atestados de capacidade técnica do Exército, CFC, MPT e Ministério da Saúde.' },
  { icon: FileCheck,   title: 'Documentação completa', desc: 'ANTT, RNTRC, seguro de passageiros e CRLV sempre em dia.' },
  { icon: ShieldCheck, title: 'Motoristas habilitados', desc: 'CNH categoria D ou E com cursos de transporte coletivo.' },
  { icon: Clock,       title: 'Pontualidade',          desc: 'GPS embarcado e controle de rotas em tempo real.' },
  { icon: MapPin,      title: 'Base em Brasília',      desc: 'Garagem no DF e operações já realizadas no Ceará, Paraná e Tocantins.' },
  { icon: Headphones,  title: 'Fiscal de contrato atendido', desc: 'Contato direto com a coordenação para ajustes de rota, horário e frota durante a execução.' },
]

export default function WhyUsSection() {
  return (
    <section className="py-32 md:py-40 surface" id="sobre">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-20 md:mb-28"
        >
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Por que a Amav's
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            Pronto para<br />
            <span className="text-gradient-gold">o seu processo.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-14 gap-x-12 md:gap-x-16">
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300"
                  style={{ background: 'var(--gold-muted)' }}
                >
                  <Icon size={22} style={{ color: 'var(--gold-strong)' }} strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 tracking-tight" style={{ color: 'var(--text)' }}>
                  {r.title}
                </h3>
                <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {r.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
