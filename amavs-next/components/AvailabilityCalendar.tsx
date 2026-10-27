'use client'

import { useState, useEffect } from 'react'
import type { CalendarBlock } from '@/components/ui/MonthCalendar'
import MonthCalendar from '@/components/ui/MonthCalendar'

interface Props {
  vehicleId: string
}

interface BusyPeriod {
  id: string
  start_date: string
  end_date: string | null
  is_indefinite: boolean
  block_type: string
}

export default function AvailabilityCalendar({ vehicleId }: Props) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // API pública devolve só datas ocupadas — títulos e observações ficam no admin.
    fetch(`/api/disponibilidade?vehicle=${encodeURIComponent(vehicleId)}`)
      .then((r) => (r.ok ? r.json() : { busy: [] }))
      .then(({ busy }: { busy: BusyPeriod[] }) => {
        setBlocks(
          (busy ?? []).map((b) => ({
            ...b,
            title: b.block_type === 'manutencao' ? 'Em manutenção' : 'Indisponível',
            notes: null,
          })),
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [vehicleId])

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-dark rounded-xl p-4">
          <MonthCalendar
            blocks={blocks}
            initialMonth={today}
            showNavigation={false}
            minDate={today}
          />
          <p className="text-center text-xs text-gray-500 mt-2 font-medium">
            {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
          </p>
        </div>
        <div className="glass-dark rounded-xl p-4">
          <MonthCalendar
            blocks={blocks}
            initialMonth={nextMonth}
            showNavigation={false}
            minDate={today}
          />
          <p className="text-center text-xs text-gray-500 mt-2 font-medium">
            {nextMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
          </p>
        </div>
      </div>
    </div>
  )
}
