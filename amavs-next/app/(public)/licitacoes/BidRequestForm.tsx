'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, MessageCircle, Send, AlertCircle } from 'lucide-react'
import { BID_MODALITIES, bidModalityLabel } from '@/lib/licitacoes'
import { buildWhatsAppURL, formatDate } from '@/lib/utils'

const schema = z.object({
  organization: z.string().trim().min(2, 'Informe o órgão ou entidade'),
  contact_name: z.string().trim().min(2, 'Informe seu nome'),
  role: z.string().optional(),
  email: z.string().trim().email('E-mail inválido'),
  phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Telefone com DDD'),
  modality: z.enum(BID_MODALITIES),
  process_number: z.string().optional(),
  session_date: z.string().optional(),
  service_start: z.string().optional(),
  vehicles_needed: z.string().optional(),
  object: z.string().trim().min(10, 'Descreva o objeto em poucas linhas'),
  edital_url: z.string().trim().url('Link inválido (comece com https://)').optional().or(z.literal('')),
  website: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const field =
  'w-full h-11 px-4 rounded-xl text-[15px] outline-none transition-colors focus:ring-2 focus:ring-[var(--gold-strong)]/30'
const fieldStyle = { background: 'var(--bg)', border: '1px solid var(--border-md)', color: 'var(--text)' }

function Label({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <span className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
      {children}
      {error && <span className="ml-2 text-xs font-normal text-red-500">{error}</span>}
    </span>
  )
}

export default function BidRequestForm() {
  const [sent, setSent] = useState<{ code: string; saved: boolean; data: FormData } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { modality: 'pregao_eletronico' } })

  const whatsappText = (d: FormData, code?: string) =>
    [
      `*Solicitação de proposta${code ? ` ${code}` : ''}*`,
      `Órgão: ${d.organization}`,
      `Modalidade: ${bidModalityLabel[d.modality]}${d.process_number ? ` nº ${d.process_number}` : ''}`,
      d.session_date ? `Sessão: ${formatDate(d.session_date)}` : '',
      d.vehicles_needed ? `Veículos: ${d.vehicles_needed}` : '',
      `Objeto: ${d.object}`,
      `Contato: ${d.contact_name}${d.role ? ` (${d.role})` : ''} · ${d.email}`,
    ]
      .filter(Boolean)
      .join('\n')

  const onSubmit = async (d: FormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/licitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      const json = await res.json().catch(() => ({}))
      setSent({ code: json.code ?? '', saved: res.ok, data: d })
    } catch {
      setSent({ code: '', saved: false, data: d })
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl p-8 md:p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {sent.saved ? (
          <>
            <CheckCircle2 size={44} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="font-heading font-semibold text-2xl tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              Solicitação recebida
            </h3>
            <p className="mb-1" style={{ color: 'var(--text-muted)' }}>
              Protocolo <span className="font-mono font-medium" style={{ color: 'var(--text)' }}>{sent.code}</span>
            </p>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Retornamos no e-mail {sent.data.email} em até 1 dia útil. Se a sessão for próxima, chame no WhatsApp.
            </p>
          </>
        ) : (
          <>
            <AlertCircle size={44} className="mx-auto mb-4 text-amber-500" />
            <h3 className="font-heading font-semibold text-2xl tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              Não conseguimos registrar pelo site
            </h3>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Envie os mesmos dados pelo WhatsApp. A mensagem já vai preenchida.
            </p>
          </>
        )}
        <a
          href={buildWhatsAppURL(whatsappText(sent.data, sent.code || undefined))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle size={16} /> Enviar também pelo WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* honeypot anti-robô: invisível para pessoas */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register('website')} />

      <label className="md:col-span-2">
        <Label error={errors.organization?.message}>Órgão / entidade *</Label>
        <input className={field} style={fieldStyle} placeholder="Ex.: Comando Militar do Planalto" {...register('organization')} />
      </label>

      <label>
        <Label error={errors.contact_name?.message}>Seu nome *</Label>
        <input className={field} style={fieldStyle} autoComplete="name" {...register('contact_name')} />
      </label>
      <label>
        <Label>Cargo / setor</Label>
        <input className={field} style={fieldStyle} placeholder="Ex.: Pregoeiro, Setor de compras" {...register('role')} />
      </label>

      <label>
        <Label error={errors.email?.message}>E-mail institucional *</Label>
        <input type="email" className={field} style={fieldStyle} autoComplete="email" {...register('email')} />
      </label>
      <label>
        <Label error={errors.phone?.message}>Telefone *</Label>
        <input type="tel" className={field} style={fieldStyle} autoComplete="tel" placeholder="(61) 9 0000-0000" {...register('phone')} />
      </label>

      <label>
        <Label>Modalidade *</Label>
        <select className={field} style={fieldStyle} {...register('modality')}>
          {BID_MODALITIES.map((m) => (
            <option key={m} value={m}>{bidModalityLabel[m]}</option>
          ))}
        </select>
      </label>
      <label>
        <Label>Nº do processo / pregão</Label>
        <input className={field} style={fieldStyle} placeholder="Ex.: PE 90012/2026" {...register('process_number')} />
      </label>

      <label>
        <Label>Data da sessão</Label>
        <input type="date" className={field} style={fieldStyle} {...register('session_date')} />
      </label>
      <label>
        <Label>Início previsto do serviço</Label>
        <input type="date" className={field} style={fieldStyle} {...register('service_start')} />
      </label>

      <label className="md:col-span-2">
        <Label>Veículos estimados</Label>
        <input className={field} style={fieldStyle} placeholder="Ex.: 4 ônibus executivos e 2 vans, 10 diárias" {...register('vehicles_needed')} />
      </label>

      <label className="md:col-span-2">
        <Label error={errors.object?.message}>Objeto / necessidade *</Label>
        <textarea
          rows={4}
          className={`${field} h-auto py-3 resize-y`}
          style={fieldStyle}
          placeholder="Descreva o serviço: trajeto, datas, número de passageiros, exigências do termo de referência…"
          {...register('object')}
        />
      </label>

      <label className="md:col-span-2">
        <Label error={errors.edital_url?.message}>Link do edital ou termo de referência</Label>
        <input className={field} style={fieldStyle} placeholder="https://www.gov.br/compras/…" {...register('edital_url')} />
      </label>

      <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs max-w-md" style={{ color: 'var(--text-dim)' }}>
          Os dados são usados apenas para responder a esta solicitação, conforme a{' '}
          <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-opacity disabled:opacity-60"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Send size={16} />
          {submitting ? 'Enviando…' : 'Enviar solicitação'}
        </button>
      </div>
    </form>
  )
}
