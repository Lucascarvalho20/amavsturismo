import type { Vehicle, VehicleBlock, Reservation } from './types'

export type Conflict = {
  kind: 'manutencao' | 'reserva' | 'contrato_privado' | 'outro'
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
  // a = [aStart, aEnd]; b = [bStart, bEnd or infinity]
  const aS = new Date(aStart).getTime()
  const aE = new Date(aEnd).getTime()
  const bS = new Date(bStart).getTime()
  if (bIndefinite || !bEnd) return aE >= bS
  const bE = new Date(bEnd).getTime()
  return aS <= bE && aE >= bS
}

/** Check whether a single vehicle is available across the requested range. */
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

  // Maintenance hard-lock (manual)
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
        kind: (['manutencao', 'reserva', 'contrato_privado', 'outro'] as const).includes(
          b.block_type as 'manutencao' | 'reserva' | 'contrato_privado' | 'outro',
        )
          ? (b.block_type as Conflict['kind'])
          : 'outro',
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
  /** capacity gap: how many seats spare (negative = too small) */
  capacityGap: number
  /** score lower = better fit (smaller capacity that still fits + available preferred) */
  score: number
}

/**
 * Suggest best vehicle for a given passenger count + date range.
 * Returns ranked list. Top is best fit.
 */
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
      // Score: vehicles that fit and are available rank highest.
      //  - Penalize unavailable heavily (+1000)
      //  - Penalize too-small heavily (+500)
      //  - Among fitting+available, prefer smallest capacity gap (less wasted seats)
      let score = 0
      if (capacityGap < 0) score += 500 + Math.abs(capacityGap)
      if (!availability.available) score += 1000
      score += Math.abs(capacityGap) // smaller gap = better
      return { vehicle: v, availability, capacityGap, score }
    })
    .sort((a, b) => a.score - b.score)
}
