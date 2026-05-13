'use client'

import { motion } from 'framer-motion'
import Section, { SectionHeader } from '@/components/ui/Section'

const partners = [
  { name: 'Ministério da Educação', acronym: 'MEC' },
  { name: 'Ministério da Saúde', acronym: 'MS' },
  { name: 'SESI-DF', acronym: 'SESI' },
  { name: 'SENAC-DF', acronym: 'SENAC' },
  { name: 'Tribunal de Justiça do DF', acronym: 'TJDF' },
  { name: 'Câmara Legislativa do DF', acronym: 'CLDF' },
  { name: 'SEBRAE-DF', acronym: 'SEBRAE' },
  { name: 'EMBRAPA', acronym: 'EMBRAPA' },
]

export default function ClientsSection() {
  return (
    <Section className="py-20 bg-navy-100" id="clientes">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Nossos Clientes"
          title="Parceiros que Confiam em Nós"
          subtitle="Atendemos órgãos públicos, autarquias e empresas privadas em todo o Distrito Federal."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-dark rounded-xl p-5 text-center group hover:border-gold/20 hover:shadow-glass-gold transition-all duration-300"
            >
              <div className="font-heading font-black text-xl text-gold mb-1 group-hover:text-gold-200 transition-colors">
                {partner.acronym}
              </div>
              <div className="text-gray-400 text-xs leading-tight">{partner.name}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">
          E muitas outras empresas e órgãos em Brasília e Entorno.
        </p>
      </div>
    </Section>
  )
}
