import type { Metadata } from 'next'
import { Target, Eye, Heart, MessageCircle, Phone } from 'lucide-react'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história da Amav\'s Turismo, especialista em fretamento de ônibus em Brasília desde 2009.',
}

const values = [
  { icon: Target, title: 'Missão', desc: 'Oferecer transporte seguro, pontual e confortável para pessoas e organizações em Brasília, contribuindo para o desenvolvimento do setor de fretamento com profissionalismo e integridade.' },
  { icon: Eye, title: 'Visão', desc: 'Ser a empresa de fretamento mais confiável do Distrito Federal, reconhecida pela qualidade da frota, excelência no atendimento e pela solidez nos contratos governamentais.' },
  { icon: Heart, title: 'Valores', desc: 'Segurança acima de tudo. Pontualidade como compromisso. Transparência nas relações. Respeito aos passageiros. Responsabilidade ambiental e social em cada viagem.' },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase font-heading">
            Nossa História
          </span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mt-2 mb-3">
            Sobre a Amav's Turismo
          </h1>
          <div className="gold-divider-center" />
        </div>

        {/* Story */}
        <div className="glass-dark rounded-2xl p-8 mb-10">
          <h2 className="font-heading font-bold text-xl text-white mb-4">Quem Somos</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              A Amav's Turismo nasceu em 2009 em Brasília, Distrito Federal, com um propósito claro:
              oferecer transporte coletivo de qualidade para quem realmente precisa de confiança e
              pontualidade. Desde o início, nossa especialidade foi atender grupos corporativos,
              órgãos públicos e viajantes que buscam conforto e segurança.
            </p>
            <p>
              Com mais de 15 anos de experiência no mercado, construímos uma reputação sólida
              baseada em serviço impecável. Hoje contamos com uma frota moderna de 6 veículos —
              ônibus executivos, micro-ônibus e vans — todos com manutenção preventiva em dia e
              documentação regularizada junto à ANTT e DETRAN-DF.
            </p>
            <p>
              Nossa maior conquista foi conquistar a confiança de órgãos públicos como o Ministério
              da Educação, SESI-DF, SENAC-DF e o Tribunal de Justiça do Distrito Federal, obtendo
              contratos licitados que atestam nossa capacidade técnica e idoneidade.
            </p>
            <p>
              Além dos contratos governamentais, atendemos empresas privadas, agências de turismo,
              escolas e grupos de excursionistas em todo o Centro-Oeste. Nossa equipe de motoristas
              é treinada, habilitada na categoria D/E e comprometida com a excelência.
            </p>
          </div>
        </div>

        {/* Missão, Visão, Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="glass-dark rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Contact buttons */}
        <div className="glass-dark rounded-2xl p-8 text-center border-t-2 border-gold/40">
          <h2 className="font-heading font-bold text-2xl text-white mb-2">
            Vamos Conversar?
          </h2>
          <p className="text-gray-400 mb-6">
            Estamos em Brasília, DF, prontos para atender sua solicitação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as="a"
              href="https://wa.me/5561984222205"
              variant="gold"
              size="lg"
              leftIcon={<MessageCircle size={18} />}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chamar no WhatsApp
            </Button>
            <Button
              as="a"
              href="tel:+5561984222205"
              variant="outline"
              size="lg"
              leftIcon={<Phone size={18} />}
            >
              Ligar Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
