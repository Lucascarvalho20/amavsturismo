export type VehicleCategory = 'onibus' | 'micro' | 'van'
export type VehicleStatus = 'disponivel' | 'em_uso' | 'manutencao'
export type ContractStatus = 'ativo' | 'encerrado' | 'em_licitacao' | 'suspenso'
export type LeadStatus = 'pendente' | 'em_contato' | 'aprovado' | 'recusado' | 'convertido'
export type ContractModality = 'pregao_eletronico' | 'tomada_precos' | 'concorrencia' | 'dispensa' | 'inexigibilidade'

export interface Vehicle {
  id: string
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

export interface Testimonial {
  id: string
  client_name: string
  company: string | null
  rating: number
  text: string
  date: string
  avatar_url: string | null
}

export interface AuditLog {
  id: string
  user_id: string | null
  user_email: string | null
  action: AuditAction
  resource: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'login_blocked'
  | 'vehicle_created'
  | 'vehicle_updated'
  | 'vehicle_deleted'
  | 'contract_created'
  | 'contract_updated'
  | 'contract_deleted'
  | 'lead_updated'
  | 'lead_deleted'
  | 'password_changed'
  | 'mfa_enrolled'
  | 'mfa_disabled'
  | 'profile_updated'

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

export interface LoginAttempt {
  id: string
  email: string
  ip_address: string | null
  success: boolean
  created_at: string
}

export interface DashboardStats {
  total_vehicles: number
  available_vehicles: number
  active_contracts: number
  active_contracts_value: number
  pending_leads: number
  monthly_revenue: number
}

export interface ChartDataPoint {
  name: string
  value?: number
  [key: string]: string | number | undefined
}
