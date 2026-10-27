'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Landmark, Plus, X, CalendarClock, ExternalLink, Trophy, Pencil, Trash2, Inbox, Megaphone, Percent, Wallet, ListChecks,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { cn, formatCurrency } from '@/lib/utils'
import { toSlug } from '@/lib/portfolio'
import {
  BID_MODALITIES, BID_STATUSES, OPEN_STATUSES, PLATFORMS,
  bidModalityLabel, bidStatusLabel, bidStats,
  type Bid, type BidStatus,
} from '@/lib/licitacoes'

const statusColor: Record<BidStatus, string> = {
  prospeccao: 'bg-white/10 text-gray-300',
  em_analise: 'bg-blue-500/15 text-blue-400',
  proposta_enviada: 'bg-purple-500/15 text-purple-300',
  aguardando_resultado: 'bg-gold/15 text-gold',
  ganha: 'bg-emerald-500/15 text-emerald-400',
  perdida: 'bg-red-500/15 text-red-400',
  desistencia: 'bg-white/5 text-gray-500',
  cancelada: 'bg-white/5 text-gray-500',
}

type Filter = 'abertas' | 'ganha' | 'perdida' | 'todas'

const fieldCls = 'w-full bg-navy-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40'

function sessionLabel(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000)
  const when = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  return { when, days }
}

