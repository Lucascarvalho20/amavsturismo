'use client'

import { motion } from 'framer-motion'
import { Bus, Building2, PartyPopper, Mountain, GraduationCap, Briefcase } from 'lucide-react'

const services = [
  { icon: Bus, label: 'Fretamento', desc: 'Viagens contínuas com contrato' },
  { icon: Building2, label: 'Licitações', desc: 'Pregão e tomada de preços' },
  { icon: PartyPopper, label: 'Eventos', desc: 'Corporativos e sociais' },
  { icon: Mountain, label: 'Excursões', desc: 'Turismo e lazer em grupo' },
  { icon: GraduationCap, label: 'Escolar', desc: 'Transporte de estudantes' },
  { icon: Briefcase, label: 'Corporativo', desc: 'Traslado de colaboradores' },
]

export default function ServicesStrip() {
  return (
    <div className="bg-navy-100 border-y border-white/5 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/40 transition-all">
                  <Icon size={22} className="text-gold" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-semibold font-heading">{service.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{service.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
