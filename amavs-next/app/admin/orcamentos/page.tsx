'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  MessageCircle,
  MessageSquare,
  Check,
  X,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { formatDate, categoryLabel } from '@/lib/utils'
import type { Lead, LeadStatus, Vehicle } from '@/lib/types'
import toast from 'react-hot-toast'

const STATUS_TABS: { label: string; value: 'all' | LeadStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Em contato', value: 'em_contato' },
  { label: 'Aprovados', value: 'aprovado' },
  { label: 'Convertidos', value: 'convertido' },
  { label: 'Recusados', value: 'recusado' },
]

const STATUS_LABEL: Record<LeadStatus, string> = {
  pendente: 'Pendente',
  em_contato: 'Em contato',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  convertido: 'Convertido',
}

const STATUS_COLORS: Record<LeadStatus, { bg: string; fg: string }> = {
  pendente:    { bg: 'rgba(245,158,11,0.12)', fg: '#B45309' },
  em_contato:  { bg: 'rgba(59,130,246,0.12)', fg: '#1D4ED8' },
  aprovado:    { bg: 'rgba(16,185,129,0.15)', fg: '#047857' },
  recusado:    { bg: 'rgba(239,68,68,0.12)',  fg: '#B91C1C' },
  convertido:  { bg: 'rgba(212,175,55,0.15)', fg: 'var(--gold-strong)' },
}

const fieldStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-md)',
  color: 'var(--text)',
}

