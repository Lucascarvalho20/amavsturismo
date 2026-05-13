'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, MessageCircle, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Select, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { mockVehicles } from '@/lib/data'
import { categoryLabel, formatCurrency, buildWhatsAppMessage, buildWhatsAppURL } from '@/lib/utils'

const step1Schema = z.object({
  origin: z.string().min(3, 'Informe a cidade de origem'),
  destination: z.string().min(3, 'Informe o destino'),
  travel_date: z.string().min(1, 'Informe a data de ida'),
  return_date: z.string().optional(),
  passengers: z.coerce.number().min(1, 'Mínimo 1 passageiro').max(50, 'Máximo 50'),
  vehicle_id: z.string().optional(),
  message: z.string().optional(),
})

const step2Schema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  phone: z.string().min(10, 'Informe um telefone válido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

interface FormData extends Step1Data, Step2Data {}

const stepTitles = ['Detalhes da Viagem', 'Seus Contatos', 'Confirmar e Enviar']

export default function OrcamentoPage() {
  const searchParams = useSearchParams()
  const initialVehicle = searchParams.get('veiculo') || ''
  const [currentStep, setCurrentStep] = useState(0)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { vehicle_id: initialVehicle, passengers: 20 },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  const selectedVehicle = mockVehicles.find((v) => v.id === form1.watch('vehicle_id'))

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data)
    setCurrentStep(1)
  }

  const onStep2Submit = (data: Step2Data) => {
    setCurrentStep(2)
  }

  const buildAndSendWhatsApp = () => {
    if (!step1Data) return
    const data2 = form2.getValues()
    const msg = buildWhatsAppMessage({
      name: data2.name,
      phone: data2.phone,
      origin: step1Data.origin,
      destination: step1Data.destination,
      travelDate: step1Data.travel_date,
      returnDate: step1Data.return_date,
      passengers: step1Data.passengers,
      vehicleName: selectedVehicle?.name,
      vehicleCategory: selectedVehicle ? categoryLabel(selectedVehicle.category) : undefined,
      message: step1Data.message,
    })
    const url = buildWhatsAppURL(msg)
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase font-heading">
            Orçamento Grátis
          </span>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white mt-2 mb-3">
            Solicitar Orçamento
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 mt-2">
            Preencha as informações e receba sua cotação pelo WhatsApp
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < currentStep
                      ? 'bg-gold text-navy-200'
                      : i === currentStep
                      ? 'bg-gold/20 border-2 border-gold text-gold'
                      : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}
                >
                  {i < currentStep ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === currentStep ? 'text-gold' : 'text-gray-500'}`}>
                  {title}
                </span>
              </div>
              {i < stepTitles.length - 1 && (
                <div className={`w-16 sm:w-24 h-px mx-2 transition-all ${i < currentStep ? 'bg-gold' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="glass-dark rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Cidade de Origem"
                    placeholder="Ex: Brasília, DF"
                    {...form1.register('origin')}
                    error={form1.formState.errors.origin?.message}
                    required
                  />
                  <Input
                    label="Destino"
                    placeholder="Ex: Goiânia, GO"
                    {...form1.register('destination')}
                    error={form1.formState.errors.destination?.message}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data de Ida"
                    type="date"
                    {...form1.register('travel_date')}
                    error={form1.formState.errors.travel_date?.message}
                    required
                  />
                  <Input
                    label="Data de Volta (opcional)"
                    type="date"
                    {...form1.register('return_date')}
                  />
                </div>
                <Input
                  label="Número de Passageiros"
                  type="number"
                  min={1}
                  max={50}
                  {...form1.register('passengers')}
                  error={form1.formState.errors.passengers?.message}
                  required
                />
                <Select
                  label="Tipo de Veículo (opcional)"
                  placeholder="Selecione um veículo"
                  {...form1.register('vehicle_id')}
                  options={[
                    { value: '', label: 'Sem preferência' },
                    ...mockVehicles.map((v) => ({
                      value: v.id,
                      label: `${v.name} — ${v.capacity} pax — ${formatCurrency(v.price_day)}/dia`,
                    })),
                  ]}
                />
                <Textarea
                  label="Observações (opcional)"
                  placeholder="Paradas, necessidades especiais, etc."
                  {...form1.register('message')}
                  rows={3}
                />
                <Button type="submit" variant="gold" size="lg" fullWidth rightIcon={<ChevronRight size={18} />}>
                  Próximo Passo
                </Button>
              </form>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="glass-dark rounded-2xl p-6 space-y-5">
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome"
                  {...form2.register('name')}
                  error={form2.formState.errors.name?.message}
                  required
                />
                <Input
                  label="WhatsApp / Telefone"
                  placeholder="(61) 99999-9999"
                  type="tel"
                  {...form2.register('phone')}
                  error={form2.formState.errors.phone?.message}
                  required
                />
                <Input
                  label="E-mail (opcional)"
                  placeholder="seu@email.com"
                  type="email"
                  {...form2.register('email')}
                  error={form2.formState.errors.email?.message}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="navy"
                    size="lg"
                    onClick={() => setCurrentStep(0)}
                    leftIcon={<ArrowLeft size={18} />}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" variant="gold" size="lg" fullWidth rightIcon={<ChevronRight size={18} />}>
                    Revisar Pedido
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 2 && step1Data && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="font-heading font-bold text-white text-lg mb-5">Resumo do Pedido</h3>
                <div className="space-y-3 mb-6 text-sm">
                  {[
                    { label: 'Nome', value: form2.getValues('name') },
                    { label: 'Telefone', value: form2.getValues('phone') },
                    { label: 'E-mail', value: form2.getValues('email') || '—' },
                    { label: 'Origem', value: step1Data.origin },
                    { label: 'Destino', value: step1Data.destination },
                    { label: 'Data de Ida', value: step1Data.travel_date },
                    { label: 'Data de Volta', value: step1Data.return_date || '—' },
                    { label: 'Passageiros', value: String(step1Data.passengers) },
                    { label: 'Veículo', value: selectedVehicle?.name || 'Sem preferência' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium text-right">{value}</span>
                    </div>
                  ))}
                  {step1Data.message && (
                    <div className="py-2">
                      <span className="text-gray-400 block mb-1">Observações</span>
                      <span className="text-white text-sm">{step1Data.message}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="gold"
                    size="lg"
                    fullWidth
                    leftIcon={<MessageCircle size={18} />}
                    onClick={buildAndSendWhatsApp}
                  >
                    Enviar pelo WhatsApp
                  </Button>
                  <Button
                    variant="navy"
                    size="sm"
                    fullWidth
                    onClick={() => setCurrentStep(1)}
                    leftIcon={<ArrowLeft size={16} />}
                  >
                    Editar informações
                  </Button>
                </div>
                <p className="text-gray-500 text-xs text-center mt-4">
                  Você será redirecionado ao WhatsApp com todas as informações preenchidas.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
