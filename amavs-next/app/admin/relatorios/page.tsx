'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, MapPin, Bus, Users, Calendar, FileText, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { formatCurrency, categoryLabel } from '@/lib/utils'
import type { Vehicle, Contract, Lead } from '@/lib/types'

const PIE_COLORS = ['#D4AF37', '#507594', '#3d6e52', '#A33B3B', '#7a5928']

type Period = '30d' | '90d' | '12m' | 'all'

const periodOptions: { id: Period; label: string }[] = [
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 3 meses' },
  { id: '12m', label: 'Últimos 12 meses' },
  { id: 'all', label: 'Todo o histórico' },
]

function periodStart(p: Period): Date | null {
  if (p === 'all') return null
  const d = new Date()
  if (p === '30d') d.setDate(d.getDate() - 30)
  else if (p === '90d') d.setDate(d.getDate() - 90)
  else if (p === '12m') d.setMonth(d.getMonth() - 12)
  return d
}

function normalizeCity(c: string | null | undefined): string {
  if (!c) return ''
  return c.trim().replace(/\s*,\s*[A-Z]{2}\s*$/, '').toLowerCase()
}
function prettyCity(c: string | null | undefined): string {
  if (!c) return '—'
  return c.trim().replace(/\b\w/g, (l) => l.toUpperCase())
}

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-md)',
  borderRadius: '10px',
  color: 'var(--text)',
  fontSize: '12px',
}

