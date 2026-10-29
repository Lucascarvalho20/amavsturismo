import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { VehicleCategory, ContractModality } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Converte a string do banco em Date sem deslocar o dia.
 * `new Date('2016-10-24')` é meia-noite UTC — em Brasília (UTC-3) vira 23/10.
 * Datas puras (YYYY-MM-DD) são tratadas como data local; timestamps completos seguem normais.
 */
export function parseDbDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseDbDate(dateString))
}

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

/** Data e hora de Brasília. O fuso fixo faz o servidor (UTC) e o navegador mostrarem a mesma hora. */
export function formatDateTime(value: string): string {
  return dateTimeFormat.format(new Date(value))
}

const CATEGORY_LABEL: Record<VehicleCategory, string> = {
  onibus: 'Ônibus',
  micro: 'Micro-ônibus',
  van: 'Van',
}

export function categoryLabel(category: VehicleCategory): string {
  return CATEGORY_LABEL[category]
}

const MODALITY_LABEL: Record<ContractModality, string> = {
  pregao_eletronico: 'Pregão Eletrônico',
  tomada_precos: 'Tomada de Preços',
  concorrencia: 'Concorrência',
  dispensa: 'Dispensa de Licitação',
  inexigibilidade: 'Inexigibilidade',
}

export function modalityLabel(modality: ContractModality): string {
  return MODALITY_LABEL[modality]
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

type UploadKind = 'images' | 'pdf' | 'images_or_pdf'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

const UPLOAD_RULES: Record<UploadKind, { types: Set<string>; extensions: Set<string>; label: string }> = {
  images: {
    types: new Set(IMAGE_TYPES),
    extensions: new Set(IMAGE_EXTENSIONS),
    label: 'JPG, PNG, WEBP ou GIF',
  },
  pdf: {
    types: new Set(['application/pdf']),
    extensions: new Set(['pdf']),
    label: 'PDF',
  },
  images_or_pdf: {
    types: new Set([...IMAGE_TYPES, 'application/pdf']),
    extensions: new Set([...IMAGE_EXTENSIONS, 'pdf']),
    label: 'JPG, PNG, WEBP, GIF ou PDF',
  },
}

/**
 * Confere o tipo informado pelo navegador e também a extensão do arquivo,
 * porque alguns navegadores mandam `file.type` vazio.
 */
export function validateFileType(file: File, allowed: UploadKind): { ok: boolean; error?: string } {
  const rule = UPLOAD_RULES[allowed]

  if (file.type && !rule.types.has(file.type)) {
    return { ok: false, error: `Tipo de arquivo inválido. Permitido: ${rule.label}.` }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!rule.extensions.has(ext)) {
    return { ok: false, error: `Extensão não permitida: .${ext}` }
  }

  return { ok: true }
}