/** ISO → valor de <input type="datetime-local"> no fuso local */
function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export default function AdminLicitacoesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [missingTable, setMissingTable] = useState(false)
  const [filter, setFilter] = useState<Filter>('abertas')
  const [editing, setEditing] = useState<Bid | 'new' | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('bids').select('*').order('session_at', { ascending: true, nullsFirst: false }).limit(500)
    if (error) {
      setMissingTable(true)
      setBids([])
    } else {
      setMissingTable(false)
      setBids((data ?? []) as Bid[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => bidStats(bids), [bids])

  const visible = useMemo(() => {
    const list =
      filter === 'todas' ? bids
      : filter === 'abertas' ? bids.filter((b) => OPEN_STATUSES.includes(b.status))
      : bids.filter((b) => b.status === filter)
    // abertas: sessão mais próxima primeiro; demais: mais recentes primeiro
    return filter === 'abertas' ? list : [...list].sort((a, b) => (b.session_at ?? b.created_at).localeCompare(a.session_at ?? a.created_at))
  }, [bids, filter])

  const setStatus = async (bid: Bid, status: BidStatus) => {
    const { error } = await supabase.from('bids').update({ status, updated_at: new Date().toISOString() }).eq('id', bid.id)
    if (error) return toast.error('Não foi possível salvar.')
    setBids((prev) => prev.map((b) => (b.id === bid.id ? { ...b, status } : b)))
    if (status === 'ganha') toast.success('Parabéns! Publique no portfólio quando tiver as fotos.')
  }

  const remove = async (bid: Bid) => {
    if (!window.confirm(`Excluir a licitação de ${bid.organization}?`)) return
    const { error } = await supabase.from('bids').delete().eq('id', bid.id)
    if (error) return toast.error('Não foi possível excluir.')
    setBids((prev) => prev.filter((b) => b.id !== bid.id))
  }

  // Cria um rascunho no portfólio a partir da licitação ganha e abre a edição dele
  const publish = async (bid: Bid) => {
    const year = (bid.session_at ?? bid.created_at).slice(0, 4)
    // sufixo com parte do id garante slug único mesmo com o nome do órgão truncado
    const slug = `${toSlug(bid.organization, 60) || 'contrato'}-${year}-${bid.id.slice(0, 4)}`
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert({
        slug,
        organization: bid.organization,
        kind: 'orgao_publico',
        period_label: year,
        location: bid.location,
        summary: bid.object.slice(0, 400),
        reference: [bidModalityLabel[bid.modality], bid.process_number].filter(Boolean).join(' nº '),
        areas: ['transporte'],
        is_published: false,
        display_order: 0,
      })
      .select('id')
      .single()
    if (error || !data) return toast.error('Não foi possível criar o item do portfólio.')
    await supabase.from('bids').update({ portfolio_id: data.id }).eq('id', bid.id)
    toast.success('Rascunho criado no portfólio. Adicione fotos e publique.')
    router.push(`/admin/portfolio?editar=${data.id}`)
  }

  const kpis = [
    { icon: ListChecks, label: 'Em andamento', value: String(stats.open) },
    { icon: CalendarClock, label: 'Sessões nos próximos 7 dias', value: String(stats.sessionsNext7Days), alert: stats.sessionsNext7Days > 0 },
    { icon: Percent, label: 'Taxa de sucesso', value: stats.winRate === null ? '—' : `${Math.round(stats.winRate * 100)}%`, sub: `${stats.won} ganhas · ${stats.lost} perdidas` },
    { icon: Wallet, label: `Valor ganho em ${new Date().getFullYear()}`, value: formatCurrency(stats.wonValueThisYear) },
  ]

  return (
    <div>
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-white mb-1 flex items-center gap-3">
            <Landmark size={26} className="text-gold" /> Licitações
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Todas as licitações que a empresa está disputando ou já disputou. Cadastre assim que encontrar o edital
            e vá atualizando a etapa. Nada desta tela aparece no site.
          </p>
        </div>
        <button onClick={() => setEditing('new')} disabled={missingTable}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-40">
          <Plus size={16} /> Nova licitação
        </button>
      </header>

      {missingTable && (
        <div className="rounded-2xl p-5 mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          A tabela de licitações ainda não existe no banco. Rode
          <code className="mx-1">supabase/migrations/2026-10-27_security_hardening.sql</code>
          no SQL Editor do Supabase.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className={cn('glass-dark rounded-2xl p-5 border', k.alert ? 'border-red-500/40' : 'border-white/5')}>
            <k.icon size={18} className={k.alert ? 'text-red-400' : 'text-gold'} />
            <div className="font-heading font-bold text-2xl text-white mt-3">{k.value}</div>
            <div className="text-gray-400 text-xs mt-0.5">{k.label}</div>
            {k.sub && <div className="text-gray-600 text-[11px] mt-1">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {([['abertas', 'Em andamento'], ['ganha', 'Ganhas'], ['perdida', 'Perdidas'], ['todas', 'Todas']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filter === v ? 'bg-gold text-navy-200 font-semibold' : 'text-gray-400 hover:text-white bg-white/5')}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-dark rounded-2xl p-12 text-center text-gray-500">
          <Inbox size={32} className="mx-auto mb-3 opacity-60" />
          {filter === 'abertas' ? 'Nenhuma licitação em andamento. Clique em “Nova licitação” para cadastrar.' : 'Nada por aqui ainda.'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((b) => {
            const s = sessionLabel(b.session_at)
            const urgent = !!s && s.days >= 0 && s.days <= 3 && OPEN_STATUSES.includes(b.status)
            return (
              <div key={b.id} className={cn('glass-dark rounded-2xl p-5 border flex flex-wrap items-center gap-x-6 gap-y-3', urgent ? 'border-red-500/40' : 'border-white/5')}>
                <select value={b.status} onChange={(e) => setStatus(b, e.target.value as BidStatus)}
                  className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-gold/40', statusColor[b.status])}
                  aria-label="Etapa">
                  {BID_STATUSES.map((st) => <option key={st} value={st} className="bg-navy-200 text-gray-200">{bidStatusLabel[st]}</option>)}
                </select>

                <div className="flex-1 min-w-[220px]">
                  <div className="text-white font-medium">{b.organization}</div>
                  <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                    {bidModalityLabel[b.modality]}{b.process_number && ` nº ${b.process_number}`}
                    {b.platform && ` · ${b.platform}`} · {b.object}
                  </div>
                </div>

                {s && (
                  <div className={cn('flex items-center gap-1.5 text-xs', urgent ? 'text-red-400 font-semibold' : 'text-gray-400')}>
                    <CalendarClock size={14} /> {s.when}
                    {OPEN_STATUSES.includes(b.status) && s.days >= 0 && ` · ${s.days === 0 ? 'hoje' : `em ${s.days}d`}`}
                  </div>
                )}

                {(b.awarded_value ?? b.proposed_value) != null && (
                  <div className="text-xs text-gray-300 font-medium">
                    {formatCurrency(Number(b.awarded_value ?? b.proposed_value))}
                  </div>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  {b.status === 'ganha' && !b.portfolio_id && (
                    <button onClick={() => publish(b)} title="Criar item no portfólio do site"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                      <Megaphone size={13} /> Publicar no site
                    </button>
                  )}
                  {b.status === 'ganha' && b.portfolio_id && (
                    <a href={`/admin/portfolio?editar=${b.portfolio_id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 hover:bg-white/5">
                      <Trophy size={13} /> No portfólio
                    </a>
                  )}
                  {b.edital_url && /^https?:\/\//.test(b.edital_url) && (
                    <a href={b.edital_url} target="_blank" rel="noopener noreferrer nofollow" title="Abrir edital" className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button onClick={() => setEditing(b)} title="Editar" className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10"><Pencil size={15} /></button>
                  <button onClick={() => remove(b)} title="Excluir" className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10"><Trash2 size={15} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <BidModal
          bid={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setBids((prev) => (prev.some((b) => b.id === saved.id) ? prev.map((b) => (b.id === saved.id ? saved : b)) : [...prev, saved]))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function BidModal({ bid, onClose, onSaved }: { bid: Bid | null; onClose: () => void; onSaved: (b: Bid) => void }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({
    organization: bid?.organization ?? '',
    process_number: bid?.process_number ?? '',
    modality: bid?.modality ?? 'pregao_eletronico',
    platform: bid?.platform ?? '',
    object: bid?.object ?? '',
    location: bid?.location ?? '',
    session_at: toLocalInput(bid?.session_at ?? null),
    estimated_value: bid?.estimated_value?.toString() ?? '',
    proposed_value: bid?.proposed_value?.toString() ?? '',
    awarded_value: bid?.awarded_value?.toString() ?? '',
    status: bid?.status ?? 'em_analise',
    edital_url: bid?.edital_url ?? '',
    notes: bid?.notes ?? '',
  })
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))
  const money = (v: string) => (v.trim() === '' ? null : Number(v.replace(/\./g, '').replace(',', '.')))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.organization.trim().length < 2 || f.object.trim().length < 3) return toast.error('Preencha órgão e objeto.')
    if (f.edital_url && !/^https?:\/\//i.test(f.edital_url)) return toast.error('O link do edital deve começar com https://')
    const values = [f.estimated_value, f.proposed_value, f.awarded_value].map(money)
    if (values.some((v) => v !== null && Number.isNaN(v))) return toast.error('Valor inválido. Use apenas números, ex.: 125000,50')

    const payload = {
      organization: f.organization.trim(),
      process_number: f.process_number.trim() || null,
      modality: f.modality,
      platform: f.platform.trim() || null,
      object: f.object.trim(),
      location: f.location.trim() || null,
      session_at: f.session_at ? new Date(f.session_at).toISOString() : null,
      estimated_value: values[0],
      proposed_value: values[1],
      awarded_value: values[2],
      status: f.status,
      edital_url: f.edital_url.trim() || null,
      notes: f.notes.trim() || null,
      updated_at: new Date().toISOString(),
    }
    setSaving(true)
    const q = bid ? supabase.from('bids').update(payload).eq('id', bid.id) : supabase.from('bids').insert(payload)
    const { data, error } = await q.select('*').single()
    setSaving(false)
    if (error || !data) return toast.error('Não foi possível salvar.')
    toast.success('Licitação salva')
    onSaved(data as Bid)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-navy-200 border border-white/10">
        <div className="flex items-center justify-between p-6 sticky top-0 bg-navy-200 border-b border-white/10 z-10">
          <h2 className="font-heading font-bold text-white text-lg">{bid ? 'Editar licitação' : 'Nova licitação'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Órgão *" full><input className={fieldCls} value={f.organization} onChange={(e) => set('organization', e.target.value)} placeholder="Ex.: Comando Militar do Planalto" /></Field>
          <Field label="Modalidade">
            <select className={fieldCls} value={f.modality} onChange={(e) => set('modality', e.target.value)}>
              {BID_MODALITIES.map((m) => <option key={m} value={m}>{bidModalityLabel[m]}</option>)}
            </select>
          </Field>
          <Field label="Nº do processo / pregão"><input className={fieldCls} value={f.process_number} onChange={(e) => set('process_number', e.target.value)} placeholder="Ex.: 90012/2026" /></Field>
          <Field label="Plataforma">
            <input className={fieldCls} list="platforms" value={f.platform} onChange={(e) => set('platform', e.target.value)} placeholder="Ex.: Compras.gov.br" />
            <datalist id="platforms">{PLATFORMS.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label="Data e hora da sessão"><input type="datetime-local" className={fieldCls} value={f.session_at} onChange={(e) => set('session_at', e.target.value)} /></Field>
          <Field label="Objeto *" full>
            <textarea rows={3} className={`${fieldCls} resize-none`} value={f.object} onChange={(e) => set('object', e.target.value)} placeholder="Ex.: Locação de 6 ônibus executivos com motorista para os Jogos…" />
          </Field>
          <Field label="Local de execução"><input className={fieldCls} value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Ex.: Brasília-DF" /></Field>
          <Field label="Etapa">
            <select className={fieldCls} value={f.status} onChange={(e) => set('status', e.target.value)}>
              {BID_STATUSES.map((s) => <option key={s} value={s}>{bidStatusLabel[s]}</option>)}
            </select>
          </Field>
          <Field label="Valor estimado do edital (R$)"><input inputMode="decimal" className={fieldCls} value={f.estimated_value} onChange={(e) => set('estimated_value', e.target.value)} /></Field>
          <Field label="Nosso lance / proposta (R$)"><input inputMode="decimal" className={fieldCls} value={f.proposed_value} onChange={(e) => set('proposed_value', e.target.value)} /></Field>
          <Field label="Valor homologado (R$)"><input inputMode="decimal" className={fieldCls} value={f.awarded_value} onChange={(e) => set('awarded_value', e.target.value)} placeholder="Quando ganhar" /></Field>
          <Field label="Link do edital"><input className={fieldCls} value={f.edital_url} onChange={(e) => set('edital_url', e.target.value)} placeholder="https://…" /></Field>
          <Field label="Anotações" full>
            <textarea rows={3} className={`${fieldCls} resize-none`} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Documentos pendentes, concorrentes, motivo da perda…" />
          </Field>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn('block', full && 'md:col-span-2')}>
      <span className="block text-xs text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
