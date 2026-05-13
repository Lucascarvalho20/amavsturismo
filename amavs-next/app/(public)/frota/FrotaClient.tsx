'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Users, Zap } from 'lucide-react'
import { cn, categoryLabel, formatCurrency } from '@/lib/utils'
import type { Vehicle, VehicleCategory } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Tab = 'todos' | VehicleCategory

const tabs: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'onibus', label: 'Ônibus' },
  { id: 'micro', label: 'Micro-ônibus' },
  { id: 'van', label: 'Vans' },
]

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

  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase font-heading">Nossa Frota</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mt-2 mb-3">
            Escolha o Veículo Ideal
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 text-lg max-w-xl mx-auto mt-2">
            {vehicles.length > 0
              ? `${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''} disponível${vehicles.length !== 1 ? 'is' : ''} — documentação regularizada e motoristas profissionais.`
              : 'Frota moderna, documentação regularizada e motoristas profissionais.'}
          </p>
        </div>

        {vehicles.length > 0 && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Buscar por nome ou modelo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search size={16} />}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer glass rounded-lg px-4 py-2.5 border border-white/10 hover:border-gold/30 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded accent-yellow-400"
                />
                <SlidersHorizontal size={14} className="text-gold" />
                <span className="text-gray-300 text-sm">Somente disponíveis</span>
              </label>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
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
          </>
        )}

        {/* Grid */}
        {vehicles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Nenhum veículo cadastrado ainda.</p>
            <p className="text-sm mt-2">Entre em contato pelo WhatsApp para consultar disponibilidade.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Nenhum veículo encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle, i) => {
              const mainPhoto = vehicle.images?.[0] ?? vehicle.photo_url
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="glass-dark rounded-xl overflow-hidden card-hover group"
                >
                  {/* Photo or placeholder */}
                  <div className="relative h-44 bg-navy-200 flex items-center justify-center overflow-hidden">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <svg viewBox="0 0 200 80" className="w-40 h-24 opacity-60" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="15" width="155" height="48" rx="6" fill="#D4AF37" opacity="0.7" />
                        <rect x="8" y="8" width="130" height="10" rx="3" fill="#D4AF37" opacity="0.5" />
                        <rect x="12" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
                        <rect x="35" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
                        <rect x="58" y="20" width="18" height="14" rx="2" fill="#0D1B2A" opacity="0.8" />
                        <circle cx="35" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
                        <circle cx="35" cy="66" r="4" fill="#D4AF37" />
                        <circle cx="130" cy="66" r="10" fill="#142235" stroke="#D4AF37" strokeWidth="2" />
                        <circle cx="130" cy="66" r="4" fill="#D4AF37" />
                      </svg>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={vehicle.status === 'disponivel' ? 'green' : vehicle.status === 'em_uso' ? 'blue' : 'amber'}>
                        {vehicle.status === 'disponivel' ? 'Disponível' : vehicle.status === 'em_uso' ? 'Em Uso' : 'Manutenção'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="gold">{categoryLabel(vehicle.category)}</Badge>
                    </div>
                    {vehicle.images && vehicle.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        +{vehicle.images.length - 1} fotos
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-heading font-bold text-white text-lg mb-0.5">{vehicle.name}</h2>
                    <p className="text-gray-400 text-sm mb-4">{vehicle.model} • {vehicle.year}</p>
                    <div className="flex gap-4 mb-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-gold" />
                        {vehicle.capacity} passageiros
                      </span>
                      {vehicle.price_km > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Zap size={14} className="text-gold" />
                          {formatCurrency(vehicle.price_km)}/km
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {vehicle.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="text-xs text-gold">+{vehicle.features.length - 3}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button as="a" href={`/frota/${vehicle.id}`} variant="outline" size="sm" fullWidth>
                        Ver Detalhes
                      </Button>
                      <Button as="a" href={`/orcamento?veiculo=${vehicle.id}`} variant="gold" size="sm" fullWidth>
                        Orçamento
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
