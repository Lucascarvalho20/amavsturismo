import { atestados, type Atestado } from './atestados'

// Serviços prestados exibidos no site (tabela portfolio_items).
// Enquanto a tabela não existir ou estiver vazia, o site usa os atestados de lib/atestados.ts.

export type PortfolioKind = 'orgao_publico' | 'entidade' | 'empresa'

export interface PortfolioItem {
  id: string
  slug: string
  organization: string
  acronym: string | null
  parent_org: string | null
  kind: PortfolioKind
  period_label: string | null
  attested_at: string | null
  location: string | null
  summary: string
  description: string | null
  highlight_value: string | null
  highlight_label: string | null
  reference: string | null
  areas: string[]
  photos: string[]
  is_published: boolean
  display_order: number
}

export const PORTFOLIO_COLUMNS =
  'id,slug,organization,acronym,parent_org,kind,period_label,attested_at,location,summary,description,highlight_value,highlight_label,reference,areas,photos,is_published,display_order'

/** Mesmos slugs usados no seed da migration 2026-10-27. */
const SLUGS: Record<string, string> = {
  cmb: 'colegio-militar-de-brasilia',
  cfc: 'cfc-congresso-brasileiro-de-contabilidade-2016',
  '22bi': '22-batalhao-de-infantaria-eleicoes-2018',
  eme: 'estado-maior-do-exercito-2019',
  mpt: 'ministerio-publico-do-trabalho',
  'ms-unesco': 'ministerio-da-saude-unesco-2012',
  ifsuldeminas: 'ifsuldeminas-passagens-aereas',
  fenapef: 'fenapef-2012',
  ibrad: 'ibrad-2012',
  gob: 'grande-oriente-do-brasil-2013',
}

function fromAtestado(a: Atestado, i: number): PortfolioItem {
  return {
    id: a.id,
    slug: SLUGS[a.id] ?? a.id,
    organization: a.issuer,
    acronym: a.acronym,
    parent_org: a.parent ?? null,
    kind: a.kind,
    period_label: a.period,
    attested_at: a.issuedAt ?? null,
    location: null,
    summary: a.summary,
    description: null,
    highlight_value: a.highlight?.value ?? null,
    highlight_label: a.highlight?.label ?? null,
    reference: a.reference ?? null,
    areas: a.areas,
    photos: [],
    is_published: true,
    display_order: (i + 1) * 10,
  }
}

export const staticPortfolio: PortfolioItem[] = atestados.map(fromAtestado)

export const portfolioAreaLabel: Record<string, string> = {
  transporte: 'Transporte',
  eventos: 'Eventos e hospedagem',
  passagens: 'Passagens aéreas',
}

export const portfolioKindLabel: Record<PortfolioKind, string> = {
  orgao_publico: 'Órgão público',
  entidade: 'Entidade',
  empresa: 'Empresa',
}

type QueryClient = { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any

/** Erro de "tabela não existe" (migration ainda não rodada). */
function isMissingTable(error: { code?: string; message?: string } | null) {
  return !!error && (error.code === '42P01' || error.code === 'PGRST205' || /portfolio_items/.test(error.message ?? ''))
}

/**
 * Itens publicados, em ordem. Usa os atestados estáticos só se a tabela ainda não existir
 * (ou o banco estiver fora do ar) — se a tabela existe, o que vale é o que está nela,
 * inclusive itens despublicados no painel.
 */
export async function loadPortfolio(client: QueryClient): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await client
      .from('portfolio_items')
      .select(PORTFOLIO_COLUMNS)
      .eq('is_published', true)
      .order('display_order', { ascending: true })
    if (error) return isMissingTable(error) ? staticPortfolio : []
    return (data ?? []) as PortfolioItem[]
  } catch {
    return staticPortfolio
  }
}

export async function loadPortfolioItem(client: QueryClient, slug: string): Promise<PortfolioItem | null> {
  try {
    const { data, error } = await client
      .from('portfolio_items')
      .select(PORTFOLIO_COLUMNS)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    if (!error) return (data as PortfolioItem) ?? null
    if (!isMissingTable(error)) return null
  } catch {
    // banco indisponível → estático
  }
  return staticPortfolio.find((p) => p.slug === slug) ?? null
}

/** Slug válido para a URL pública: minúsculas, sem acento, hífens só entre palavras. */
export function toSlug(text: string, maxLength = 80): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')
}
