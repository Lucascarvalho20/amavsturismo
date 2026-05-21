import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { VehicleCategory, VehicleStatus, ContractStatus, LeadStatus, ContractModality } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateLong(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function categoryLabel(category: VehicleCategory): string {
  const labels: Record<VehicleCategory, string> = {
    onibus: 'Ônibus',
    micro: 'Micro-ônibus',
    van: 'Van',
  }
  return labels[category]
}

export function statusLabel(
  status: VehicleStatus | ContractStatus | LeadStatus,
  type: 'vehicle' | 'contract' | 'lead' = 'vehicle'
): string {
  if (type === 'vehicle') {
    const labels: Record<VehicleStatus, string> = {
      disponivel: 'Disponível',
      em_uso: 'Em Uso',
      manutencao: 'Manutenção',
    }
    return labels[status as VehicleStatus] ?? status
  }
  if (type === 'contract') {
    const labels: Record<ContractStatus, string> = {
      ativo: 'Ativo',
      encerrado: 'Encerrado',
      em_licitacao: 'Em Licitação',
      suspenso: 'Suspenso',
    }
    return labels[status as ContractStatus] ?? status
  }
  if (type === 'lead') {
    const labels: Record<LeadStatus, string> = {
      pendente: 'Pendente',
      em_contato: 'Em Contato',
      aprovado: 'Aprovado',
      recusado: 'Recusado',
      convertido: 'Convertido',
    }
    return labels[status as LeadStatus] ?? status
  }
  return status
}

export function modalityLabel(modality: ContractModality): string {
  const labels: Record<ContractModality, string> = {
    pregao_eletronico: 'Pregão Eletrônico',
    tomada_precos: 'Tomada de Preços',
    concorrencia: 'Concorrência',
    dispensa: 'Dispensa de Licitação',
    inexigibilidade: 'Inexigibilidade',
  }
  return labels[modality]
}

export interface WhatsAppMessageParams {
  name: string
  phone: string
  origin: string
  destination: string
  travelDate: string
  returnDate?: string
  passengers: number
  vehicleCategory?: string
  vehicleName?: string
  message?: string
}

export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const lines = [
    `*Solicitação de Orçamento - Amav's Turismo*`,
    ``,
    `👤 *Nome:* ${params.name}`,
    `📞 *Telefone:* ${params.phone}`,
    ``,
    `🗺️ *Origem:* ${params.origin}`,
    `📍 *Destino:* ${params.destination}`,
    `📅 *Data de Ida:* ${params.travelDate}`,
    params.returnDate ? `📅 *Data de Volta:* ${params.returnDate}` : null,
    `👥 *Passageiros:* ${params.passengers}`,
    params.vehicleCategory ? `🚌 *Tipo de Veículo:* ${params.vehicleCategory}` : null,
    params.vehicleName ? `🚌 *Veículo:* ${params.vehicleName}` : null,
    params.message ? `\n💬 *Observações:* ${params.message}` : null,
    ``,
    `_Mensagem enviada pelo site amavsturismo.com.br_`,
  ]
  return lines.filter(Boolean).join('\n')
}

export function buildWhatsAppURL(message: string, number?: string): string {
  const phone = number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5561984222205'
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

export function generateLeadCode(): string {
  const prefix = 'ORC'
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `${prefix}-${year}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

// ── File Upload Security ───────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
])

const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
])

const ALLOWED_IMAGE_OR_DOC_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
])

/**
 * Validates a file's MIME type against an allowed set.
 * Checks both file.type (reported by browser) and the file extension,
 * since file.type can be empty on some browsers.
 */
export function validateFileType(
  file: File,
  allowed: 'images' | 'pdf' | 'images_or_pdf'
): { ok: boolean; error?: string } {
  const typeSet =
    allowed === 'images'
      ? ALLOWED_IMAGE_TYPES
      : allowed === 'pdf'
      ? ALLOWED_DOCUMENT_TYPES
      : ALLOWED_IMAGE_OR_DOC_TYPES

  // Check MIME type if provided by browser
  if (file.type && !typeSet.has(file.type)) {
    const expected =
      allowed === 'images'
        ? 'JPG, PNG, WEBP ou GIF'
        : allowed === 'pdf'
        ? 'PDF'
        : 'JPG, PNG, WEBP, GIF ou PDF'
    return { ok: false, error: `Tipo de arquivo inválido. Permitido: ${expected}.` }
  }

  // Also validate extension as a secondary check
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const ALLOWED_EXTENSIONS: Record<string, Set<string>> = {
    images: new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']),
    pdf: new Set(['pdf']),
    images_or_pdf: new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']),
  }
  if (!ALLOWED_EXTENSIONS[allowed].has(ext)) {
    return { ok: false, error: `Extensão não permitida: .${ext}` }
  }

  return { ok: true }
}
