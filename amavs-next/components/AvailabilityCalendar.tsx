'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { CalendarBlock } from '@/components/ui/MonthCalendar'
import MonthCalendar from '@/components/ui/MonthCalendar'

interface Props {
  vehicleId: string
}

export default function AvailabilityCalendar({ vehicleId }: Props) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('vehicle_blocks')
      .select('id, start_date, end_date, is_indefinite, block_type, title, notes')
      .eq('vehicle_id', vehicleId)
      .then(({ data }) => {
        setBlocks((data ?? []) as CalendarBlock[])
        setLoading(false)
      })
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
