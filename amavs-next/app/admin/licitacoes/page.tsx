'use client'

import { useEffect, useMemo, useState } from 'react'
import { Landmark, Mail, MessageCircle, ExternalLink, CalendarClock, Save, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { cn, formatDate } from '@/lib/utils'
import {
  BID_STATUSES,
  bidModalityLabel,
  bidStatusLabel,
  type BidRequest,
  type BidStatus,
} from '@/lib/licitacoes'

const statusColor: Record<BidStatus, string> = {
  nova: 'bg-gold/15 text-gold',
  em_analise: 'bg-blue-500/15 text-blue-400',
  proposta_enviada: 'bg-purple-500/15 text-purple-300',
  vencida: 'bg-emerald-500/15 text-emerald-400',
  perdida: 'bg-red-500/15 text-red-400',
  descartada: 'bg-white/5 text-gray-500',
}

function daysUntil(date: string | null) {
  if (!date) return null
  const diff = Math.ceil((new Date(date + 'T00:00:00').getTime() - Date.now()) / 86_400_000)
  return diff
}

export default function AdminLicitacoesPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<BidRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [missingTable, setMissingTable] = useState(false)
  const [filter, setFilter] = useState<BidStatus | 'abertas' | 'todas'>('abertas')
  const [openId, setOpenId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bid_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)
    if (error) {
      setMissingTable(error.code === '42P01' || error.message.includes('bid_requests'))
      setRows([])
    } else {
      setRows((data ?? []) as BidRequest[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'todas') return rows
    if (filter === 'abertas') return rows.filter((r) => ['nova', 'em_analise', 'proposta_enviada'].includes(r.status))
    return rows.filter((r) => r.status === filter)
  }, [rows, filter])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1))
    return c
  }, [rows])

  const update = async (id: string, patch: Partial<Pick<BidRequest, 'status' | 'internal_notes'>>) => {
    const { error } = await supabase
      .from('bid_requests')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast.error('Não foi possível salvar.')
      return
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    toast.success('Salvo')
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-white mb-1 flex items-center gap-3">
            <Landmark size={26} className="text-gold" /> Licitações
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Pedidos de proposta enviados por órgãos públicos pela página <strong className="text-gray-300">/licitacoes</strong> do site.
            Acompanhe o prazo da sessão, registre o andamento e anote o que foi combinado.
          </p>
        </div>
      </header>

      {missingTable && (
        <div className="rounded-2xl p-5 mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          A tabela <code>bid_requests</code> ainda não existe no banco. Rode o arquivo
          <code className="mx-1">supabase/migrations/2026-10-27_security_hardening.sql</code>
          no SQL Editor do Supabase.
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-6">
        {([
          ['abertas', 'Em aberto'],
          ...BID_STATUSES.map((s) => [s, bidStatusLabel[s]] as const),
          ['todas', 'Todas'],
        ] as Array<readonly [typeof filter, string]>).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === value ? 'bg-gold text-navy-200 font-semibold' : 'text-gray-400 hover:text-white bg-white/5',
            )}
          >
            {label}
            {BID_STATUSES.includes(value as BidStatus) && counts[value] ? ` (${counts[value]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-dark rounded-2xl p-12 text-center text-gray-500">
          <Inbox size={32} className="mx-auto mb-3 opacity-60" />
          Nenhum pedido {filter === 'todas' ? '' : 'neste filtro'} ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const open = openId === r.id
            const d = daysUntil(r.session_date)
            const urgent = d !== null && d >= 0 && d <= 5 && ['nova', 'em_analise'].includes(r.status)
            return (
              <div key={r.id} className={cn('glass-dark rounded-2xl border', urgent ? 'border-red-500/40' : 'border-white/5')}>
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="w-full text-left p-5 flex flex-wrap items-center gap-x-6 gap-y-2"
                >
                  <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold', statusColor[r.status])}>
                    {bidStatusLabel[r.status]}
                  </span>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-white font-medium">{r.organization}</div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {bidModalityLabel[r.modality]}
                      {r.process_number && ` · nº ${r.process_number}`} · {r.code}
                    </div>
                  </div>
                  {r.session_date && (
                    <div className={cn('flex items-center gap-1.5 text-xs', urgent ? 'text-red-400 font-semibold' : 'text-gray-400')}>
                      <CalendarClock size={14} />
                      Sessão {formatDate(r.session_date)}
                      {d !== null && d >= 0 && ` (${d === 0 ? 'hoje' : `em ${d} dia${d > 1 ? 's' : ''}`})`}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs">Recebido {formatDate(r.created_at)}</div>
                </button>

                {open && (
                  <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 border-t border-white/5 pt-5">
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Objeto</div>
                        <p className="text-gray-200 whitespace-pre-wrap">{r.object}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Info label="Veículos" value={r.vehicles_needed} />
                        <Info label="Início do serviço" value={r.service_start ? formatDate(r.service_start) : null} />
                        <Info label="Contato" value={`${r.contact_name}${r.role ? ` — ${r.role}` : ''}`} />
                        <Info label="Telefone" value={r.phone} />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Proposta ${r.code} — Amav's Turismo`)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-xs">
                          <Mail size={14} /> {r.email}
                        </a>
                        <a href={`https://wa.me/55${r.phone.replace(/^55/, '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs">
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                        {r.edital_url && /^https?:\/\//.test(r.edital_url) && (
                          <a href={r.edital_url} target="_blank" rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs">
                            <ExternalLink size={14} /> Abrir edital
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-gray-500 text-xs uppercase tracking-wider">Andamento</span>
                        <select
                          value={r.status}
                          onChange={(e) => update(r.id, { status: e.target.value as BidStatus })}
                          className="mt-1 w-full bg-navy-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200"
                        >
                          {BID_STATUSES.map((s) => (
                            <option key={s} value={s}>{bidStatusLabel[s]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-gray-500 text-xs uppercase tracking-wider">Anotações internas</span>
                        <textarea
                          rows={5}
                          value={notes[r.id] ?? r.internal_notes ?? ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                          placeholder="Ex.: valor proposto, documentos pendentes, resultado da sessão…"
                          className="mt-1 w-full bg-navy-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none"
                        />
                      </label>
                      <button
                        onClick={() => update(r.id, { internal_notes: notes[r.id] ?? r.internal_notes ?? '' })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-navy-200 text-sm font-semibold hover:opacity-90"
                      >
                        <Save size={14} /> Salvar anotações
                      </button>
                      <p className="text-gray-600 text-[11px]">Anotações nunca aparecem no site público.</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-gray-200">{value || '—'}</div>
    </div>
  )
}
