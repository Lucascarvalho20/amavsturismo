'use client'

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { BidMonth } from '@/lib/dashboard'
import { formatCurrency } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: '#142235',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '10px',
  color: '#F0F0F0',
  fontSize: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
}

const axisTick = { fill: 'rgba(255,255,255,0.4)', fontSize: 11 }
const legendStyle = { color: 'rgba(255,255,255,0.5)', fontSize: 11, paddingTop: 12 }
const PIE_COLORS = ['#D4AF37', '#507594', '#3d6e52']

function EmptyChart({ height, message }: { height: number; message: string }) {
  return (
    <div className="flex items-center justify-center text-center text-gray-500 text-sm px-6" style={{ height }}>
      {message}
    </div>
  )
}

export function BidsByMonthChart({ data }: { data: BidMonth[] }) {
  const total = data.reduce((sum, m) => sum + m.ganhas + m.perdidas + m.emAndamento + m.semDisputa, 0)
  if (total === 0) {
    return <EmptyChart height={220} message="Nenhuma licitação nos últimos 12 meses. Cadastre as disputas em Licitações." />
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="ganhas" name="Ganhas" stackId="resultado" fill="#D4AF37" />
        <Bar dataKey="perdidas" name="Perdidas" stackId="resultado" fill="#9b3b3b" />
        <Bar dataKey="emAndamento" name="Em andamento" stackId="resultado" fill="#507594" />
        <Bar dataKey="semDisputa" name="Desistência / cancelada" stackId="resultado" fill="#4b5563" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function WonValueChart({ data }: { data: { label: string; valor: number }[] }) {
  if (data.every((m) => m.valor === 0)) {
    return <EmptyChart height={220} message="Nenhuma licitação ganha nos últimos 12 meses." />
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `R$${Math.round(v / 1000)}k` : `R$${v}`)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          formatter={(v: number) => [formatCurrency(v), 'Valor ganho']}
        />
        <Bar dataKey="valor" name="Valor ganho" fill="#D4AF37" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FleetMixChart({ data }: { data: { name: string; veiculos: number; lugares: number }[] }) {
  if (data.length === 0) {
    return <EmptyChart height={140} message="Nenhum veículo cadastrado." />
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="veiculos">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} veículo(s)`, '']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 min-w-0">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
            <span className="text-gray-400">{entry.name}</span>
            <span className="text-white font-semibold ml-auto pl-4">{entry.veiculos}</span>
            <span className="text-gray-500 text-xs">{entry.lugares} lugares</span>
          </div>
        ))}
      </div>
    </div>
  )
}
