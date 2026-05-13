'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { demandChartData, revenueChartData, vehicleMixData } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: '#142235',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '10px',
  color: '#F0F0F0',
  fontSize: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
}

const PIE_COLORS = ['#D4AF37', '#507594', '#BB1E1E']

export function DemandChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={demandChartData.slice(0, 7)} barSize={8} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="onibus" name="Ônibus"       fill="#D4AF37" radius={[3, 3, 0, 0]} />
        <Bar dataKey="micro"  name="Micro-ônibus" fill="#507594" radius={[3, 3, 0, 0]} />
        <Bar dataKey="van"    name="Van"          fill="#3d6e52" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={revenueChartData.slice(0, 7)}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `R$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number, name: string) => [formatCurrency(v), name === 'previsto' ? 'Meta' : 'Realizado']}
        />
        <Legend
          wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          dataKey="previsto"
          name="Meta"
          stroke="rgba(212,175,55,0.4)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 4, fill: '#D4AF37' }}
        />
        <Line
          dataKey="realizado"
          name="Realizado"
          stroke="#D4AF37"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#D4AF37' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function VehicleMixChart() {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={vehicleMixData}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
          >
            {vehicleMixData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${v}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {vehicleMixData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: PIE_COLORS[index] }}
            />
            <span className="text-gray-400">{entry.name}</span>
            <span className="text-white font-semibold ml-auto pl-4">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
