'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, ArrowRight, Bus } from 'lucide-react'
import { categoryLabel, formatCurrency } from '@/lib/utils'
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
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
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

export default function FrotaClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('todos')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchCategory = activeTab === 'todos' || v.category === activeTab
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
      const matchAvail = !onlyAvailable || v.status === 'disponivel'
      return matchCategory && matchSearch && matchAvail
    })
  }, [vehicles, search, activeTab, onlyAvailable])

  const total = vehicles.length

  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-16 md:mb-20"
        >
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Nossa frota
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Escolha o veículo<br />
            <span className="text-gradient-gold">ideal.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {total > 0
              ? `${total} veículo${total !== 1 ? 's' : ''} na frota — documentação regularizada, manutenção rastreada e motoristas profissionais.`
              : 'Frota moderna, documentação regularizada e motoristas profissionais.'}
          </p>
        </motion.div>

        {total > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row gap-6 mb-10 items-start lg:items-center"
            >
              <div className="relative flex-1 max-w-md w-full">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-dim)' }}
                />
                <input
                  placeholder="Buscar por nome ou modelo"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-full text-sm"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer h-11 px-5 rounded-full text-sm font-medium select-none"
                style={{
                  background: onlyAvailable ? 'var(--text)' : 'transparent',
                  color: onlyAvailable ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${onlyAvailable ? 'var(--text)' : 'var(--border-md)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="sr-only"
                />
                Somente disponíveis
              </label>
            </motion.div>

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
          </>
        )}

        {total === 0 ? (
          <div className="text-center py-32" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg">Nenhum veículo cadastrado ainda.</p>
            <p className="text-sm mt-2">Entre em contato pelo WhatsApp para consultar disponibilidade.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg">Nenhum veículo encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((vehicle, i) => {
              const ownPhoto = vehicle.images?.[0] ?? vehicle.photo_url
              const mainPhoto = ownPhoto ?? fallbackPhotoFor(vehicle.category, i)
              return (
                <motion.a
                  key={vehicle.id}
                  href={`/frota/${vehicle.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group block surface-card rounded-3xl overflow-hidden card-hover"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    {mainPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mainPhoto}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <VehiclePlaceholder name={vehicle.name} category={vehicle.category} />
                    )}
                    {!ownPhoto && mainPhoto && (
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
                        {vehicle.status === 'disponivel' ? 'Disponível' : vehicle.status === 'em_uso' ? 'Em uso' : 'Manutenção'}
                      </span>
                    </div>
                    {vehicle.images && vehicle.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 backdrop-blur-md text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                        +{vehicle.images.length - 1} fotos
                      </div>
                    )}
                  </div>

                  <div className="p-7 md:p-8">
                    <h2 className="font-heading font-semibold text-xl md:text-2xl tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                      {vehicle.name}
                    </h2>
                    <p className="text-sm font-light mb-6" style={{ color: 'var(--text-dim)' }}>
                      {vehicle.model} · {vehicle.year}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
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

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {vehicle.features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                        >
                          {f}
                        </span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ color: 'var(--gold-strong)' }}>
                          +{vehicle.features.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-sm font-medium group/cta" style={{ color: 'var(--gold-strong)' }}>
                      Ver detalhes
                      <ArrowRight size={14} className="transition-transform group-hover/cta:translate-x-0.5" />
                    </div>
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