export default function OrcamentosAdminPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<'all' | LeadStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [approving, setApproving] = useState<Lead | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data: l }, { data: v }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('id,name,model,category,capacity,status'),
    ])
    setLeads((l ?? []) as Lead[])
    setVehicles((v ?? []) as Vehicle[])
    setLoading(false)
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar')
      setUpdatingId(null)
      return
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    toast.success('Status atualizado')
    setUpdatingId(null)
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.origin.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase())
    const matchStatus = activeStatus === 'all' || l.status === activeStatus
    return matchSearch && matchStatus
  })

  const counts = {
    pendente:   leads.filter((l) => l.status === 'pendente').length,
    em_contato: leads.filter((l) => l.status === 'em_contato').length,
    aprovado:   leads.filter((l) => l.status === 'aprovado').length,
    convertido: leads.filter((l) => l.status === 'convertido').length,
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-semibold tracking-tight text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
            Orçamentos
          </h1>
          <p className="text-sm font-light mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading
              ? 'Carregando...'
              : `${leads.length} solicitaç${leads.length !== 1 ? 'ões' : 'ão'} recebida${leads.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden" style={{ background: 'var(--border)' }}>
        <KpiCard label="Pendentes" value={counts.pendente} />
        <KpiCard label="Em contato" value={counts.em_contato} />
        <KpiCard label="Aprovados" value={counts.aprovado} />
        <KpiCard label="Convertidos" value={counts.convertido} highlight />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Buscar nome, código ou cidade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full text-sm"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => {
            const active = activeStatus === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className="px-4 h-9 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: active ? 'var(--text)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--text)' : 'var(--border-md)'}`,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lead list */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-3xl p-16 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <MessageSquare size={32} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--text)' }}>
            {leads.length === 0 ? 'Nenhum orçamento recebido ainda' : 'Nenhum orçamento encontrado'}
          </p>
          {leads.length === 0 && (
            <p className="text-sm mt-1 font-light" style={{ color: 'var(--text-muted)' }}>
              Eles aparecem aqui quando clientes solicitarem pelo site.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const vehicle = vehicles.find((v) => v.id === lead.vehicle_id) ?? null
            const colors = STATUS_COLORS[lead.status]
            return (
              <div
                key={lead.id}
                className="rounded-2xl p-5 md:p-6 transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
                        {lead.code}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        style={{ background: colors.bg, color: colors.fg }}
                      >
                        {STATUS_LABEL[lead.status]}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
                      {lead.name}
                    </h3>
                    <a
                      href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {lead.phone}
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {/* Aprovar */}
                    {(lead.status === 'pendente' || lead.status === 'em_contato') && (
                      <button
                        onClick={() => setApproving(lead)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium transition-all"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        <Check size={13} /> Aprovar
                      </button>
                    )}
                    {/* Recusar */}
                    {lead.status !== 'recusado' && lead.status !== 'convertido' && (
                      <button
                        onClick={() => {
                          if (confirm('Recusar este orçamento?')) updateStatus(lead.id, 'recusado')
                        }}
                        disabled={updatingId === lead.id}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium transition-all"
                        style={{ background: 'transparent', color: '#B91C1C', border: '1px solid rgba(239,68,68,0.3)' }}
                      >
                        <X size={13} /> Recusar
                      </button>
                    )}
                    {/* Marcar convertido */}
                    {lead.status === 'aprovado' && (
                      <button
                        onClick={() => updateStatus(lead.id, 'convertido')}
                        disabled={updatingId === lead.id}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium transition-all"
                        style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)', border: '1px solid var(--gold-border)' }}
                      >
                        Marcar convertido <ChevronRight size={13} />
                      </button>
                    )}
                    {/* Mensagem WhatsApp */}
                    <a
                      href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name}, recebi seu orçamento (${lead.code}) e vou verificar a disponibilidade.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full transition-all"
                      style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-md)' }}
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>

                {/* Trip info */}
                <div className="mt-4 pt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={1.5} />
                    {lead.origin} → {lead.destination || 'Local'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={1.5} />
                    {formatDate(lead.travel_date)}
                    {lead.return_date && ` – ${formatDate(lead.return_date)}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} strokeWidth={1.5} />
                    {lead.passengers} passageiros
                  </span>
                  {vehicle ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span style={{ color: 'var(--gold-strong)' }}>•</span>
                      {vehicle.name} <span style={{ color: 'var(--text-dim)' }}>({categoryLabel(vehicle.category)})</span>
                    </span>
                  ) : lead.vehicle_category ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span style={{ color: 'var(--gold-strong)' }}>•</span>
                      Categoria: {categoryLabel(lead.vehicle_category)}
                    </span>
                  ) : null}
                </div>

                {lead.message && (
                  <p className="mt-3 text-sm font-light" style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Observações:</strong> {lead.message}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Approval modal */}
      {approving && (
        <ApprovalModal
          lead={approving}
          vehicle={vehicles.find((v) => v.id === approving.vehicle_id) ?? null}
          onClose={() => setApproving(null)}
          onApproved={(approvedLead) => {
            setLeads((prev) => prev.map((l) => (l.id === approvedLead.id ? approvedLead : l)))
            setApproving(null)
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="p-5 md:p-6" style={{ background: highlight ? 'var(--gold-muted)' : 'var(--bg-card)' }}>
      <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
      <div className="font-heading font-semibold text-3xl tracking-tight" style={{ color: highlight ? 'var(--gold-strong)' : 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}

function ApprovalModal({
  lead,
  vehicle,
  onClose,
  onApproved,
}: {
  lead: Lead
  vehicle: Vehicle | null
  onClose: () => void
  onApproved: (lead: Lead) => void
}) {
  const supabase = createClient()
  const [blockCalendar, setBlockCalendar] = useState(!!vehicle)
  const [createReservation, setCreateReservation] = useState(!!vehicle)
  const [totalValue, setTotalValue] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Update lead status
      const { data: updated, error: leadErr } = await supabase
        .from('leads')
        .update({ status: 'aprovado', updated_at: new Date().toISOString() })
        .eq('id', lead.id)
        .select()
        .single()
      if (leadErr || !updated) throw new Error('Erro ao atualizar orçamento')

      // Optionally create vehicle block
      if (vehicle && blockCalendar) {
        const { error: blockErr } = await supabase.from('vehicle_blocks').insert({
          vehicle_id: vehicle.id,
          title: `${lead.name} — ${lead.code}`,
          block_type: 'reserva',
          start_date: lead.travel_date,
          end_date: lead.return_date || lead.travel_date,
          is_indefinite: false,
          notes: `Aprovado do orçamento ${lead.code}. ${lead.passengers} passageiros. ${lead.origin} → ${lead.destination || 'Local'}.`,
        })
        if (blockErr) toast.error('Aprovado, mas o calendário não bloqueou: ' + blockErr.message)
      }

      // Optionally create reservation record
      if (vehicle && createReservation) {
        const { error: resErr } = await supabase.from('reservations').insert({
          vehicle_id: vehicle.id,
          client_name: lead.name,
          client_phone: lead.phone,
          start_date: lead.travel_date,
          end_date: lead.return_date || lead.travel_date,
          origin: lead.origin,
          destination: lead.destination,
          passengers: lead.passengers,
          total_value: totalValue ? Number(totalValue) : 0,
          notes: lead.message || null,
          status: 'confirmada',
        })
        if (resErr) toast.error('Aprovado, mas a reserva não foi criada: ' + resErr.message)
      }

      toast.success('Orçamento aprovado!')
      onApproved(updated as Lead)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao aprovar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-6 md:p-7 sticky top-0 z-10"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="font-heading font-semibold text-xl tracking-tight" style={{ color: 'var(--text)' }}>
              Aprovar orçamento
            </h2>
            <p className="text-xs font-light mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {lead.code} · {lead.name}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 md:p-7 space-y-5">
          {/* Resumo */}
          <div className="rounded-2xl p-4 text-sm space-y-2" style={{ background: 'var(--bg-elevated)' }}>
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Rota</span><span style={{ color: 'var(--text)' }} className="font-medium text-right">{lead.origin} → {lead.destination || 'Local'}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Data</span><span style={{ color: 'var(--text)' }} className="font-medium">{formatDate(lead.travel_date)}{lead.return_date && ` – ${formatDate(lead.return_date)}`}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Passageiros</span><span style={{ color: 'var(--text)' }} className="font-medium">{lead.passengers}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Veículo</span><span style={{ color: 'var(--text)' }} className="font-medium">{vehicle?.name ?? 'Sem veículo definido'}</span></div>
          </div>

          {vehicle ? (
            <>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockCalendar}
                  onChange={(e) => setBlockCalendar(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-sm block" style={{ color: 'var(--text)' }}>
                    Bloquear o veículo no calendário
                  </span>
                  <span className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                    Cria um bloco em {vehicle.name} entre {formatDate(lead.travel_date)}{lead.return_date && ` e ${formatDate(lead.return_date)}`}. Outros orçamentos pra essa data serão avisados.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createReservation}
                  onChange={(e) => setCreateReservation(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-sm block" style={{ color: 'var(--text)' }}>
                    Criar reserva formal
                  </span>
                  <span className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                    Salva uma reserva confirmada na tabela de reservas com os dados do cliente.
                  </span>
                </span>
              </label>

              {createReservation && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
                    Valor da reserva (opcional)
                  </label>
                  <input
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="Ex: 4500"
                    className="w-full h-11 px-4 rounded-xl text-sm"
                    style={fieldStyle}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-xs font-light p-3 rounded-xl" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
              Esse orçamento não tem um veículo específico atribuído.
              Aprovar apenas marca o orçamento como aprovado — sem bloquear calendário.
            </p>
          )}

          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full text-sm font-medium"
              style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-full text-sm font-medium"
              style={{ background: '#047857', color: '#fff' }}
            >
              <Check size={14} />
              {saving ? 'Aprovando...' : 'Confirmar aprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
