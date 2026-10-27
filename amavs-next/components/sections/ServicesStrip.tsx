'use client'

import { motion } from 'framer-motion'
import { Landmark, Flag, Users, Briefcase, ArrowUpRight } from 'lucide-react'

const services = [
  { icon: Landmark,  label: 'Contratos públicos',          desc: 'Participamos de pregões, dispensas e adesões a ata de transporte de passageiros, com a habilitação sempre em dia.' },
  { icon: Flag,      label: 'Eventos oficiais e comboios', desc: 'Desfiles, jogos militares, congressos e operações eleitorais com dezenas de veículos coordenados.' },
  { icon: Users,     label: 'Transporte de servidores',    desc: 'Deslocamento de servidores, delegações e comitivas no DF e entre estados, com motoristas habilitados.' },
  { icon: Briefcase, label: 'Fretamento corporativo',      desc: 'Empresas, entidades de classe e grupos. Orçamento rápido pelo site ou WhatsApp.' },
]

export default function ServicesStrip() {
  return (
    <section className="py-32 md:py-40" style={{ background: 'var(--bg-elevated)' }} id="servicos">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between flex-wrap gap-6 mb-16 md:mb-20"
        >
          <div className="max-w-xl">
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
              O que fazemos
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
              Transporte<br />
              para o governo.
            </h2>
          </div>
          <p className="text-lg font-light leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
            Hoje a maior parte do trabalho vem de licitações vencidas. Também atendemos
            empresas e entidades em Brasília e em todo o país.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-default"
                style={{ background: 'var(--bg)' }}
              >
                <div className="p-10 md:p-14 h-full flex flex-col justify-between min-h-[280px]">
                  <div className="flex items-start justify-between gap-4 mb-10">
                    <Icon size={28} strokeWidth={1.4} style={{ color: 'var(--gold-strong)' }} />
                    <ArrowUpRight
                      size={20}
                      strokeWidth={1.5}
                      className="opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
                      style={{ color: 'var(--text-dim)' }}
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl md:text-3xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                      {s.label}
                    </h3>
                    <p className="text-base font-light leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
