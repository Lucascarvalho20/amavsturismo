// Modalidades aceitas no formulário "Solicitar proposta" (Lei 14.133/2021 + procedimentos auxiliares).
export const BID_MODALITIES = [
  'pregao_eletronico',
  'concorrencia',
  'dispensa',
  'inexigibilidade',
  'ata_srp',
  'cotacao_previa',
  'outro',
] as const

export type BidModality = (typeof BID_MODALITIES)[number]

export const bidModalityLabel: Record<BidModality, string> = {
  pregao_eletronico: 'Pregão eletrônico',
  concorrencia: 'Concorrência',
  dispensa: 'Dispensa de licitação',
  inexigibilidade: 'Inexigibilidade',
  ata_srp: 'Adesão a ata (SRP)',
  cotacao_previa: 'Cotação para pesquisa de preços',
  outro: 'Outro',
}

export const BID_STATUSES = ['nova', 'em_analise', 'proposta_enviada', 'vencida', 'perdida', 'descartada'] as const
export type BidStatus = (typeof BID_STATUSES)[number]

export const bidStatusLabel: Record<BidStatus, string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  proposta_enviada: 'Proposta enviada',
  vencida: 'Vencida (ganhamos)',
  perdida: 'Perdida',
  descartada: 'Descartada',
}

export interface BidRequest {
  id: string
  code: string
  organization: string
  contact_name: string
  role: string | null
  email: string
  phone: string
  modality: BidModality
  process_number: string | null
  session_date: string | null
  service_start: string | null
  vehicles_needed: string | null
  object: string
  edital_url: string | null
  status: BidStatus
  internal_notes: string | null
  created_at: string
  updated_at: string
}
