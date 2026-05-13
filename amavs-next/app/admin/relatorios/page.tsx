'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, MessageSquare, MapPin, Bus } from 'lucide-react'
import { demandChartData, revenueChartData, vehicleMixData } from '@/lib/data'
import { createClient } from '@/lib/supabase-browser'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle, Contract, Lead } from '@/lib/types'

const tooltipStyle = {
  backgroundColor: '#1A1A1A',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '10px',
  color: '#F0F0F0',
  fontSize: '12px',
}

const PIE_COLORS = ['#D4AF37', '#507594', '#3d6e52']

export default function RelatoriosPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: v }, { data: c }, { data: l }] = await Promise.all([
        supabase.from('vehicles').select('id, name, status, category'),
        supabase.from('contracts').select('id, status, value, contract_type'),
        supabase.from('leads').select('id, origin, destination, vehicle_id, vehicle_category, status, created_at'),
      ])
      setVehicles((v ?? []) as Vehicle[])
      setContracts((c ?? []) as Contract[])
      setLeads((l ?? []) as Lead[])
      setLoading(false)
    }
    load()
  }, [])

  const activeContracts = contracts.filter((c) => c.status === 'ativo')
  const activeValue = activeContracts.reduce((s, c) => s + Number(c.value), 0)
  const availableVehicles = vehicles.filter((v) => v.status === 'disponivel').length
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'manutencao').length

  const SUMMARY = [
    {
      label: 'Receita Contratos Ativos',
      value: loading ? '...' : formatCurrency(activeValue),
      sub: loading ? '' : `${activeContracts.length} contrato${activeContracts.length !== 1 ? 's' : ''} em vigor`,
      icon: TrendingUp,
      color: 'text-gold',
      bg: 'bg-gold/10 border-gold/20',
    },
    {
      label: 'Contratos (Total)',
      value: loading ? '...' : String(contracts.length),
      sub: loading ? '' : `${activeContracts.length} ativo${activeContracts.length !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Frota Disponível',
      value: loading ? '...' : `${availableVehicles}/${vehicles.length}`,
      sub: loading ? '' : `${maintenanceVehicles} em manutenção`,
      icon: Minus,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Orçamentos Pendentes',
      value: '—',
      sub: 'Via seção Orçamentos',
      icon: TrendingDown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Relatórios</h1>
        <p className="text-gray-400 text-sm mt-0.5">Visão consolidada do negócio · Dados do banco de dados</p>
      </div>

      {/* Summary KPIs — real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-dark rounded-2xl p-5 border ${bg}`}>
            <div className={`p-2 rounded-xl w-fit mb-3 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-heading font-black text-2xl text-white">{value}</div>
            <div className="text-sm font-medium text-gray-300 mt-0.5">{label}</div>
            <div className={`text-xs mt-0.5 ${color}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue line chart — sample */}
      <div className="glass-dark rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-semibold text-white">Faturamento — Meta vs Realizado</h3>
            <p className="text-amber-400/80 text-xs mt-0.5">⚠ Dados de exemplo — será alimentado pelos contratos reais ao longo do tempo</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-6 h-px bg-gold/40 border-t-2 border-dashed border-gold/40 inline-block" />Meta
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-6 h-0.5 bg-gold inline-block rounded" />Realizado
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `R$${Math.round(v / 1000)}k`}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [formatCurrency(v), n === 'previsto' ? 'Meta' : 'Realizado']} />
            <Line dataKey="previsto" name="Meta" stroke="rgba(212,175,55,0.4)" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4, fill: '#D4AF37' }} />
            <Line dataKey="realizado" name="Realizado" stroke="#D4AF37" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#D4AF37' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 glass-dark rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-heading font-semibold text-white">Demanda por Tipo de Veículo</h3>
            <p className="text-amber-400/80 text-xs mt-0.5">⚠ Dados de exemplo — atualiza com histórico de reservas</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demandChartData} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, paddingTop: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="onibus" name="Ônibus"       fill="#D4AF37" radius={[3, 3, 0, 0]} />
              <Bar dataKey="micro"  name="Micro-ônibus" fill="#507594" radius={[3, 3, 0, 0]} />
              <Bar dataKey="van"    name="Van"          fill="#3d6e52" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-dark rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-heading font-semibold text-white">Mix de Frota</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {loading ? 'Carregando...' : vehicles.length === 0 ? 'Nenhum veículo cadastrado' : `${vehicles.length} veículos`}
            </p>
          </div>
          {!loading && vehicles.length > 0 ? (
            (() => {
              const onibusCount = vehicles.filter((v) => v.category === 'onibus').length
              const microCount = vehicles.filter((v) => v.category === 'micro').length
              const vanCount = vehicles.filter((v) => v.category === 'van').length
              const total = vehicles.length
              const realMix = [
                { name: 'Ônibus', value: Math.round((onibusCount / total) * 100) },
                { name: 'Micro', value: Math.round((microCount / total) * 100) },
                { name: 'Van', value: Math.round((vanCount / total) * 100) },
              ].filter((d) => d.value > 0)
              return (
                <div className="flex flex-col items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={realMix} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                        {realMix.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2.5 w-full">
                    {realMix.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index] }} />
                          <span className="text-gray-400">{entry.name}</span>
                        </div>
                        <span className="text-white font-semibold">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()
          ) : !loading ? (
            <div className="flex flex-col items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={vehicleMixData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {vehicleMixData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-gray-500 text-xs text-center">Adicione veículos para ver dados reais</p>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* ── Lead Analytics ─────────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-gold" />
          Orçamentos — Analytics
        </h2>
        {leads.length === 0 ? (
          <div className="glass-dark rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">Nenhum orçamento recebido ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Conversion funnel */}
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-gold" /> Funil de Conversão
              </h3>
              {[
                { label: 'Total recebidos', count: leads.length, color: 'bg-gray-500' },
                { label: 'Em contato', count: leads.filter((l) => l.status === 'em_contato').length, color: 'bg-blue-500' },
                { label: 'Aprovados', count: leads.filter((l) => l.status === 'aprovado').length, color: 'bg-emerald-500' },
                { label: 'Convertidos', count: leads.filter((l) => l.status === 'convertido').length, color: 'bg-gold' },
              ].map((item) => (
                <div key={item.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${leads.length > 0 ? (item.count / leads.length) * 100 : 0}%`, transition: 'width 1s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top routes */}
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <MapPin size={15} className="text-gold" /> Rotas Mais Solicitadas
              </h3>
              {(() => {
                const routeMap = new Map<string, number>()
                leads.forEach((l) => {
                  const route = `${l.origin} → ${l.destination || 'Local'}`
                  routeMap.set(route, (routeMap.get(route) ?? 0) + 1)
                })
                const sorted = Array.from(routeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
                if (sorted.length === 0) return <p className="text-gray-500 text-xs">Sem dados</p>
                return (
                  <div className="space-y-2">
                    {sorted.map(([route, count], i) => (
                      <div key={route} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-600 w-4 font-mono">{i + 1}.</span>
                          <span className="text-gray-300 truncate">{route}</span>
                        </div>
                        <span className="text-gold font-bold ml-2 flex-shrink-0">{count}x</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Top vehicles */}
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Bus size={15} className="text-gold" /> Veículos Mais Solicitados
              </h3>
              {(() => {
                const catMap = new Map<string, number>()
                leads.forEach((l) => {
                  const cat = l.vehicle_category ?? 'sem preferência'
                  catMap.set(cat, (catMap.get(cat) ?? 0) + 1)
                })
                const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])
                const catLabel: Record<string, string> = { onibus: 'Ônibus', micro: 'Micro-ônibus', van: 'Van', 'sem preferência': 'Sem preferência' }
                if (sorted.length === 0) return <p className="text-gray-500 text-xs">Sem dados</p>
                return (
                  <div className="space-y-3">
                    {sorted.map(([cat, count]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{catLabel[cat] ?? cat}</span>
                          <span className="text-white font-bold">{count} ({Math.round((count / leads.length) * 100)}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${(count / leads.length) * 100}%`, opacity: 0.6 + (count / leads.length) * 0.4 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
