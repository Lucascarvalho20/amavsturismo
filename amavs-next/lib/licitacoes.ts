// Licitações que a empresa disputa (tabela bids). Uso interno do painel.

export const BID_MODALITIES = [
  'pregao_eletronico',
  'concorrencia',
  'dispensa',
  'inexigibilidade',
  'ata_srp',
  'cotacao',
  'outro',
] as const
export type BidModality = (typeof BID_MODALITIES)[number]

export const bidModalityLabel: Record<BidModality, string> = {
  pregao_eletronico: 'Pregão eletrônico',
  concorrencia: 'Concorrência',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  ata_srp: 'Adesão a ata (SRP)',
  cotacao: 'Cotação / pesquisa de preços',
  outro: 'Outro',
}

/** Ordem = etapa do funil. */
export const BID_STATUSES = [
  'prospeccao',
  'em_analise',
  'proposta_enviada',
  'aguardando_resultado',
  'ganha',
  'perdida',
  'desistencia',
  'cancelada',
] as const
export type BidStatus = (typeof BID_STATUSES)[number]

export const bidStatusLabel: Record<BidStatus, string> = {
  prospeccao: 'Prospecção',
  em_analise: 'Analisando edital',
  proposta_enviada: 'Proposta enviada',
  aguardando_resultado: 'Aguardando resultado',
  ganha: 'Ganha',
  perdida: 'Perdida',
  desistencia: 'Desistimos',
  cancelada: 'Cancelada / deserta',
}

export const OPEN_STATUSES: BidStatus[] = ['prospeccao', 'em_analise', 'proposta_enviada', 'aguardando_resultado']

export const PLATFORMS = ['Compras.gov.br', 'BLL Compras', 'Licitações-e (BB)', 'BEC/SP', 'Portal de Compras GDF', 'Portal próprio do órgão'] as const

export interface Bid {
  id: string
  organization: string
  process_number: string | null
  modality: BidModality
  platform: string | null
  object: string
  location: string | null
  session_at: string | null
  estimated_value: number | null
  proposed_value: number | null
  awarded_value: number | null
  status: BidStatus
  edital_url: string | null
  notes: string | null
  portfolio_id: string | null
  created_at: string
  updated_at: string
}

export interface BidStats {
  open: number
  sessionsNext7Days: number
  won: number
  lost: number
  /** ganhas / (ganhas + perdidas); null quando ainda não há resultado */
  winRate: number | null
  wonValueThisYear: number
}

/** Indicadores do painel. Função pura para poder ser testada. */
export function bidStats(bids: Pick<Bid, 'status' | 'session_at' | 'awarded_value' | 'proposed_value'>[], now = new Date()): BidStats {
  const in7 = now.getTime() + 7 * 86_400_000
  const year = now.getFullYear()
  let open = 0, sessionsNext7Days = 0, won = 0, lost = 0, wonValueThisYear = 0

  for (const b of bids) {
    if (OPEN_STATUSES.includes(b.status)) {
      open++
      if (b.session_at) {
        const t = new Date(b.session_at).getTime()
        if (t >= now.getTime() && t <= in7) sessionsNext7Days++
      }
    }
    if (b.status === 'ganha') {
      won++
      const when = b.session_at ? new Date(b.session_at).getFullYear() : year
      if (when === year) wonValueThisYear += Number(b.awarded_value ?? b.proposed_value ?? 0)
    }
    if (b.status === 'perdida') lost++
  }

  return {
    open,
    sessionsNext7Days,
    won,
    lost,
    winRate: won + lost > 0 ? won / (won + lost) : null,
    wonValueThisYear,
  }
}
