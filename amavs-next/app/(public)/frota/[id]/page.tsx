import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, Gauge, DollarSign, Check, MessageCircle } from 'lucide-react'
import { mockVehicles } from '@/lib/data'
import { categoryLabel, formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  return mockVehicles.map((v) => ({ id: v.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = mockVehicles.find((v) => v.id === params.id)
  if (!vehicle) return {}
  return {
    title: vehicle.name,
    description: vehicle.description,
  }
}

export default function VehicleDetailPage({ params }: Props) {
  const vehicle = mockVehicles.find((v) => v.id === params.id)
  if (!vehicle) notFound()

  const statusVariant =
    vehicle.status === 'disponivel' ? 'green' : vehicle.status === 'em_uso' ? 'blue' : 'amber'
  const statusLabel =
    vehicle.status === 'disponivel' ? 'Disponível' : vehicle.status === 'em_uso' ? 'Em Uso' : 'Manutenção'

  const specs = [
    { icon: Users, label: 'Capacidade', value: `${vehicle.capacity} passageiros` },
    { icon: Calendar, label: 'Ano', value: vehicle.year.toString() },
    { icon: Gauge, label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km` },
    { icon: DollarSign, label: 'Preço por Km', value: formatCurrency(vehicle.price_km) },
    { icon: DollarSign, label: 'Diária', value: formatCurrency(vehicle.price_day) },
    {
      icon: Calendar,
      label: 'Próx. Revisão',
      value: vehicle.next_service ? formatDate(vehicle.next_service) : 'Em dia',
    },
  ]

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no veículo *${vehicle.name}* (${vehicle.model}). Poderia me enviar um orçamento?`
  )

  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <Link
          href="/frota"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gold text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para a Frota
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle image */}
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="h-64 md:h-80 bg-navy-200 flex items-center justify-center relative">
                <svg viewBox="0 0 300 120" className="w-64 h-auto opacity-80" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="20" width="250" height="75" rx="8" fill="#D4AF37" opacity="0.8" />
                  <rect x="10" y="10" width="210" height="15" rx="4" fill="#D4AF37" opacity="0.5" />
                  {[15, 45, 75, 105, 135, 165, 195].map((x) => (
                    <rect key={x} x={x} y="28" width="25" height="20" rx="3" fill="#0D1B2A" opacity="0.8" />
                  ))}
                  <rect x="20" y="54" width="12" height="28" rx="2" fill="#0D1B2A" opacity="0.7" />
                  <circle cx="50" cy="98" r="14" fill="#142235" stroke="#D4AF37" strokeWidth="2.5" />
                  <circle cx="50" cy="98" r="5" fill="#D4AF37" />
                  <circle cx="215" cy="98" r="14" fill="#142235" stroke="#D4AF37" strokeWidth="2.5" />
                  <circle cx="215" cy="98" r="5" fill="#D4AF37" />
                  <rect x="246" y="65" width="10" height="8" rx="2" fill="#f5e99a" />
                </svg>
                <div className="absolute top-4 left-4">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="gold">{categoryLabel(vehicle.category)}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h1 className="font-heading font-black text-2xl md:text-3xl text-white mb-1">
                  {vehicle.name}
                </h1>
                <p className="text-gray-400">{vehicle.model} • Placa {vehicle.plate}</p>
              </div>
            </div>

            {/* Specs grid */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-5">Especificações Técnicas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map((spec) => {
                  const Icon = spec.icon
                  return (
                    <div key={spec.label} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs">
                        <Icon size={13} className="text-gold" />
                        {spec.label}
                      </div>
                      <div className="text-white font-semibold text-sm">{spec.value}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-3">Descrição</h2>
              <p className="text-gray-400 leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Features */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-4">Comodidades e Equipamentos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicle.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check size={15} className="text-gold shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="font-heading font-bold text-white text-lg mb-4">Disponibilidade</h2>
              <AvailabilityCalendar />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="glass-gold rounded-2xl p-6 sticky top-24">
              <h3 className="font-heading font-bold text-white text-lg mb-5">Solicitar Orçamento</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Preço por km</span>
                  <span className="text-gold font-bold">{formatCurrency(vehicle.price_km)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Diária</span>
                  <span className="text-gold font-bold">{formatCurrency(vehicle.price_day)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Capacidade</span>
                  <span className="text-white font-semibold">{vehicle.capacity} pax</span>
                </div>
              </div>
              <div className="h-px bg-white/10 mb-5" />
              <div className="space-y-3">
                <Button
                  as="a"
                  href={`/orcamento?veiculo=${vehicle.id}`}
                  variant="gold"
                  size="md"
                  fullWidth
                >
                  Solicitar Orçamento
                </Button>
                <Button
                  as="a"
                  href={`https://wa.me/5561984222205?text=${whatsappMsg}`}
                  variant="outline"
                  size="md"
                  fullWidth
                  leftIcon={<MessageCircle size={16} />}
                >
                  WhatsApp
                </Button>
              </div>
              <p className="text-gray-500 text-xs text-center mt-4">
                Resposta em até 30 minutos durante horário comercial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
