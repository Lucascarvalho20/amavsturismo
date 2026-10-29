'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Instagram, MapPin, Clock, Send, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { buildWhatsAppMessage, buildWhatsAppURL } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  subject: z.string().min(3, 'Assunto obrigatório'),
  message: z.string().min(10, 'Mensagem muito curta'),
})

type FormData = z.infer<typeof schema>

const contactCards = [
  { icon: Phone,         title: 'Telefone',     lines: ['(61) 98422-2205', '(61) 98406-4241'], href: 'tel:+5561984222205',                 action: 'Ligar agora' },
  { icon: MessageCircle, title: 'WhatsApp',     lines: ['(61) 98422-2205', 'Atendimento imediato'], href: 'https://wa.me/5561984222205',     action: 'Enviar mensagem' },
  { icon: Instagram,     title: 'Instagram',    lines: ['@amavsturismo', 'Siga-nos para novidades'], href: 'https://instagram.com/amavsturismo', action: 'Visitar perfil' },
  { icon: MapPin,        title: 'Garagem',      lines: ['SH Ponte de Terra — Ponte Alta Norte', 'Gama · Brasília-DF · CEP 72427-010'], href: 'https://maps.google.com/?q=SH+Ponte+de+Terra+Pte+Alta+Norte+Gama+Brasilia+DF', action: 'Ver no mapa' },
  { icon: Clock,         title: 'Horário',      lines: ['Seg–Sex: 8h às 18h', 'Sáb: 8h às 12h · WhatsApp 24h'],         href: null,         action: null },
]

const fieldBase: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-md)',
  color: 'var(--text)',
}

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    const msg = buildWhatsAppMessage({
      name: data.name,
      phone: data.phone,
      origin: 'Brasília',
      destination: data.subject,
      travelDate: 'A definir',
      passengers: 0,
      message: data.message,
    })
    const url = buildWhatsAppURL(msg)
    window.open(url, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-24">
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-16 md:mb-20">
        <div className="max-w-3xl">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Fale conosco
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Entre em<br />
            <span className="text-gradient-gold">contato.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Resposta em minutos pelo WhatsApp durante o horário comercial. Sua
            mensagem chega direto na operação.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-3">
            {contactCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="rounded-2xl p-5 flex items-start gap-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--gold-muted)' }}
                  >
                    <Icon size={18} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm mb-1" style={{ color: 'var(--text)' }}>{card.title}</p>
                    {card.lines.map((line) => (
                      <p key={line} className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>{line}</p>
                    ))}
                    {card.href && card.action && (
                      <a
                        href={card.href}
                        target={card.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity mt-2"
                        style={{ color: 'var(--gold-strong)' }}
                      >
                        {card.action} <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-3">
            {submitted ? (
              <div
                className="rounded-3xl p-12 text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(16,185,129,0.15)' }}
                >
                  <MessageCircle size={28} style={{ color: '#10B981' }} />
                </div>
                <h3 className="font-heading font-semibold text-2xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                  WhatsApp aberto!
                </h3>
                <p className="mb-6 font-light" style={{ color: 'var(--text-muted)' }}>
                  Sua mensagem foi preparada. Continue o atendimento no WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full text-sm font-medium"
                  style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-3xl p-8 md:p-10 space-y-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Nome completo *
                    </label>
                    <input
                      placeholder="Seu nome"
                      {...register('name')}
                      className="w-full h-11 px-4 rounded-xl text-sm"
                      style={fieldBase}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      WhatsApp *
                    </label>
                    <input
                      placeholder="(61) 99999-9999"
                      type="tel"
                      {...register('phone')}
                      className="w-full h-11 px-4 rounded-xl text-sm"
                      style={fieldBase}
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    Assunto *
                  </label>
                  <input
                    placeholder="Fretamento para evento, licitação, etc."
                    {...register('subject')}
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldBase}
                  />
                  {errors.subject && <p className="mt-1.5 text-xs text-red-500">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    Mensagem *
                  </label>
                  <textarea
                    placeholder="Descreva sua necessidade..."
                    rows={5}
                    {...register('message')}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={fieldBase}
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[15px] font-medium transition-all"
                  style={{ background: 'var(--text)', color: 'var(--bg)' }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar pelo WhatsApp'}
                  <Send size={16} />
                </button>
                <p className="text-xs text-center font-light" style={{ color: 'var(--text-dim)' }}>
                  Você será redirecionado ao WhatsApp com sua mensagem preenchida.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 max-w-7xl mt-20 md:mt-28">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
              Como chegar
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(1.75rem,3.5vw,2.5rem)]">
              Nossa garagem em Brasília.
            </h2>
            <p className="text-base font-light mt-3 max-w-xl" style={{ color: 'var(--text-muted)' }}>
              SH Ponte de Terra — Ponte Alta Norte, Gama · Brasília-DF · CEP 72427-010.
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=SH+Ponte+de+Terra+Pte+Alta+Norte+Gama+Brasilia+DF"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium transition-all"
            style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
          >
            Abrir no Google Maps
          </a>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
        >
          <iframe
            title="Localização da Amav's Turismo"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.9421706637963!2d-48.031434999999995!3d-15.9643961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a2f6d597d9ee1%3A0xb94fc586181110ea!2sAmav&#39;s%20Turismo%20-%20Passagens%20a%C3%A9reas%2C%20cruzeiros%2C%20turismo%2C%20city%20tour%2C%20aluguel%20de%20%C3%B4nibus%20e%20ve%C3%ADculos%20em%20geral.!5e0!3m2!1spt-BR!2sbr!4v1778828965508!5m2!1spt-BR!2sbr"
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  )
}
