'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ArrowRight, Bus } from 'lucide-react'
import { formatCurrency, categoryLabel } from '@/lib/utils'
import { fallbackPhotoFor } from '@/lib/fleet-photos'
import type { Vehicle, VehicleCategory } from '@/lib/types'

type Tab = 'todos' | VehicleCategory

const tabs: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'onibus', label: 'Ônibus' },
  { id: 'micro', label: 'Micro-ônibus' },
  { id: 'van', label: 'Vans' },
]

function VehiclePlaceholder({ name, category }: { name: string; category: VehicleCategory }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-4 left-4 flex items-center gap-1.5">
        <Bus size={14} strokeWidth={1.4} style={{ color: 'var(--text-dim)' }} />
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--text-dim)' }}>
          {categoryLabel(category)}
        </span>
      </div>
      <div className="relative font-heading font-semibold text-6xl tracking-tight" style={{ color: 'var(--text-dim)' }}>
        {initials}
      </div>
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
    <section className="py-32 md:py-40 surface" id="frota">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16"
        >
          <div className="max-w-xl">
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
              Nossa frota
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
              Veículos para<br />
              cada necessidade.
            </h2>
          </div>
          <p className="text-lg font-light leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
            Ônibus, micro-ônibus e vans modernos com manutenção em dia e documentação regularizada.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-12 md:mb-16 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 h-10 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: active ? 'var(--text)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--text)' : 'var(--border-md)'}`,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {filtered.map((vehicle, i) => (
              <motion.a
                key={vehicle.id}
                href={`/frota/${vehicle.id}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group block surface-card rounded-3xl overflow-hidden card-hover"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  {(vehicle.photo_url || fallbackPhotoFor(vehicle.category, i)) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(vehicle.photo_url || fallbackPhotoFor(vehicle.category, i))!}
                      alt={vehicle.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <VehiclePlaceholder name={vehicle.name} category={vehicle.category} />
                  )}
                  {!vehicle.photo_url && fallbackPhotoFor(vehicle.category, i) && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/55 text-white/85 backdrop-blur-sm">
                      Foto ilustrativa
                    </span>
                  )}
                  <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[11px] font-medium backdrop-blur-md"
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        color: '#1D1D1F',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {categoryLabel(vehicle.category)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[11px] font-medium backdrop-blur-md ${
                        vehicle.status === 'disponivel'
                          ? 'bg-emerald-500/90 text-white'
                          : vehicle.status === 'em_uso'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {vehicle.status === 'disponivel'
                        ? 'Disponível'
                        : vehicle.status === 'em_uso'
                        ? 'Em uso'
                        : 'Manutenção'}
                    </span>
                  </div>
                </div>

                <div className="p-7 md:p-8">
                  <h3 className="font-heading font-semibold text-xl md:text-2xl tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                    {vehicle.name}
                  </h3>
                  <p className="text-sm font-light mb-6" style={{ color: 'var(--text-dim)' }}>
                    {vehicle.model} · {vehicle.year}
                  </p>

                  <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} strokeWidth={1.5} />
                      {vehicle.capacity} passageiros
                    </span>
                    {vehicle.price_km > 0 && (
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {formatCurrency(vehicle.price_km)}/km
                      </span>
                    )}
                  </div>

                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium group/cta" style={{ color: 'var(--gold-strong)' }}>
                    Ver detalhes
                    <ArrowRight size={14} className="transition-transform group-hover/cta:translate-x-0.5" />
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-16 md:mt-20 flex justify-center">
          <a
            href="/frota"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
            style={{
              background: 'var(--text)',
              color: 'var(--bg)',
            }}
          >
            Ver frota completa
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
