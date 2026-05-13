'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Reservation {
  start: Date
  end: Date
}

interface AvailabilityCalendarProps {
  reservations?: Reservation[]
  className?: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AvailabilityCalendar({
  reservations = [],
  className,
}: AvailabilityCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const isReserved = (day: number) => {
    const date = new Date(year, month, day)
    return reservations.some((r) => date >= r.start && date <= r.end)
  }

  const isPast = (day: number) => {
    const date = new Date(year, month, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }

  const isToday = (day: number) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1)

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <div className={cn('glass-dark rounded-2xl p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-heading font-semibold text-white text-base">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const reserved = isReserved(day)
          const past = isPast(day)
          const today_ = isToday(day)
          return (
            <div
              key={day}
              className={cn(
                'aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-colors',
                past && 'text-gray-600 cursor-default',
                !past && !reserved && 'text-green-400 bg-green-500/10 hover:bg-green-500/20 cursor-default',
                !past && reserved && 'text-red-400 bg-wine/20 cursor-default',
                today_ && 'ring-2 ring-gold ring-offset-1 ring-offset-navy-100'
              )}
              title={reserved ? 'Reservado' : past ? 'Data passada' : 'Disponível'}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-3 h-3 rounded bg-green-500/30" />
          Disponível
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-3 h-3 rounded bg-wine/30" />
          Reservado
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-3 h-3 rounded border-2 border-gold" />
          Hoje
        </div>
      </div>
    </div>
  )
}
