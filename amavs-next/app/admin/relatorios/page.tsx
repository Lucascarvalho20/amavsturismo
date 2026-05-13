'use client'

import { Suspense } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { demandChartData, revenueChartData, vehicleMixData, mockContracts, mockVehicles } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: '#142235',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '10px',
  color: '#F0F0F0',
  fontSize: '12px',
}

const PIE_COLORS = ['#D4AF37', '#507594', '#3d6e52']

const totalRevenue = revenueChartData.reduce((s, d) => s + (d.realizado as number), 0)
const totalTarget = revenueChartData.reduce((s, d) => s + (d.previsto as number), 0)
const variance = ((totalRevenue - totalTarget) / totalTarget) * 100

const activeContractsValue = mockContracts
  .filter((c) => c.status === 'ativo')
  .reduce((s, c) => s + c.value, 0)

const SUMMARY = [
  {
    label: 'Receita Anual',
    value: formatCurrency(totalRevenue),
    sub: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}% vs meta`,
    icon: variance >= 0 ? TrendingUp : TrendingDown,
    color: variance >= 0 ? 'text-emerald-400' : 'text-red-400',
    bg: variance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
  },
  {
    label: 'Contratos Ativos',
    value: formatCurrency(activeContractsValue),
    sub: `${mockContracts.filter((c) => c.status === 'ativo').length} contratos em vigor`,
    icon: TrendingUp,
    color: 'text-gold',
    bg: 'bg-gold/10 border-gold/20',
  },
  {
    label: 'Frota Disponível',
    value: `${mockVehicles.filter((v) => v.status === 'disponivel').length}/${mockVehicles.length}`,
    sub: `${mockVehicles.filter((v) => v.status === 'manutencao').length} em manutenção`,
    icon: Minus,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    label: 'Viagens (Est.)',
    value: `${demandChartData.reduce((s, d) => s + (d.onibus as number) + (d.micro as number) + (d.van as number), 0)}`,
    sub: 'Total do ano (estimado)',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
]

export default function RelatoriosPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Relatórios</h1>
        <p className="text-gray-400 text-sm mt-0.5">Visão consolidada do negócio · Ano atual</p>
      </div>

      {/* Summary KPIs */}
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

      {/* Revenue line chart */}
      <div className="glass-dark rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-semibold text-white">Faturamento — Meta vs Realizado</h3>
            <p className="text-gray-500 text-xs mt-0.5">R$ por mês · ano atual</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-6 h-px bg-gold/40 border-t-2 border-dashed border-gold/40 inline-block" />
              Meta
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-6 h-0.5 bg-gold inline-block rounded" />
              Realizado
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
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
        {/* Demand bar */}
        <div className="xl:col-span-2 glass-dark rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-heading font-semibold text-white">Demanda por Tipo de Veículo</h3>
            <p className="text-gray-500 text-xs mt-0.5">Número de viagens por mês</p>
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

        {/* Vehicle mix pie */}
        <div className="glass-dark rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-heading font-semibold text-white">Mix de Frota</h3>
            <p className="text-gray-500 text-xs mt-0.5">% de viagens por categoria</p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={vehicleMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {vehicleMixData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 w-full">
              {vehicleMixData.map((entry, index) => (
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
        </div>
      </div>
    </div>
  )
}
