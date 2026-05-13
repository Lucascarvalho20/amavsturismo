'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FileCheck, Clock, Award, Headphones, Star, ShieldCheck } from 'lucide-react'
import Section, { SectionHeader } from '@/components/ui/Section'

const reasons = [
  {
    icon: FileCheck,
    title: 'Documentação Regular',
    desc: 'Todos os veículos com documentação em dia, ANTT regularizada e seguro de passageiros.',
    featured: false,
  },
  {
    icon: Award,
    title: 'Experiência em Licitações',
    desc: 'Especialistas em pregão eletrônico e tomada de preços. Documentação completa para órgãos públicos. Mais de 4 contratos ativos com o governo federal e distrital.',
    featured: true,
  },
  {
    icon: Clock,
    title: 'Pontualidade Garantida',
    desc: 'Rastreamento GPS em tempo real e compromisso com horários. Sem atrasos.',
    featured: false,
  },
  {
    icon: Star,
    title: 'Frota Premium',
    desc: 'Veículos com menos de 5 anos de uso, ar-condicionado, Wi-Fi e poltronas reclináveis.',
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: 'Motoristas Habilitados',
    desc: 'Condutores com CNH categoria D ou E, cursos de transporte de passageiros e ficha limpa.',
    featured: false,
  },
  {
    icon: Headphones,
    title: 'Atendimento 24/7',
    desc: 'Suporte pelo WhatsApp a qualquer hora do dia ou da noite, todos os dias do ano.',
    featured: false,
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function WhyUsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-80px' })

  const standard = reasons.filter((r) => !r.featured)
  const featured = reasons.find((r) => r.featured)!

  return (
    <Section className="py-20 bg-navy-200" id="por-que-nos">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Por que escolher a Amav's"
          title="Compromisso com Excelência"
          subtitle="Não somos apenas uma empresa de ônibus. Somos parceiros confiáveis para quem precisa de transporte profissional em Brasília."
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {/* Featured card — spans 2 columns on lg */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 relative glass-dark rounded-2xl p-8 group overflow-hidden"
            style={{ borderTop: '2px solid #D4AF37' }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.06) 0%, transparent 60%)' }}
            />
            <div className="relative z-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.06) 100%)' }}
              >
                <Award size={26} className="text-gold" />
              </div>
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-gold text-xs font-semibold tracking-wide uppercase">Destaque</span>
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-3">{featured.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-lg">{featured.desc}</p>
            </div>
          </motion.div>

          {/* Regular cards */}
          {standard.map((reason) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                variants={itemVariants}
                className="glass-dark rounded-2xl p-6 group hover:border-gold/20 hover:shadow-glass-gold transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 60%)' }}
                />
                <div className="relative z-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.04) 100%)' }}
                  >
                    <Icon size={20} className="text-gold" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-base mb-2">{reason.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{reason.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </Section>
  )
}
