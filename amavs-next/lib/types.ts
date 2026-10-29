export type VehicleCategory = 'onibus' | 'micro' | 'van'
export type VehicleStatus = 'disponivel' | 'em_uso' | 'manutencao'
export type ContractStatus = 'ativo' | 'encerrado' | 'em_licitacao' | 'suspenso'
export type LeadStatus = 'pendente' | 'em_contato' | 'aprovado' | 'recusado' | 'convertido'
export type ContractModality = 'pregao_eletronico' | 'tomada_precos' | 'concorrencia' | 'dispensa' | 'inexigibilidade'

export interface Vehicle {
  id: string
  slug: string
  name: string
  model: string
  category: VehicleCategory
  capacity: number
  year: number
  plate: string
  km: number
  price_km: number
  price_day: number
  status: VehicleStatus
  next_service: string | null
  features: string[]
  images: string[]
  description: string
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  vehicle_id: string
  client_name: string
  client_phone: string
  start_date: string
  end_date: string
  origin: string
  destination: string
  passengers: number
  total_value: number
  notes: string | null
  status: 'confirmada' | 'pendente' | 'cancelada'
  created_at: string
}

export interface Contract {
  id: string
  code: string
  client: string
  modality: ContractModality
  start_date: string
  end_date: string
  value: number
  status: ContractStatus
  vehicle_ids: string[]
  document_url: string | null
  notes: string | null
  contract_type: 'licitacao' | 'particular' | 'pessoa_juridica' | 'fretamento' | 'aluguel' | 'outro'
  is_public: boolean
  created_at: string
  updated_at: string
}

export type BlockType = 'reserva' | 'contrato_privado' | 'manutencao' | 'outro'

export interface VehicleBlock {
  id: string
  vehicle_id: string
  title: string
  block_type: BlockType
  start_date: string
  end_date: string | null
  is_indefinite: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  code: string
  name: string
  phone: string
  email: string | null
  origin: string
  destination: string
  travel_date: string
  return_date: string | null
  passengers: number
  vehicle_category: VehicleCategory | null
  vehicle_id: string | null
  message: string | null
  status: LeadStatus
  source: 'whatsapp' | 'site' | 'instagram' | 'indicacao' | 'outro'
  created_at: string
  updated_at: string
}

export interface TripGallery {
  id: string
  media_type: 'photo' | 'video'
  url: string
  thumbnail_url: string | null
  caption: string | null
  location: string | null
  trip_date: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChartDataPoint {
  name: string
  value?: number
  [key: string]: string | number | undefined
}
