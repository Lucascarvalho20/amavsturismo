import { describe, expect, it } from 'vitest'
import { leadSchema, safeRedirectPath } from '../validation'
import { hitRateLimit } from '../rate-limit'

describe('leadSchema', () => {
  const lead = { name: 'Maria', phone: '61 98422-2205', origin: 'Brasília', travel_date: '2026-12-01', passengers: '20' }

  it('converte passageiros de texto para número', () => {
    const r = leadSchema.safeParse(lead)
    expect(r.success && r.data.passengers).toBe(20)
  })

  it('rejeita data fora do formato ISO', () => {
    expect(leadSchema.safeParse({ ...lead, travel_date: '01/12/2026' }).success).toBe(false)
  })

  it('rejeita vehicle_id que não é UUID (evita injeção em filtros)', () => {
    expect(leadSchema.safeParse({ ...lead, vehicle_id: "1' or '1'='1" }).success).toBe(false)
  })
})

describe('safeRedirectPath', () => {
  it.each([
    ['/admin/dashboard', '/admin/dashboard'],
    ['//evil.com', '/'],
    ['https://evil.com', '/'],
    ['/\\evil.com', '/'],
    [null, '/'],
  ])('%s → %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected)
  })
})

describe('hitRateLimit', () => {
  it('bloqueia a partir da (max+1)ª chamada dentro da janela', () => {
    const key = `test:${Math.random()}`
    const results = Array.from({ length: 4 }, () => hitRateLimit(key, 3, 60_000))
    expect(results).toEqual([false, false, false, true])
  })

  it('chaves diferentes não interferem', () => {
    const a = `a:${Math.random()}`
    const b = `b:${Math.random()}`
    hitRateLimit(a, 1, 60_000)
    hitRateLimit(a, 1, 60_000)
    expect(hitRateLimit(b, 1, 60_000)).toBe(false)
  })
})

describe('formatDate', () => {
  it('data pura do banco não volta um dia em fusos negativos (Brasília)', async () => {
    const { formatDate } = await import('../utils')
    expect(formatDate('2016-10-24')).toBe('24/10/2016')
  })
})
