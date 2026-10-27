import { describe, expect, it } from 'vitest'
import { bidSchema, leadSchema, safeRedirectPath } from '../validation'
import { hitRateLimit } from '../rate-limit'

const validBid = {
  organization: 'Comando Militar do Planalto',
  contact_name: 'Fulano de Tal',
  email: 'compras@exemplo.gov.br',
  phone: '(61) 98422-2205',
  modality: 'pregao_eletronico',
  object: 'Locação de 4 ônibus executivos com motorista por 10 diárias.',
}

describe('bidSchema', () => {
  it('aceita um pedido mínimo e normaliza o telefone', () => {
    const r = bidSchema.safeParse(validBid)
    expect(r.success).toBe(true)
    expect(r.success && r.data.phone).toBe('61984222205')
  })

  it('rejeita modalidade fora da lista', () => {
    expect(bidSchema.safeParse({ ...validBid, modality: 'qualquer' }).success).toBe(false)
  })

  it('rejeita link de edital com esquema perigoso', () => {
    expect(bidSchema.safeParse({ ...validBid, edital_url: 'javascript:alert(1)' }).success).toBe(false)
  })

  it('rejeita quando o honeypot vem preenchido (robô)', () => {
    expect(bidSchema.safeParse({ ...validBid, website: 'http://spam' }).success).toBe(false)
  })

  it('limita o tamanho do objeto', () => {
    expect(bidSchema.safeParse({ ...validBid, object: 'x'.repeat(3001) }).success).toBe(false)
  })
})

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
