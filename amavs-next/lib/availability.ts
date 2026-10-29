import type { Vehicle, VehicleBlock, Reservation } from './types'

const CONFLICT_KINDS = ['manutencao', 'reserva', 'contrato_privado', 'outro'] as const
type ConflictKind = (typeof CONFLICT_KINDS)[number]

function isConflictKind(value: string): value is ConflictKind {
  return (CONFLICT_KINDS as readonly string[]).includes(value)
}

export type Conflict = {
  kind: ConflictKind
  title?: string
  start: string
  end: string | null
  is_indefinite: boolean
}

export interface AvailabilityResult {
  available: boolean
  conflicts: Conflict[]
}

function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string | null,
  bIndefinite: boolean,
): boolean {
  // a = [aStart, aEnd]; b = [bStart, bEnd], sem fim quando indefinido
  const aS = new Date(aStart).getTime()
  const aE = new Date(aEnd).getTime()
  const bS = new Date(bStart).getTime()
  if (bIndefinite || !bEnd) return aE >= bS
  const bE = new Date(bEnd).getTime()
  return aS <= bE && aE >= bS
}

/** Verifica se um veículo está livre em todo o período pedido. */
export function checkVehicleAvailability(
  vehicle: Vehicle,
  travelDate: string,
  returnDate: string | null | undefined,
  blocks: VehicleBlock[],
  reservations: Reservation[],
): AvailabilityResult {
  if (!travelDate) return { available: true, conflicts: [] }
  const start = travelDate
  const end = returnDate || travelDate

  const conflicts: Conflict[] = []

  // Status "manutenção" no cadastro bloqueia o veículo sem data de fim
  if (vehicle.status === 'manutencao') {
    conflicts.push({
      kind: 'manutencao',
      title: 'Em manutenção',
      start,
      end: null,
      is_indefinite: true,
    })
  }

  for (const b of blocks) {
    if (b.vehicle_id !== vehicle.id) continue
    if (rangesOverlap(start, end, b.start_date, b.end_date, b.is_indefinite)) {
      conflicts.push({
        kind: isConflictKind(b.block_type) ? b.block_type : 'outro',
        title: b.title,
        start: b.start_date,
        end: b.end_date,
        is_indefinite: b.is_indefinite,
      })
    }
  }

  for (const r of reservations) {
    if (r.vehicle_id !== vehicle.id) continue
    if (r.status === 'cancelada') continue
    if (rangesOverlap(start, end, r.start_date, r.end_date, false)) {
      conflicts.push({
        kind: 'reserva',
        title: `Reserva: ${r.client_name}`,
        start: r.start_date,
        end: r.end_date,
        is_indefinite: false,
      })
    }
  }

  return { available: conflicts.length === 0, conflicts }
}

export interface VehicleSuggestion {
  vehicle: Vehicle
  availability: AvailabilityResult
  /** Lugares sobrando; negativo quando o veículo não comporta o grupo. */
  capacityGap: number
  /** Menor é melhor: livre, comporta o grupo e sobra pouco lugar. */
  score: number
}

/** Ordena a frota do mais para o menos adequado ao pedido; o primeiro é a sugestão. */
export function rankVehicles(
  vehicles: Vehicle[],
  passengers: number,
  travelDate: string,
  returnDate: string | null | undefined,
  blocks: VehicleBlock[],
  reservations: Reservation[],
): VehicleSuggestion[] {
  return vehicles
    .map((v) => {
      const availability = checkVehicleAvailability(v, travelDate, returnDate, blocks, reservations)
      const capacityGap = v.capacity - passengers
      // Ocupado: +1000. Pequeno demais: +500 mais os lugares que faltam.
      // Entre os que servem, vence o que deixa menos lugares vazios.
      let score = 0
      if (capacityGap < 0) score += 500 + Math.abs(capacityGap)
      if (!availability.available) score += 1000
      score += Math.abs(capacityGap)
      return { vehicle: v, availability, capacityGap, score }
    })
    .sort((a, b) => a.score - b.score)
}
