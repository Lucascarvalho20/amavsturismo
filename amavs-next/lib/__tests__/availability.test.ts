import { describe, expect, it } from 'vitest'
import { checkVehicleAvailability, rankVehicles } from '../availability'
import type { Reservation, Vehicle, VehicleBlock } from '../types'

function vehicle(id: string, capacity: number, status: Vehicle['status'] = 'disponivel'): Vehicle {
  return {
    id, slug: id, name: id, model: 'm', category: capacity > 30 ? 'onibus' : capacity > 16 ? 'micro' : 'van',
    capacity, year: 2022, plate: 'AAA0000', km: 0, price_km: 0, price_day: 0, status,
    next_service: null, features: [], images: [], description: '', photo_url: null,
    created_at: '', updated_at: '',
  }
}

function block(vehicle_id: string, start: string, end: string | null, indefinite = false): VehicleBlock {
  return {
    id: `${vehicle_id}-${start}`, vehicle_id, title: 'x', block_type: 'reserva',
    start_date: start, end_date: end, is_indefinite: indefinite, notes: null, created_at: '', updated_at: '',
  }
}

function reservation(vehicle_id: string, start: string, end: string, status: Reservation['status'] = 'confirmada'): Reservation {
  return {
    id: `r-${start}`, vehicle_id, client_name: 'Cliente', client_phone: '', start_date: start, end_date: end,
    origin: '', destination: '', passengers: 10, total_value: 0, notes: null, status, created_at: '',
  }
}

describe('checkVehicleAvailability', () => {
  const bus = vehicle('bus', 46)

  it('fica disponível sem bloqueios', () => {
    expect(checkVehicleAvailability(bus, '2026-11-10', '2026-11-12', [], []).available).toBe(true)
  })

  it('detecta sobreposição parcial com um bloqueio', () => {
    const r = checkVehicleAvailability(bus, '2026-11-10', '2026-11-12', [block('bus', '2026-11-12', '2026-11-15')], [])
    expect(r.available).toBe(false)
    expect(r.conflicts).toHaveLength(1)
  })

  it('não conflita com bloqueio que termina antes da viagem', () => {
    const r = checkVehicleAvailability(bus, '2026-11-10', '2026-11-12', [block('bus', '2026-11-01', '2026-11-09')], [])
    expect(r.available).toBe(true)
  })

  it('bloqueio por tempo indeterminado vale para qualquer data posterior', () => {
    const r = checkVehicleAvailability(bus, '2027-03-01', null, [block('bus', '2026-11-01', null, true)], [])
    expect(r.available).toBe(false)
  })

  it('ignora bloqueios de outros veículos', () => {
    const r = checkVehicleAvailability(bus, '2026-11-10', null, [block('outro', '2026-11-10', '2026-11-10')], [])
    expect(r.available).toBe(true)
  })

  it('reserva cancelada não ocupa o veículo', () => {
    const r = checkVehicleAvailability(bus, '2026-11-10', null, [], [reservation('bus', '2026-11-10', '2026-11-10', 'cancelada')])
    expect(r.available).toBe(true)
  })

  it('veículo em manutenção nunca está disponível', () => {
    const r = checkVehicleAvailability(vehicle('m', 28, 'manutencao'), '2026-11-10', null, [], [])
    expect(r.available).toBe(false)
    expect(r.conflicts[0].kind).toBe('manutencao')
  })
})

describe('rankVehicles', () => {
  const fleet = [vehicle('van', 15), vehicle('micro', 28), vehicle('bus', 46)]

  it('sugere o menor veículo que comporta o grupo', () => {
    const ranked = rankVehicles(fleet, 20, '2026-11-10', null, [], [])
    expect(ranked[0].vehicle.id).toBe('micro')
  })

  it('pula o veículo ideal quando ele está ocupado', () => {
    const ranked = rankVehicles(fleet, 20, '2026-11-10', null, [block('micro', '2026-11-09', '2026-11-11')], [])
    expect(ranked[0].vehicle.id).toBe('bus')
  })

  it('veículo pequeno demais fica depois de qualquer um que comporte o grupo', () => {
    const ranked = rankVehicles(fleet, 40, '2026-11-10', null, [], [])
    expect(ranked.map((r) => r.vehicle.id)).toEqual(['bus', 'micro', 'van'])
  })
})
