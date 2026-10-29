'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, MessageCircle, ArrowLeft, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Users, Bus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CityAutocomplete from '@/components/ui/CityAutocomplete'
import {
  categoryLabel,
  buildWhatsAppMessage,
  buildWhatsAppURL,
  formatDate,
} from '@/lib/utils'
import type { Vehicle, VehicleBlock, Reservation } from '@/lib/types'
import {
  rankVehicles,
  checkVehicleAvailability,
  type VehicleSuggestion,
  type Conflict,
} from '@/lib/availability'

const step1Schema = z.object({
  origin: z.string().min(2, 'Informe a cidade de origem'),
  destination: z.string().optional(),
  travel_date: z.string().min(1, 'Informe a data de ida'),
  return_date: z.string().optional(),
  passengers: z.coerce.number().min(1, 'Mínimo 1 passageiro').max(60, 'Máximo 60'),
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

const stepTitles = ['Detalhes da viagem', 'Seus contatos', 'Confirmar e enviar']

const fieldBase: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-md)',
  color: 'var(--text)',
}

function describeConflict(c: Conflict): string {
  const labels: Record<Conflict['kind'], string> = {
    manutencao: 'Em manutenção',
    reserva: 'Reservado',
    contrato_privado: 'Em contrato',
    outro: 'Indisponível',
  }
  if (c.is_indefinite) return labels[c.kind]
  if (c.end) return `${labels[c.kind]} (${formatDate(c.start)} – ${formatDate(c.end)})`
  return labels[c.kind]
}

