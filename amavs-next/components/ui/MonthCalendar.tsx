'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CalendarBlock {
  id: string
  start_date: string
  end_date: string | null
  is_indefinite: boolean
  block_type: string
  title: string
  notes?: string | null
}

const BLOCK_COLORS: Record<string, string> = {
  reserva: 'bg-blue-500/30 text-blue-200 border-blue-500/40',
  contrato_privado: 'bg-purple-500/30 text-purple-200 border-purple-500/40',
  manutencao: 'bg-amber-500/30 text-amber-200 border-amber-500/40',
  outro: 'bg-gray-500/30 text-gray-200 border-gray-500/40',
}

const BLOCK_DOT: Record<string, string> = {
  reserva: 'bg-blue-400',
  contrato_privado: 'bg-purple-400',
  manutencao: 'bg-amber-400',
  outro: 'bg-gray-400',
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function isDateBlocked(date: Date, blocks: CalendarBlock[]) {
  const d = date.toISOString().slice(0, 10)
  for (const b of blocks) {
    if (b.is_indefinite && d >= b.start_date) return b
    if (b.end_date && d >= b.start_date && d <= b.end_date) return b
    if (!b.end_date && !b.is_indefinite && d === b.start_date) return b
  }
  return null
}

interface MonthCalendarProps {
  blocks: CalendarBlock[]
  onDayClick?: (date: string) => void
  selectedRange?: { start: string; end: string }
  showNavigation?: boolean
  initialMonth?: Date
  minDate?: Date
  className?: string
}

export default function MonthCalendar({
  blocks,
  onDayClick,
  selectedRange,
  showNavigation = true,
  initialMonth,
  minDate,
  className,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, month, d))
    return result
  }, [year, month])

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className={cn('select-none', className)}>
      {showNavigation && (
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-white/5 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white font-semibold text-sm">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-white/5 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-gray-500 font-medium py-1">{w}</div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />
          const dateStr = date.toISOString().slice(0, 10)
          const block = isDateBlocked(date, blocks)
          const isToday = dateStr === today
          const isPast = minDate ? date < minDate : false
          const isSelected =
            selectedRange &&
            dateStr >= selectedRange.start &&
            dateStr <= selectedRange.end

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && onDayClick?.(dateStr)}
              disabled={isPast}
              title={block ? `${block.title}${block.notes ? ` — ${block.notes}` : ''}` : undefined}
              className={cn(
                'relative h-8 w-full rounded text-xs font-medium transition-all',
                isPast && 'opacity-30 cursor-not-allowed',
                isToday && !block && !isSelected && 'ring-1 ring-gold/50',
                block && `${BLOCK_COLORS[block.block_type]} border`,
                isSelected && !block && 'bg-gold/20 text-gold',
                !block && !isSelected && !isPast && 'text-gray-300 hover:bg-white/5',
              )}
            >
              {date.getDate()}
              {block && (
                <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full', BLOCK_DOT[block.block_type])} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
        {Object.entries({ reserva: 'Reservado', contrato_privado: 'Contrato', manutencao: 'Manutenção', outro: 'Outro' }).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', BLOCK_DOT[k])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
