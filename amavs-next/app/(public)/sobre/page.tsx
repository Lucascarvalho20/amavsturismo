import type { Metadata } from 'next'
import { Target, Eye, Heart, MessageCircle, Phone, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: "Conheça a Amav's Turismo, especialista em fretamento de ônibus, micro-ônibus e vans em Brasília.",
}

const values = [
  {
    icon: Target,
    title: 'Missão',
    desc: 'Oferecer transporte seguro, pontual e confortável para pessoas e organizações em Brasília, com profissionalismo e integridade.',
  },
  {
    icon: Eye,
    title: 'Visão',
    desc: 'Ser a empresa de fretamento mais confiável do Distrito Federal — reconhecida pela qualidade da frota, excelência no atendimento e solidez em contratos.',
  },
  {
    icon: Heart,
    title: 'Valores',
    desc: 'Segurança acima de tudo. Pontualidade como compromisso. Transparência nas relações. Respeito aos passageiros.',
  },
]

export default function SobrePage() {
  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-32">
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
        <div className="max-w-3xl">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Sobre nós
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Fretamento, sob<br />
            <span className="text-gradient-gold">a nossa marca.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            A Amav's Turismo nasceu em Brasília, com um propósito claro: oferecer
            transporte coletivo de qualidade para quem precisa de confiança e
            pontualidade.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 max-w-5xl mb-24 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8 md:gap-16">
          <div className="text-xs font-medium tracking-[0.28em] uppercase pt-2" style={{ color: 'var(--text-dim)' }}>
            Quem somos
          </div>
          <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            <p>
              Nossa especialidade é atender grupos corporativos, órgãos públicos e
              viajantes que buscam conforto e segurança. Trabalhamos com frota moderna,
              manutenção preventiva em dia e documentação regularizada junto à ANTT e
              DETRAN-DF.
            </p>
            <p>
              Atuamos em contratos com órgãos públicos e empresas privadas no
              Distrito Federal e em todo o Centro-Oeste, sempre com SICAF regularizado e
              conforme a Lei 14.133/2021. Nossa equipe de motoristas é treinada,
              habilitada na categoria D/E e comprometida com a excelência.
            </p>
            <p>
              Além dos contratos governamentais, atendemos empresas privadas, agências
              de turismo, escolas e grupos de excursionistas — sempre com a mesma régua
              de qualidade.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-3xl overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="surface p-10 md:p-12"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'var(--gold-muted)' }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
                </div>
                <h3 className="font-heading font-semibold text-2xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                  {item.title}
                </h3>
                <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 max-w-5xl text-center">
        <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,5vw,3.5rem)] mb-6">
          Vamos conversar?
        </h2>
        <p className="text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Estamos em Brasília, DF, prontos para atender sua solicitação. Resposta em
          minutos pelo WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/5561984222205"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <MessageCircle size={16} />
            Chamar no WhatsApp
          </a>
          <a
            href="tel:+5561984222205"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
            style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
          >
            <Phone size={16} />
            Ligar agora
          </a>
          <a
            href="/orcamento"
            className="inline-flex items-center gap-2 text-[15px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--gold-strong)' }}
          >
            Solicitar orçamento <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </div>
  )
}
