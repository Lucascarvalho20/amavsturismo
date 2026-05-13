'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileCheck, Award, Clock, ShieldCheck, Headphones, MapPin } from 'lucide-react'

const featured = {
  icon: Award,
  title: '15 Anos Especializados em Licitações Públicas',
  desc: 'Mais de 4 contratos ativos com órgãos do governo federal e distrital. SICAF regularizado, certidões em dia e equipe treinada para todos os processos licitatórios previstos na Lei 14.133/2021.',
  badge: 'Destaque',
}

const reasons = [
  { icon: FileCheck, title: 'Documentação Completa', desc: 'ANTT, RNTRC, seguro de passageiros e CRLV sempre atualizados.' },
  { icon: Clock, title: 'Pontualidade', desc: 'GPS embarcado e controle de rotas em tempo real.' },
  { icon: ShieldCheck, title: 'Motoristas Habilitados', desc: 'CNH categoria D ou E, com cursos de transporte coletivo.' },
  { icon: MapPin, title: 'Base em Brasília', desc: 'Operação centralizada no DF com atendimento para todo o Centro-Oeste.' },
  { icon: Headphones, title: 'Suporte 24h', desc: 'Atendimento via WhatsApp para emergências e solicitações urgentes.' },
]

export default function WhyUsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-60px' })

  return (
    <section className="py-24 bg-[#0a0a0a]" id="sobre">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-14"
        >
          <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-gold" />
            Por que a Amav's?
          </span>
          <h2 className="font-heading font-black text-4xl md:text-5xl text-white leading-tight tracking-tight">
            Confiança que se constrói<br />
            <span style={{ color: '#D4AF37' }}>viagem a viagem.</span>
          </h2>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured card — spans full height on the left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:row-span-2 bg-[#111] border border-white/[0.08] rounded-2xl p-8 flex flex-col relative overflow-hidden group hover:border-gold/20 transition-colors duration-300"
          >
            {/* Gold top border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 mb-6 w-fit">
              {featured.badge}
            </span>

            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
              <Award size={24} className="text-gold" />
            </div>

            <h3 className="font-heading font-bold text-white text-xl leading-snug mb-4">
              {featured.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1">{featured.desc}</p>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="text-3xl font-heading font-black text-gold">4+</div>
              <div className="text-xs text-gray-500 mt-0.5">contratos gov. ativos</div>
            </div>
          </motion.div>

          {/* Standard cards */}
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: (i + 1) * 0.08 }}
                className="bg-[#111] border border-white/[0.06] rounded-xl p-6 flex items-start gap-4 group hover:border-white/10 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/12 transition-colors">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white text-sm mb-1">{r.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
