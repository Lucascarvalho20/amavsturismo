'use client'

import { motion } from 'framer-motion'
import { FileCheck, Clock, Award, Headphones, Star, ShieldCheck } from 'lucide-react'
import Section, { SectionHeader } from '@/components/ui/Section'

const reasons = [
  {
    icon: FileCheck,
    title: 'Documentação Regular',
    desc: 'Todos os veículos com documentação em dia, ANTT regularizada e seguro de passageiros.',
  },
  {
    icon: Clock,
    title: 'Pontualidade Garantida',
    desc: 'Rastreamento GPS em tempo real e compromisso com horários. Sem atrasos.',
  },
  {
    icon: Award,
    title: 'Experiência em Licitações',
    desc: 'Especialistas em pregão eletrônico e tomada de preços. Documentação completa para órgãos públicos.',
  },
  {
    icon: Headphones,
    title: 'Atendimento 24/7',
    desc: 'Suporte pelo WhatsApp a qualquer hora do dia ou da noite, todos os dias do ano.',
  },
  {
    icon: Star,
    title: 'Frota Premium',
    desc: 'Veículos com menos de 5 anos de uso, ar-condicionado, Wi-Fi e poltronas reclináveis.',
  },
  {
    icon: ShieldCheck,
    title: 'Motoristas Habilitados',
    desc: 'Condutores com CNH categoria D ou E, cursos de transporte de passageiros e ficha limpa.',
  },
]

export default function WhyUsSection() {
  return (
    <Section className="py-20 bg-navy-200" id="por-que-nos">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Por que escolher a Amav's"
          title="Compromisso com Excelência"
          subtitle="Não somos apenas uma empresa de ônibus. Somos parceiros confiáveis para quem precisa de transporte profissional em Brasília."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-dark rounded-2xl p-6 group hover:border-gold/20 hover:shadow-glass-gold transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-all">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-heading font-bold text-white text-base mb-2">{reason.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{reason.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
