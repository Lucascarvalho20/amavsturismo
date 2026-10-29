import { describe, expect, it } from 'vitest'
import { bidsByMonth, fleetByCategory, lastMonths, monthKey, wonValueByMonth } from '../dashboard'

const bid = (status: string, session_at: string | null, extra: Record<string, unknown> = {}) =>
  ({ status, session_at, created_at: '2026-01-10T12:00:00Z', awarded_value: null, proposed_value: null, ...extra }) as never

describe('monthKey', () => {
  it('usa o mês de Brasília, não o de UTC', () => {
    // 01/11 02:00 UTC = 31/10 23:00 em Brasília
    expect(monthKey(new Date('2026-11-01T02:00:00Z'))).toBe('2026-10')
    expect(monthKey(new Date('2026-11-01T04:00:00Z'))).toBe('2026-11')
  })
})

describe('lastMonths', () => {
  it('atravessa a virada do ano em ordem cronológica', () => {
    expect(lastMonths(new Date('2026-02-15T12:00:00Z'), 3)).toEqual([
      { key: '2025-12', label: 'dez/25' },
      { key: '2026-01', label: 'jan/26' },
      { key: '2026-02', label: 'fev/26' },
    ])
  })
})

describe('bidsByMonth', () => {
  const now = new Date('2026-10-20T12:00:00Z')

  it('agrupa por mês da sessão e por resultado', () => {
    const meses = bidsByMonth(
      [
        bid('ganha', '2026-10-05T13:00:00Z'),
        bid('perdida', '2026-10-06T13:00:00Z'),
        bid('em_analise', '2026-10-25T13:00:00Z'),
        bid('cancelada', '2026-09-01T13:00:00Z'),
      ],
      now,
    )
    expect(meses).toHaveLength(12)
    expect(meses[11]).toEqual({ label: 'out/26', ganhas: 1, perdidas: 1, emAndamento: 1, semDisputa: 0 })
    expect(meses[10].semDisputa).toBe(1)
  })

  it('usa a data de cadastro quando não há sessão e ignora o que está fora da janela', () => {
    const meses = bidsByMonth([bid('prospeccao', null), bid('ganha', '2024-03-01T13:00:00Z')], now)
    expect(meses.find((m) => m.label === 'jan/26')?.emAndamento).toBe(1)
    expect(meses.reduce((total, m) => total + m.ganhas, 0)).toBe(0)
  })
})

describe('wonValueByMonth', () => {
  it('soma o valor homologado, ou o proposto, só das licitações ganhas', () => {
    const meses = wonValueByMonth(
      [
        bid('ganha', '2026-10-05T13:00:00Z', { awarded_value: 100000, proposed_value: 120000 }),
        bid('ganha', '2026-10-06T13:00:00Z', { proposed_value: 50000 }),
        bid('perdida', '2026-10-07T13:00:00Z', { proposed_value: 999999 }),
      ],
      new Date('2026-10-20T12:00:00Z'),
    )
    expect(meses[11]).toEqual({ label: 'out/26', valor: 150000 })
  })
})

describe('fleetByCategory', () => {
  it('conta veículos e lugares por categoria, na ordem ônibus, micro, van, sem categorias vazias', () => {
    expect(
      fleetByCategory([
        { category: 'van', capacity: 15 },
        { category: 'onibus', capacity: 46 },
        { category: 'onibus', capacity: 50 },
      ]),
    ).toEqual([
      { name: 'Ônibus', veiculos: 2, lugares: 96 },
      { name: 'Van', veiculos: 1, lugares: 15 },
    ])
  })
})