function VehicleAvailabilityRow({
  suggestion,
  selected,
  onSelect,
}: {
  suggestion: VehicleSuggestion
  selected: boolean
  onSelect: () => void
}) {
  const { vehicle, availability, capacityGap } = suggestion
  const fits = capacityGap >= 0
  const showOk = availability.available && fits

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 transition-all"
      style={{
        background: selected ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <Bus size={18} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
              {vehicle.name}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
              style={
                showOk
                  ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                  : !fits
                    ? { background: 'rgba(245,158,11,0.12)', color: '#B45309' }
                    : { background: 'rgba(239,68,68,0.12)', color: '#B91C1C' }
              }
            >
              {showOk
                ? <><CheckCircle2 size={11} /> Disponível</>
                : !fits
                  ? <><AlertCircle size={11} /> Não cabe</>
                  : <><AlertCircle size={11} /> Indisponível</>}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-flex items-center gap-1">
              <Users size={11} /> {vehicle.capacity} pax
            </span>
            <span>·</span>
            <span>{categoryLabel(vehicle.category)}</span>
            <span>·</span>
            <span>{vehicle.year}</span>
          </div>
          {!availability.available && availability.conflicts.length > 0 && (
            <div className="mt-2 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {describeConflict(availability.conflicts[0])}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default function OrcamentoForm() {
  const searchParams = useSearchParams()
  const initialVehicle = searchParams.get('veiculo') || ''
  const [currentStep, setCurrentStep] = useState(0)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [blocks, setBlocks] = useState<VehicleBlock[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Só períodos ocupados chegam ao navegador — sem nomes/observações de clientes.
    fetch('/api/disponibilidade')
      .then((r) => (r.ok ? r.json() : { vehicles: [], busy: [] }))
      .then(({ vehicles: v, busy }: { vehicles: Vehicle[]; busy: Array<Omit<VehicleBlock, 'title' | 'notes' | 'created_at' | 'updated_at'>> }) => {
        setVehicles(v ?? [])
        setBlocks(
          (busy ?? []).map((b) => ({
            ...b,
            title: b.block_type === 'manutencao' ? 'Em manutenção' : 'Indisponível',
            notes: null,
            created_at: '',
            updated_at: '',
          })),
        )
        setReservations([])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      vehicle_id: initialVehicle,
      passengers: 20,
      origin: 'Brasília, DF',
      destination: '',
    },
  })

  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const watchedTravelDate = form1.watch('travel_date')
  const watchedReturnDate = form1.watch('return_date')
  const watchedPassengers = Number(form1.watch('passengers') || 0)
  const watchedVehicleId = form1.watch('vehicle_id')

  const ranked = useMemo<VehicleSuggestion[]>(() => {
    if (!watchedTravelDate || vehicles.length === 0) return []
    return rankVehicles(
      vehicles,
      watchedPassengers,
      watchedTravelDate,
      watchedReturnDate || null,
      blocks,
      reservations,
    )
  }, [vehicles, watchedPassengers, watchedTravelDate, watchedReturnDate, blocks, reservations])

  // Sugestão principal: o primeiro do ranking que comporta o grupo e está livre
  const smartPick = useMemo<VehicleSuggestion | null>(() => {
    if (ranked.length === 0) return null
    const ok = ranked.find((r) => r.capacityGap >= 0 && r.availability.available)
    return ok ?? ranked[0] ?? null
  }, [ranked])

  // Veículo escolhido pelo cliente, avaliado fora do ranking
  const selectedSuggestion = useMemo<VehicleSuggestion | null>(() => {
    if (!watchedVehicleId) return null
    const v = vehicles.find((vv) => vv.id === watchedVehicleId)
    if (!v) return null
    const availability = checkVehicleAvailability(
      v,
      watchedTravelDate,
      watchedReturnDate || null,
      blocks,
      reservations,
    )
    return { vehicle: v, availability, capacityGap: v.capacity - watchedPassengers, score: 0 }
  }, [watchedVehicleId, vehicles, watchedTravelDate, watchedReturnDate, watchedPassengers, blocks, reservations])

  // Até 3 alternativas quando o veículo escolhido está ocupado ou é pequeno demais
  const alternatives = useMemo<VehicleSuggestion[]>(() => {
    if (!selectedSuggestion) return []
    if (selectedSuggestion.availability.available && selectedSuggestion.capacityGap >= 0) return []
    return ranked
      .filter((r) => r.vehicle.id !== selectedSuggestion.vehicle.id)
      .filter((r) => r.availability.available && r.capacityGap >= 0)
      .slice(0, 3)
  }, [selectedSuggestion, ranked])

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data)
    setCurrentStep(1)
  }

  const onStep2Submit = () => setCurrentStep(2)

  const buildAndSendWhatsApp = async () => {
    if (!step1Data) return
    const data2 = form2.getValues()
    const chosen = vehicles.find((v) => v.id === step1Data.vehicle_id)

    // Registro no painel via API (validação no servidor). Não aguarda a resposta para
    // que o window.open abaixo continue sendo um gesto do usuário (evita bloqueio de pop-up).
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: data2.name,
        phone: data2.phone,
        email: data2.email || '',
        origin: step1Data.origin,
        destination: step1Data.destination || '',
        travel_date: step1Data.travel_date,
        return_date: step1Data.return_date || '',
        passengers: step1Data.passengers,
        vehicle_id: step1Data.vehicle_id || '',
        message: step1Data.message || '',
      }),
    }).catch(() => {
      // não bloqueia WhatsApp se falhar
    })

    const msg = buildWhatsAppMessage({
      name: data2.name,
      phone: data2.phone,
      origin: step1Data.origin,
      destination: step1Data.destination ?? '',
      travelDate: step1Data.travel_date,
      returnDate: step1Data.return_date,
      passengers: step1Data.passengers,
      vehicleName: chosen?.name,
      vehicleCategory: chosen ? categoryLabel(chosen.category) : undefined,
      message: step1Data.message,
    })
    window.open(buildWhatsAppURL(msg), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 md:px-10 max-w-3xl">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Orçamento grátis
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,5vw,3.5rem)] mb-4">
            Solicitar orçamento
          </h1>
          <p className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>
            Preencha as informações — sua cotação chega em minutos pelo WhatsApp.
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                  style={
                    i < currentStep
                      ? { background: 'var(--gold)', color: '#fff' }
                      : i === currentStep
                        ? { background: 'var(--gold-muted)', color: 'var(--gold-strong)', border: '2px solid var(--gold)' }
                        : { background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border-md)' }
                  }
                >
                  {i < currentStep ? <Check size={16} /> : i + 1}
                </div>
                <span className="text-[11px] mt-2 hidden sm:block" style={{ color: i === currentStep ? 'var(--gold-strong)' : 'var(--text-dim)' }}>
                  {title}
                </span>
              </div>
              {i < stepTitles.length - 1 && (
                <div
                  className="w-16 sm:w-24 h-px mx-3"
                  style={{ background: i < currentStep ? 'var(--gold)' : 'var(--border)' }}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="rounded-3xl p-6 md:p-8 space-y-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CityAutocomplete
                    label="Cidade de origem *"
                    value={form1.watch('origin') ?? ''}
                    onChange={(v) => form1.setValue('origin', v)}
                    placeholder="Ex: Brasília, DF"
                    error={form1.formState.errors.origin?.message}
                    required
                  />
                  <CityAutocomplete
                    label="Destino"
                    value={form1.watch('destination') ?? ''}
                    onChange={(v) => form1.setValue('destination', v)}
                    placeholder="Ex: Goiânia, GO (opcional)"
                    error={form1.formState.errors.destination?.message}
                  />
                </div>
                <p className="text-xs -mt-3" style={{ color: 'var(--text-dim)' }}>
                  Deixe o destino em branco para viagens dentro da mesma cidade.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Data de ida *
                    </label>
                    <input
                      type="date"
                      {...form1.register('travel_date')}
                      className="w-full h-11 px-4 rounded-xl text-sm"
                      style={fieldBase}
                    />
                    {form1.formState.errors.travel_date && (
                      <p className="mt-1.5 text-xs text-red-500">{form1.formState.errors.travel_date.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Data de volta (opcional)
                    </label>
                    <input
                      type="date"
                      {...form1.register('return_date')}
                      className="w-full h-11 px-4 rounded-xl text-sm"
                      style={fieldBase}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    Número de passageiros *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    {...form1.register('passengers')}
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldBase}
                  />
                  {form1.formState.errors.passengers && (
                    <p className="mt-1.5 text-xs text-red-500">{form1.formState.errors.passengers.message}</p>
                  )}
                </div>

                {watchedTravelDate && watchedPassengers > 0 && smartPick && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--gold-muted)', border: '1px solid var(--gold-border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg)' }}>
                        <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium tracking-widest uppercase mb-1" style={{ color: 'var(--gold-strong)' }}>
                          Nossa sugestão
                        </div>
                        <div className="font-medium text-base mb-1" style={{ color: 'var(--text)' }}>
                          {smartPick.vehicle.name} <span className="font-light" style={{ color: 'var(--text-muted)' }}>· {smartPick.vehicle.capacity} pax</span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {smartPick.availability.available && smartPick.capacityGap >= 0
                            ? `Disponível para ${formatDate(watchedTravelDate)}${watchedReturnDate ? ` até ${formatDate(watchedReturnDate)}` : ''} — ${smartPick.capacityGap} lugar(es) de folga.`
                            : 'Verifique alternativas abaixo.'}
                        </div>
                        {watchedVehicleId !== smartPick.vehicle.id && (
                          <button
                            type="button"
                            onClick={() => form1.setValue('vehicle_id', smartPick.vehicle.id)}
                            className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--gold-strong)' }}
                          >
                            Usar essa sugestão <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
                    Veículo de preferência (opcional)
                  </label>

                  <button
                    type="button"
                    onClick={() => form1.setValue('vehicle_id', '')}
                    className="w-full text-left rounded-2xl p-4 mb-3 transition-all"
                    style={{
                      background: !watchedVehicleId ? 'var(--bg-elevated)' : 'var(--bg-card)',
                      border: `1px solid ${!watchedVehicleId ? 'var(--gold)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
                      <div>
                        <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                          Sem preferência
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Sugeriremos o ideal automaticamente.
                        </div>
                      </div>
                    </div>
                  </button>

                  {ranked.length > 0 ? (
                    <div className="space-y-2.5">
                      {ranked.map((s) => (
                        <VehicleAvailabilityRow
                          key={s.vehicle.id}
                          suggestion={s}
                          selected={watchedVehicleId === s.vehicle.id}
                          onSelect={() => form1.setValue('vehicle_id', s.vehicle.id)}
                        />
                      ))}
                    </div>
                  ) : !loading && vehicles.length > 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      Selecione uma data acima para ver disponibilidade.
                    </p>
                  )}
                </div>

                {selectedSuggestion &&
                  (!selectedSuggestion.availability.available || selectedSuggestion.capacityGap < 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-5"
                      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                            {selectedSuggestion.capacityGap < 0
                              ? `Esse veículo comporta ${selectedSuggestion.vehicle.capacity} passageiros — você precisa de ${watchedPassengers}.`
                              : 'Esse veículo está indisponível na data escolhida.'}
                          </div>
                          {selectedSuggestion.availability.conflicts[0] && (
                            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              {describeConflict(selectedSuggestion.availability.conflicts[0])}
                            </div>
                          )}
                        </div>
                      </div>

                      {alternatives.length > 0 ? (
                        <>
                          <div className="text-[11px] font-medium tracking-widest uppercase mt-4 mb-2" style={{ color: 'var(--text-dim)' }}>
                            Alternativas disponíveis
                          </div>
                          <div className="space-y-2">
                            {alternatives.map((alt) => (
                              <VehicleAvailabilityRow
                                key={alt.vehicle.id}
                                suggestion={alt}
                                selected={false}
                                onSelect={() => form1.setValue('vehicle_id', alt.vehicle.id)}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          Sem alternativas que atendam todos os critérios. Mande mesmo assim e
                          a gente busca uma solução pelo WhatsApp.
                        </p>
                      )}
                    </motion.div>
                  )}

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    Observações (opcional)
                  </label>
                  <textarea
                    placeholder="Paradas, necessidades especiais, roteiro, etc."
                    {...form1.register('message')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={fieldBase}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[15px] font-medium transition-all"
                  style={{ background: 'var(--text)', color: 'var(--bg)' }}
                >
                  Próximo passo
                  <ChevronRight size={16} />
                </button>
              </form>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="rounded-3xl p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    Nome completo *
                  </label>
                  <input
                    placeholder="Seu nome"
                    {...form2.register('name')}
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldBase}
                  />
                  {form2.formState.errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{form2.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    WhatsApp / Telefone *
                  </label>
                  <input
                    placeholder="(61) 99999-9999"
                    type="tel"
                    {...form2.register('phone')}
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldBase}
                  />
                  {form2.formState.errors.phone && (
                    <p className="mt-1.5 text-xs text-red-500">{form2.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                    E-mail (opcional)
                  </label>
                  <input
                    placeholder="seu@email.com"
                    type="email"
                    {...form2.register('email')}
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldBase}
                  />
                  {form2.formState.errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{form2.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className="inline-flex items-center gap-1.5 h-12 px-6 rounded-full text-[15px] font-medium"
                    style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[15px] font-medium"
                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                  >
                    Revisar pedido <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 2 && step1Data && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="rounded-3xl p-6 md:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="font-heading font-semibold text-2xl tracking-tight mb-6" style={{ color: 'var(--text)' }}>
                  Resumo do pedido
                </h3>
                <div className="space-y-1 mb-6 text-sm">
                  {[
                    { label: 'Nome',         value: form2.getValues('name') },
                    { label: 'Telefone',     value: form2.getValues('phone') },
                    { label: 'E-mail',       value: form2.getValues('email') || '—' },
                    { label: 'Origem',       value: step1Data.origin },
                    { label: 'Destino',      value: step1Data.destination || 'Mesma cidade / local' },
                    { label: 'Data de ida',  value: formatDate(step1Data.travel_date) },
                    { label: 'Data de volta',value: step1Data.return_date ? formatDate(step1Data.return_date) : 'Somente ida' },
                    { label: 'Passageiros',  value: String(step1Data.passengers) },
                    { label: 'Veículo',      value: vehicles.find((v) => v.id === step1Data.vehicle_id)?.name || 'Sem preferência' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span className="font-medium text-right" style={{ color: 'var(--text)' }}>{value}</span>
                    </div>
                  ))}
                  {step1Data.message && (
                    <div className="py-3">
                      <div className="mb-1" style={{ color: 'var(--text-muted)' }}>Observações</div>
                      <div style={{ color: 'var(--text)' }}>{step1Data.message}</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { void buildAndSendWhatsApp() }}
                    className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[15px] font-medium transition-all"
                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                  >
                    <MessageCircle size={16} />
                    Enviar pelo WhatsApp
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full inline-flex items-center justify-center gap-1.5 h-10 text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ArrowLeft size={14} /> Editar informações
                  </button>
                </div>
                <p className="text-xs text-center mt-4 font-light" style={{ color: 'var(--text-dim)' }}>
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
