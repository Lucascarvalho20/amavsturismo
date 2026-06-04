import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, Gauge, DollarSign, Check, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { categoryLabel, formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import type { Metadata } from 'next'
import type { Vehicle } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('vehicles').select('name, description').eq('id', params.id).single()
    if (!data) return {}
    return { title: data.name, description: data.description }
  } catch { return {} }
}

export default async function VehicleDetailPage({ params }: Props) {
  const supabase = createClient()

  // Aceita tanto UUID (links antigos) quanto slug (QR Codes permanentes)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
  const { data: vehicle } = isUUID
    ? await supabase.from('vehicles').select('*').eq('id', params.id).single()
    : await supabase.from('vehicles').select('*').eq('slug', params.id).single()

  if (!vehicle) notFound()

  const v = vehicle as Vehicle

  const statusVariant = v.status === 'disponivel' ? 'green' : v.status === 'em_uso' ? 'blue' : 'amber'
  const statusLabel = v.status === 'disponivel' ? 'Disponível' : v.status === 'em_uso' ? 'Em Uso' : 'Manutenção'
  const mainPhoto = v.images?.[0] ?? v.photo_url

  const specs = [
    { icon: Users, label: 'Capacidade', value: `${v.capacity} passageiros` },
    { icon: Calendar, label: 'Ano', value: v.year.toString() },
    { icon: Gauge, label: 'Quilometragem', value: `${v.km.toLocaleString('pt-BR')} km` },
    ...(v.price_km > 0 ? [{ icon: DollarSign, label: 'Preço por Km', value: formatCurrency(v.price_km) }] : []),
    ...(v.price_day > 0 ? [{ icon: DollarSign, label: 'Diária', value: formatCurrency(v.price_day) }] : []),
    { icon: Calendar, label: 'Próx. Revisão', value: v.next_service ? formatDate(v.next_service) : 'Em dia' },
  ]

  const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse no veículo *${v.name}* (${v.model}). Poderia me enviar um orçamento?`)

  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/frota" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} />
          Voltar para a frota
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <div className="glass-dark rounded-2xl overflow-hidden">
              {mainPhoto ? (
                <img src={mainPhoto} alt={v.name} className="w-full h-72 object-cover" />
              ) : (
                <div className="h-72 bg-navy-300 flex items-center justify-center">
                  <svg viewBox="0 0 200 80" className="w-48 h-28 opacity-30" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="15" width="155" height="48" rx="6" fill="#D4AF37" />
                    <circle cx="35" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
                    <circle cx="130" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
                  </svg>
                </div>
              )}
              {v.images && v.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {v.images.map((img, i) => (
                    <img key={i} src={img} alt={`Foto ${i + 1}`} className="h-16 w-24 object-cover rounded-lg flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="glass-dark rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h1 className="font-heading font-black text-2xl md:text-3xl text-white">{v.name}</h1>
                  <p className="text-gray-400 mt-1">{v.model} · {v.year}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  <Badge variant="gold">{categoryLabel(v.category)}</Badge>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{v.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <Icon size={15} className="text-gold mb-1.5" />
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {v.features.length > 0 && (
              <div className="glass-dark rounded-2xl p-6">
                <h2 className="font-heading font-semibold text-white text-lg mb-4">Equipamentos e Diferenciais</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {v.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check size={14} className="text-gold flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-heading font-semibold text-white text-lg mb-1">Disponibilidade</h2>
              <p className="text-gray-500 text-sm mb-4">Consulte os períodos disponíveis para locação</p>
              <AvailabilityCalendar vehicleId={v.id} />
            </div>
          </div>

          {/* Right column — quote sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-gold rounded-2xl p-6 sticky top-28">
              <h2 className="font-heading font-bold text-white text-lg mb-1">Solicitar Orçamento</h2>
              <p className="text-gray-400 text-sm mb-5">Receba sua cotação pelo WhatsApp em minutos</p>
              <div className="space-y-3">
                <Button as="a" href={`/orcamento?veiculo=${v.id}`} variant="gold" size="lg" fullWidth>
                  Solicitar Orçamento
                </Button>
                <Button
                  as="a"
                  href={`https://wa.me/5561984222205?text=${whatsappMsg}`}
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<MessageCircle size={16} />}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Direto
                </Button>
              </div>
              <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                <p className="text-xs text-gray-500 text-center">Retorno em até 2 horas úteis</p>
                <p className="text-xs text-gray-600 text-center">Base em Brasília-DF · Viagens para todo o Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
