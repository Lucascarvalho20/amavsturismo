import { z } from 'zod'

// Schemas de entrada das rotas públicas. Ficam fora dos route handlers
// para poderem ser testados isoladamente (lib/__tests__/validation.test.ts).

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))
const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().min(10).max(13))
// honeypot: campo invisível no formulário — pessoas deixam vazio, robôs preenchem
const honeypot = z.string().max(0).optional()

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone,
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  origin: z.string().trim().min(2).max(120),
  destination: optionalText(120),
  travel_date: isoDate,
  return_date: isoDate.optional().or(z.literal('')),
  passengers: z.coerce.number().int().min(1).max(500),
  vehicle_id: z.string().uuid().optional().or(z.literal('')),
  message: optionalText(1500),
  website: honeypot,
})

/** Aceita só caminhos internos ("/admin"), nunca "//host" ou URLs absolutas. */
export function safeRedirectPath(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback
  return raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : fallback
}