export default function RelatoriosPage() {
  const supabase = createClient()
  const [period, setPeriod] = useState<Period>('90d')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: v }, { data: c }, { data: l }] = await Promise.all([
        supabase.from('vehicles').select('id, name, status, category, capacity'),
        supabase.from('contracts').select('id, status, value, contract_type, start_date, end_date, created_at'),
        supabase.from('leads').select('id, origin, destination, vehicle_id, vehicle_category, status, created_at, travel_date'),
      ])
      setVehicles((v ?? []) as Vehicle[])
      setContracts((c ?? []) as Contract[])
      setLeads((l ?? []) as Lead[])
      setLoading(false)
    }
    load()
  }, [supabase])

  // Filter by period
  const since = useMemo(() => periodStart(period), [period])

  const leadsInPeriod = useMemo(() => {
    if (!since) return leads
    return leads.filter((l) => new Date(l.created_at) >= since)
  }, [leads, since])

  const contractsInPeriod = useMemo(() => {
    if (!since) return contracts
    return contracts.filter((c) => new Date(c.created_at) >= since)
  }, [contracts, since])

  // KPIs (real)
  const totalLeads = leadsInPeriod.length
  const convertedLeads = leadsInPeriod.filter((l) => l.status === 'convertido').length
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
  const newContracts = contractsInPeriod.length
  const activeContracts = contracts.filter((c) => c.status === 'ativo')
  const activeValue = activeContracts.reduce((s, c) => s + Number(c.value || 0), 0)
  const availableVehicles = vehicles.filter((v) => v.status === 'disponivel').length

  // Top destinations
  const topDestinations = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>()
    leadsInPeriod.forEach((l) => {
      const key = normalizeCity(l.destination)
      if (!key) return
      const display = prettyCity(l.destination)
      const cur = map.get(key) ?? { display, count: 0 }
      cur.count += 1
      map.set(key, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [leadsInPeriod])

  // Top origins (origem mais comum)
  const topOrigins = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>()
    leadsInPeriod.forEach((l) => {
      const key = normalizeCity(l.origin)
      if (!key) return
      const display = prettyCity(l.origin)
      const cur = map.get(key) ?? { display, count: 0 }
      cur.count += 1
      map.set(key, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [leadsInPeriod])

  // Top vehicles (by specific vehicle_id)
  const topVehicles = useMemo(() => {
    const map = new Map<string, { vehicle: Vehicle; count: number }>()
    leadsInPeriod.forEach((l) => {
      if (!l.vehicle_id) return
      const v = vehicles.find((vv) => vv.id === l.vehicle_id)
      if (!v) return
      const cur = map.get(v.id) ?? { vehicle: v, count: 0 }
      cur.count += 1
      map.set(v.id, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [leadsInPeriod, vehicles])

  // Category demand
  const categoryDemand = useMemo(() => {
    const map = new Map<string, number>()
    leadsInPeriod.forEach((l) => {
      const cat = l.vehicle_category ?? 'sem_preferencia'
      map.set(cat, (map.get(cat) ?? 0) + 1)
    })
    const labels: Record<string, string> = {
      onibus: 'Ônibus',
      micro: 'Micro-ônibus',
      van: 'Van',
      sem_preferencia: 'Sem preferência',
    }
    return Array.from(map.entries()).map(([key, count]) => ({
      name: labels[key] ?? key,
      count,
    })).sort((a, b) => b.count - a.count)
  }, [leadsInPeriod])

  // Fleet mix (real)
  const fleetMix = useMemo(() => {
    const map = new Map<string, number>()
    vehicles.forEach((v) => map.set(v.category, (map.get(v.category) ?? 0) + 1))
    return Array.from(map.entries()).map(([key, value]) => ({
      name: categoryLabel(key as Vehicle['category']),
      value,
    }))
  }, [vehicles])

  const funnel = [
    { label: 'Recebidos',   count: leadsInPeriod.length },
    { label: 'Em contato',  count: leadsInPeriod.filter((l) => l.status === 'em_contato').length },
    { label: 'Aprovados',   count: leadsInPeriod.filter((l) => l.status === 'aprovado').length },
    { label: 'Convertidos', count: leadsInPeriod.filter((l) => l.status === 'convertido').length },
    { label: 'Recusados',   count: leadsInPeriod.filter((l) => l.status === 'recusado').length },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-semibold tracking-tight text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
            Relatórios
          </h1>
          <p className="text-sm font-light mt-1" style={{ color: 'var(--text-muted)' }}>
            Visão consolidada do negócio. Tudo vem direto do banco de dados.
          </p>
        </div>
        {/* Period filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
          {periodOptions.map((p) => {
            const active = period === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className="px-4 h-9 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--text)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--text)' : 'var(--border-md)'}`,
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }}
          />
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden" style={{ background: 'var(--border)' }}>
            <KpiCard
              icon={<FileText size={18} strokeWidth={1.5} />}
              value={totalLeads.toString()}
              label="Orçamentos recebidos"
              sub={period === 'all' ? 'Total geral' : `No período selecionado`}
            />
            <KpiCard
              icon={<TrendingUp size={18} strokeWidth={1.5} />}
              value={`${conversionRate.toFixed(0)}%`}
              label="Taxa de conversão"
              sub={`${convertedLeads} convertido${convertedLeads !== 1 ? 's' : ''}`}
            />
            <KpiCard
              icon={<Bus size={18} strokeWidth={1.5} />}
              value={`${availableVehicles}/${vehicles.length}`}
              label="Frota disponível"
              sub={`${vehicles.filter((v) => v.status === 'manutencao').length} em manutenção`}
            />
            <KpiCard
              icon={<ArrowDownRight size={18} strokeWidth={1.5} />}
              value={formatCurrency(activeValue)}
              label="Receita em contratos"
              sub={`${activeContracts.length} ativo${activeContracts.length !== 1 ? 's' : ''} · ${newContracts} novo${newContracts !== 1 ? 's' : ''} no período`}
            />
          </div>

          {/* Top destinations + Top origins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Destinos mais pedidos" subtitle="Onde os clientes querem ir" icon={<MapPin size={16} />}>
              {topDestinations.length === 0 ? (
                <Empty msg="Nenhum destino registrado no período." />
              ) : (
                <div className="space-y-3 mt-2">
                  {topDestinations.map((d, i) => {
                    const max = topDestinations[0].count
                    const pct = (d.count / max) * 100
                    return (
                      <div key={`${d.display}-${i}`}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono w-5" style={{ color: 'var(--text-dim)' }}>{String(i + 1).padStart(2, '0')}</span>
                            <span className="truncate font-medium" style={{ color: 'var(--text)' }}>{d.display}</span>
                          </div>
                          <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: 'var(--gold-strong)' }}>{d.count}x</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Origens mais frequentes" subtitle="De onde partem os clientes" icon={<MapPin size={16} />}>
              {topOrigins.length === 0 ? (
                <Empty msg="Nenhuma origem registrada no período." />
              ) : (
                <div className="space-y-3 mt-2">
                  {topOrigins.map((d, i) => {
                    const max = topOrigins[0].count
                    const pct = (d.count / max) * 100
                    return (
                      <div key={`${d.display}-${i}`}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono w-5" style={{ color: 'var(--text-dim)' }}>{String(i + 1).padStart(2, '0')}</span>
                            <span className="truncate font-medium" style={{ color: 'var(--text)' }}>{d.display}</span>
                          </div>
                          <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: 'var(--gold-strong)' }}>{d.count}x</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Top vehicles + Category demand */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Veículos mais solicitados" subtitle="Top 5 por veículo específico" icon={<Bus size={16} />}>
              {topVehicles.length === 0 ? (
                <Empty msg="Nenhum veículo escolhido nos orçamentos do período." />
              ) : (
                <div className="space-y-3 mt-2">
                  {topVehicles.map((tv, i) => {
                    const max = topVehicles[0].count
                    const pct = (tv.count / max) * 100
                    return (
                      <div key={tv.vehicle.id}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono w-5" style={{ color: 'var(--text-dim)' }}>{String(i + 1).padStart(2, '0')}</span>
                            <div className="min-w-0">
                              <div className="truncate font-medium" style={{ color: 'var(--text)' }}>{tv.vehicle.name}</div>
                              <div className="text-xs font-light" style={{ color: 'var(--text-dim)' }}>
                                {categoryLabel(tv.vehicle.category)} · {tv.vehicle.capacity} pax
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: 'var(--gold-strong)' }}>{tv.count}x</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Demanda por categoria" subtitle="Distribuição em orçamentos" icon={<Users size={16} />}>
              {categoryDemand.length === 0 ? (
                <Empty msg="Sem dados de categoria no período." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={categoryDemand} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--border)' }} />
                    <Bar dataKey="count" name="Pedidos" fill="var(--gold)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Funnel + Fleet mix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Funil de conversão" subtitle="Como os orçamentos progridem" icon={<TrendingUp size={16} />}>
              {funnel[0].count === 0 ? (
                <Empty msg="Nenhum orçamento no período." />
              ) : (
                <div className="space-y-4 mt-2">
                  {funnel.map((item) => {
                    const pct = funnel[0].count > 0 ? (item.count / funnel[0].count) * 100 : 0
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                          <span className="font-semibold" style={{ color: 'var(--text)' }}>
                            {item.count} <span className="font-light text-xs" style={{ color: 'var(--text-dim)' }}>({pct.toFixed(0)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: 'var(--gold)' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Mix da frota" subtitle="Distribuição por categoria" icon={<Bus size={16} />}>
              {fleetMix.length === 0 ? (
                <Empty msg="Nenhum veículo cadastrado ainda." />
              ) : (
                <div className="grid grid-cols-[160px_1fr] gap-6 items-center">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={fleetMix} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                        {fleetMix.map((_e, idx) => (
                          <Cell key={`c-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5">
                    {fleetMix.map((entry, idx) => {
                      const total = fleetMix.reduce((s, m) => s + m.value, 0)
                      const pct = total > 0 ? (entry.value / total) * 100 : 0
                      return (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
                          </div>
                          <span className="font-semibold ml-2 shrink-0" style={{ color: 'var(--text)' }}>
                            {entry.value} <span className="font-light text-xs" style={{ color: 'var(--text-dim)' }}>({pct.toFixed(0)}%)</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────

function KpiCard({ icon, value, label, sub }: { icon: React.ReactNode; value: string; label: string; sub: string }) {
  return (
    <div className="p-6 md:p-7" style={{ background: 'var(--bg-card)' }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}
      >
        {icon}
      </div>
      <div className="font-heading font-semibold text-2xl md:text-3xl tracking-tight mb-1" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-xs mt-0.5 font-light" style={{ color: 'var(--text-dim)' }}>{sub}</div>
    </div>
  )
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl p-6 md:p-7" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <header className="mb-5 flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-base tracking-tight" style={{ color: 'var(--text)' }}>
            {title}
          </h3>
          <p className="text-xs font-light" style={{ color: 'var(--text-dim)' }}>
            {subtitle}
          </p>
        </div>
      </header>
      {children}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="py-12 text-center text-sm font-light" style={{ color: 'var(--text-dim)' }}>
      {msg}
    </div>
  )
}
