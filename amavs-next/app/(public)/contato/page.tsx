'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Instagram, MapPin, Clock, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { buildWhatsAppMessage, buildWhatsAppURL } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  subject: z.string().min(3, 'Assunto obrigatório'),
  message: z.string().min(10, 'Mensagem muito curta'),
})

type FormData = z.infer<typeof schema>

const contactCards = [
  {
    icon: Phone,
    title: 'Telefone',
    lines: ['(61) 98422-2205', '(61) 98406-4241'],
    href: 'tel:+5561984222205',
    action: 'Ligar agora',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    lines: ['(61) 98422-2205', 'Atendimento imediato'],
    href: 'https://wa.me/5561984222205',
    action: 'Enviar mensagem',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    lines: ['@amavsturismo', 'Siga-nos para novidades'],
    href: 'https://instagram.com/amavsturismo',
    action: 'Visitar perfil',
  },
  {
    icon: MapPin,
    title: 'Localização',
    lines: ['Brasília, Distrito Federal', 'Atendemos todo o DF e Entorno'],
    href: null,
    action: null,
  },
  {
    icon: Clock,
    title: 'Horário',
    lines: ['Seg–Sex: 8h às 18h', 'Sáb: 8h às 12h | WhatsApp 24h'],
    href: null,
    action: null,
  },
]

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
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
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase font-heading">
            Fale Conosco
          </span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mt-2 mb-3">
            Entre em Contato
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 text-lg mt-2">
            Resposta em até 30 minutos durante o horário comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Contact cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="glass-dark rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-white text-sm mb-0.5">{card.title}</p>
                    {card.lines.map((line) => (
                      <p key={line} className="text-gray-400 text-sm">{line}</p>
                    ))}
                    {card.href && card.action && (
                      <a
                        href={card.href}
                        target={card.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="text-gold text-xs hover:underline mt-1 inline-block"
                      >
                        {card.action} →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="glass-dark rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} className="text-green-400" />
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-2">WhatsApp Aberto!</h3>
                <p className="text-gray-400 mb-4">
                  Sua mensagem foi preparada. Continue o atendimento no WhatsApp.
                </p>
                <Button variant="outline" size="md" onClick={() => setSubmitted(false)}>
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="glass-dark rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo"
                    placeholder="Seu nome"
                    {...register('name')}
                    error={errors.name?.message}
                    required
                  />
                  <Input
                    label="WhatsApp"
                    placeholder="(61) 99999-9999"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                    required
                  />
                </div>
                <Input
                  label="Assunto"
                  placeholder="Fretamento para evento, licitação, etc."
                  {...register('subject')}
                  error={errors.subject?.message}
                  required
                />
                <Textarea
                  label="Mensagem"
                  placeholder="Descreva sua necessidade..."
                  {...register('message')}
                  error={errors.message?.message}
                  rows={5}
                  required
                />
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  rightIcon={<Send size={16} />}
                >
                  Enviar pelo WhatsApp
                </Button>
                <p className="text-gray-500 text-xs text-center">
                  Você será redirecionado ao WhatsApp com sua mensagem preenchida
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
