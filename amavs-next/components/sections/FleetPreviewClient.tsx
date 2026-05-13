'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Section, { SectionHeader } from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, categoryLabel } from '@/lib/utils'
import type { Vehicle, VehicleCategory } from '@/lib/types'

type Tab = 'todos' | VehicleCategory

const tabs: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'onibus', label: 'Ônibus' },
  { id: 'micro', label: 'Micro-ônibus' },
  { id: 'van', label: 'Vans' },
]

function BusPlaceholder({ category }: { category: VehicleCategory }) {
  return (
    <div className="w-full h-40 flex items-center justify-center bg-navy-200 rounded-t-xl">
      <svg viewBox="0 0 200 80" className="w-40 h-24 opacity-70" xmlns="http://www.w3.org/2000/svg">
        {category === 'van' ? (
          <>
            <rect x="10" y="20" width="120" height="45" rx="6" fill="#D4AF37" opacity="0.7" />
            <rect x="12" y="12" width="100" height="12" rx="3" fill="#D4AF37" opacity="0.5" />
            <rect x="18" y="24" width="20" height="16" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="42" y="24" width="20" height="16" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="66" y="24" width="20" height="16" rx="2" fill="#0D1B2A" opacity="0.8" />
            <circle cx="35" cy="68" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="35" cy="68" r="4" fill="#D4AF37" />
            <circle cx="105" cy="68" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="105" cy="68" r="4" fill="#D4AF37" />
          </>
        ) : category === 'micro' ? (
          <>
            <rect x="5" y="15" width="155" height="48" rx="6" fill="#D4AF37" opacity="0.7" />
            <rect x="8" y="8" width="130" height="10" rx="3" fill="#D4AF37" opacity="0.5" />
            <rect x="12" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="35" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="58" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="81" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="104" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <circle cx="35" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="35" cy="66" r="4" fill="#D4AF37" />
            <circle cx="130" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="130" cy="66" r="4" fill="#D4AF37" />
          </>
        ) : (
          <>
            <rect x="3" y="12" width="180" height="52" rx="6" fill="#D4AF37" opacity="0.7" />
            <rect x="6" y="5" width="155" height="10" rx="3" fill="#D4AF37" opacity="0.5" />
            <rect x="10" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="33" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="56" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="79" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="102" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <rect x="125" y="18" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
            <circle cx="35" cy="68" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="35" cy="68" r="4" fill="#D4AF37" />
            <circle cx="150" cy="68" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
            <circle cx="150" cy="68" r="4" fill="#D4AF37" />
          </>
        )}
      </svg>
    </div>
  )
}

interface Props {
  vehicles: Vehicle[]
}

export default function FleetPreviewClient({ vehicles }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('todos')

  const filtered =
    activeTab === 'todos' ? vehicles : vehicles.filter((v) => v.category === activeTab)

  return (
    <Section className="py-20 bg-navy-200" id="frota">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Nossa Frota"
          title="Veículos para Cada Necessidade"
          subtitle="Ônibus, micro-ônibus e vans modernos, com manutenção em dia e documentação regularizada."
        />

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold text-navy-200 shadow-glow-gold/30'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vehicle grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <AnimatePresence mode="wait">
            {filtered.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="glass-dark rounded-xl overflow-hidden card-hover group"
              >
                {/* Image */}
                <div className="relative">
                  {vehicle.photo_url ? (
                    <img
                      src={vehicle.photo_url}
                      alt={vehicle.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <BusPlaceholder category={vehicle.category} />
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={
                        vehicle.status === 'disponivel'
                          ? 'green'
                          : vehicle.status === 'em_uso'
                          ? 'blue'
                          : 'amber'
                      }
                    >
                      {vehicle.status === 'disponivel'
                        ? 'Disponível'
                        : vehicle.status === 'em_uso'
                        ? 'Em Uso'
                        : 'Manutenção'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="gold">{categoryLabel(vehicle.category)}</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-heading font-bold text-white text-lg mb-0.5">{vehicle.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {vehicle.model} • {vehicle.year}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-gold" />
                      {vehicle.capacity} pax
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap size={14} className="text-gold" />
                      {formatCurrency(vehicle.price_km)}/km
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {vehicle.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full"
                      >
                        {f}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="text-xs text-gold">+{vehicle.features.length - 3}</span>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-2">
                    <Button as="a" href={`/frota/${vehicle.id}`} variant="outline" size="sm" fullWidth>
                      Ver Detalhes
                    </Button>
                    <Button
                      as="a"
                      href={`/orcamento?veiculo=${vehicle.id}`}
                      variant="gold"
                      size="sm"
                      fullWidth
                    >
                      Orçamento
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button as="a" href="/frota" variant="outline" size="lg" rightIcon={<ArrowRight size={18} />}>
            Ver Frota Completa
          </Button>
        </div>
      </div>
    </Section>
  )
}
