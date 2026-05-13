'use client'

import { motion } from 'framer-motion'
import { Bus, Building2, Mountain, Briefcase } from 'lucide-react'

const services = [
  {
    icon: Bus,
    label: 'Fretamento Corporativo',
    desc: 'Transporte regular de colaboradores com contrato mensal ou anual.',
  },
  {
    icon: Building2,
    label: 'Contratos Públicos',
    desc: 'Especialistas em pregão eletrônico, SICAF regularizado e documentação completa.',
  },
  {
    icon: Mountain,
    label: 'Excursões e Turismo',
    desc: 'Pacotes para grupos, passeios regionais e viagens de lazer.',
  },
  {
    icon: Briefcase,
    label: 'Eventos e Traslados',
    desc: 'Transporte para eventos corporativos, feiras e congressos em Brasília.',
  },
]

export default function ServicesStrip() {
  return (
    <div className="bg-[#0d0d0d] border-y border-white/[0.05]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-4 px-6 py-8 group hover:bg-white/[0.02] transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/15 transition-colors mt-0.5">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1 font-heading">{s.label}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
