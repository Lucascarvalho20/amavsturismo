// Agregações dos gráficos do dashboard. Funções puras: recebem as linhas do banco
// e o "agora", e devolvem só os números que o gráfico precisa.

import { type Bid, type BidStatus } from './licitacoes'
import type { Vehicle, VehicleCategory } from './types'
import { categoryLabel } from './utils'

const TIME_ZONE = 'America/Sao_Paulo'
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const monthFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit' })

/**
 * Mês da data no fuso de Brasília, no formato "2026-10".
 * O servidor da Vercel roda em UTC: com getMonth(), uma sessão em 31/10 às 22h
 * cairia em novembro.
 */
export function monthKey(date: Date): string {
  return monthFormat.format(date)
}

/** Os últimos `count` meses, do mais antigo ao atual. */
export function lastMonths(now: Date, count: number): { key: string; label: string }[] {
  const [year, month] = monthKey(now).split('-').map(Number)
  const current = year * 12 + (month - 1)
  const months = []
  for (let i = count - 1; i >= 0; i--) {
    const index = current - i
    const y = Math.floor(index / 12)
    const m = index % 12
    months.push({ key: `${y}-${String(m + 1).padStart(2, '0')}`, label: `${MONTH_LABELS[m]}/${String(y).slice(2)}` })
  }
  return months
}

type BidRow = Pick<Bid, 'status' | 'session_at' | 'created_at' | 'awarded_value' | 'proposed_value'>

export interface BidMonth {
  label: string
  ganhas: number
  perdidas: number
  emAndamento: number
  semDisputa: number
}

const BID_BUCKET: Record<BidStatus, Exclude<keyof BidMonth, 'label'>> = {
  prospeccao: 'emAndamento',
  em_analise: 'emAndamento',
  proposta_enviada: 'emAndamento',
  aguardando_resultado: 'emAndamento',
  ganha: 'ganhas',
  perdida: 'perdidas',
  desistencia: 'semDisputa',
  cancelada: 'semDisputa',
}

/** Licitação entra no mês da sessão; sem sessão marcada, no mês em que foi cadastrada. */
function bidMonth(bid: BidRow): string {
  return monthKey(new Date(bid.session_at ?? bid.created_at))
}

/** Licitações por mês e por resultado, nos últimos `count` meses. */
export function bidsByMonth(bids: BidRow[], now: Date, count = 12): BidMonth[] {
  const months = new Map<string, BidMonth>(
    lastMonths(now, count).map(({ key, label }) => [key, { label, ganhas: 0, perdidas: 0, emAndamento: 0, semDisputa: 0 }]),
  )
  for (const bid of bids) {
    const month = months.get(bidMonth(bid))
    if (month) month[BID_BUCKET[bid.status]]++
  }
  return Array.from(months.values())
}

/** Valor das licitações ganhas por mês: o homologado ou, sem ele, o proposto. */
export function wonValueByMonth(bids: BidRow[], now: Date, count = 12): { label: string; valor: number }[] {
  const months = new Map(lastMonths(now, count).map(({ key, label }) => [key, { label, valor: 0 }]))
  for (const bid of bids) {
    if (bid.status !== 'ganha') continue
    const month = months.get(bidMonth(bid))
    if (month) month.valor += Number(bid.awarded_value ?? bid.proposed_value ?? 0)
  }
  return Array.from(months.values())
}

const CATEGORY_ORDER: VehicleCategory[] = ['onibus', 'micro', 'van']

/** Veículos e lugares por categoria, sem as categorias vazias. */
export function fleetByCategory(
  vehicles: Pick<Vehicle, 'category' | 'capacity'>[],
): { name: string; veiculos: number; lugares: number }[] {
  return CATEGORY_ORDER.map((category) => {
    const ofCategory = vehicles.filter((v) => v.category === category)
    return {
      name: categoryLabel(category),
      veiculos: ofCategory.length,
      lugares: ofCategory.reduce((total, v) => total + v.capacity, 0),
    }
  }).filter((c) => c.veiculos > 0)
}
