import { describe, expect, it } from 'vitest'
import { bidStats } from '../licitacoes'
import { documentStatus } from '../documents'
import { toSlug, staticPortfolio } from '../portfolio'

const now = new Date('2026-10-27T12:00:00-03:00')
const day = (offset: number) => new Date(now.getTime() + offset * 86_400_000).toISOString()

describe('bidStats', () => {
  it('conta só etapas em aberto e sessões dos próximos 7 dias', () => {
    const s = bidStats(
      [
        { status: 'em_analise', session_at: day(2), awarded_value: null, proposed_value: null },
        { status: 'proposta_enviada', session_at: day(10), awarded_value: null, proposed_value: null },
        { status: 'aguardando_resultado', session_at: day(-1), awarded_value: null, proposed_value: null },
        { status: 'perdida', session_at: day(3), awarded_value: null, proposed_value: null },
      ],
      now,
    )
    expect(s.open).toBe(3)
    expect(s.sessionsNext7Days).toBe(1)
  })

  it('taxa de sucesso ignora desistências e licitações em aberto', () => {
    const s = bidStats(
      [
        { status: 'ganha', session_at: day(-30), awarded_value: 100_000, proposed_value: 120_000 },
        { status: 'perdida', session_at: day(-20), awarded_value: null, proposed_value: 50_000 },
        { status: 'perdida', session_at: day(-10), awarded_value: null, proposed_value: 80_000 },
        { status: 'desistencia', session_at: day(-5), awarded_value: null, proposed_value: null },
        { status: 'em_analise', session_at: day(5), awarded_value: null, proposed_value: null },
      ],
      now,
    )
    expect(s.winRate).toBeCloseTo(1 / 3)
    expect(s.won).toBe(1)
    expect(s.lost).toBe(2)
  })

  it('valor ganho no ano usa o homologado e cai para a proposta quando não há', () => {
    const s = bidStats(
      [
        { status: 'ganha', session_at: '2026-03-10T10:00:00Z', awarded_value: 100_000, proposed_value: 999 },
        { status: 'ganha', session_at: '2026-06-10T10:00:00Z', awarded_value: null, proposed_value: 40_000 },
        { status: 'ganha', session_at: '2025-06-10T10:00:00Z', awarded_value: 500_000, proposed_value: null },
      ],
      now,
    )
    expect(s.wonValueThisYear).toBe(140_000)
  })

  it('sem resultados ainda, a taxa é null (não 0%)', () => {
    expect(bidStats([], now).winRate).toBeNull()
  })
})

describe('documentStatus', () => {
  const today = new Date(2026, 9, 27) // 27/10/2026, hora local

  it.each([
    ['2026-12-31', 'valido', 65],
    ['2026-11-11', 'vencendo', 15],
    ['2026-10-27', 'vencendo', 0],
    ['2026-10-26', 'vencido', -1],
  ] as const)('%s → %s (%i dias)', (expires, status, days) => {
    expect(documentStatus(expires, today)).toEqual({ status, daysLeft: days })
  })

  it('documento sem validade não gera alerta', () => {
    expect(documentStatus(null, today).status).toBe('sem_validade')
  })

  it('antecedência do alerta é configurável', () => {
    expect(documentStatus('2026-11-20', today, 30).status).toBe('vencendo')
  })
})

describe('toSlug', () => {
  it.each([
    ['Colégio Militar de Brasília', 'colegio-militar-de-brasilia'],
    ['22º Batalhão — Eleições 2018', '22-batalhao-eleicoes-2018'],
    ['  -- MPT / UNESCO --  ', 'mpt-unesco'],
    ['!!!', ''],
  ])('%s → %s', (input, expected) => {
    expect(toSlug(input)).toBe(expected)
  })

  it('nunca termina com hífen ao truncar', () => {
    expect(toSlug('abc def ghi', 4)).toBe('abc')
  })

  it('slugs do portfólio estático respeitam a regra do banco', () => {
    for (const p of staticPortfolio) expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
})
