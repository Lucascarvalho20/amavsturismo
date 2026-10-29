'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Monitor, ArrowLeft, Save, Plus, Trash2, Wrench, Cpu, User, Calendar, DollarSign, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Computer {
  id: string
  name: string
  user_assigned: string | null
  purchase_date: string | null
  purchase_value: number | null
  invoice_url: string | null
  cpu: string | null
  ram: string | null
  storage: string | null
  gpu: string | null
  monitor: string | null
  notes: string | null
}

interface Part {
  id: string
  computer_id: string
  part_type: string
  description: string
  installed_at: string | null
  cost: number | null
  warranty_until: string | null
  notes: string | null
}

interface Maintenance {
  id: string
  computer_id: string
  service_date: string
  type: 'formatacao' | 'limpeza' | 'troca_peca' | 'reinstalacao' | 'reparo' | 'outro'
  description: string
  cost: number | null
  performed_by: string | null
  notes: string | null
}

const maintTypeLabel: Record<Maintenance['type'], string> = {
  formatacao: 'Formatação',
  limpeza: 'Limpeza',
  troca_peca: 'Troca de peça',
  reinstalacao: 'Reinstalação',
  reparo: 'Reparo',
  outro: 'Outro',
}

const fieldStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-md)',
  color: 'var(--text)',
}

type Tab = 'info' | 'partes' | 'manutencoes'

export default function ComputerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('info')
  const [computer, setComputer] = useState<Computer | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: p }, { data: m }] = await Promise.all([
        supabase.from('office_computers').select('*').eq('id', id).single(),
        supabase.from('office_computer_parts').select('*').eq('computer_id', id).order('installed_at', { ascending: false }),
        supabase.from('office_computer_maintenance').select('*').eq('computer_id', id).order('service_date', { ascending: false }),
      ])
      setComputer((c as Computer) ?? null)
      setParts((p ?? []) as Part[])
      setMaintenances((m ?? []) as Maintenance[])
      setLoading(false)
    }
    load()
  }, [id, supabase])

  const totalPartsCost = parts.reduce((s, p) => s + Number(p.cost ?? 0), 0)
  const totalMaintCost = maintenances.reduce((s, m) => s + Number(m.cost ?? 0), 0)
  const totalCost = Number(computer?.purchase_value ?? 0) + totalPartsCost + totalMaintCost

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }}
        />
      </div>
    )
  }

  if (!computer) {
    return (
      <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>
        <AlertCircle size={32} className="mx-auto mb-3" />
        <p>Computador não encontrado.</p>
        <Link href="/admin/computadores" className="inline-flex items-center gap-1 mt-4 text-sm" style={{ color: 'var(--gold-strong)' }}>
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>
    )
  }

  const deleteComputer = async () => {
    if (!confirm(`Remover "${computer.name}" e todo o histórico (peças + manutenções)?`)) return
    const { error } = await supabase.from('office_computers').delete().eq('id', computer.id)
    if (error) toast.error('Erro ao remover')
    else {
      toast.success('Computador removido')
      router.push('/admin/computadores')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/computadores"
          className="inline-flex items-center gap-1 text-sm mb-4 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}
            >
              <Monitor size={26} strokeWidth={1.4} />
            </div>
            <div>
              <h1 className="font-heading font-semibold tracking-tight text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
                {computer.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm font-light" style={{ color: 'var(--text-muted)' }}>
                {computer.user_assigned && (
                  <span className="inline-flex items-center gap-1">
                    <User size={12} /> {computer.user_assigned}
                  </span>
                )}
                {computer.purchase_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} /> Compra: {formatDate(computer.purchase_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={deleteComputer}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-medium"
            style={{ background: 'transparent', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' }}
          >
            <Trash2 size={14} /> Remover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden" style={{ background: 'var(--border)' }}>
        <KpiCard label="Valor de compra" value={computer.purchase_value ? formatCurrency(computer.purchase_value) : '—'} />
        <KpiCard label="Peças adicionadas" value={parts.length.toString()} sub={totalPartsCost > 0 ? `${formatCurrency(totalPartsCost)} em peças` : ''} />
        <KpiCard label="Manutenções" value={maintenances.length.toString()} sub={totalMaintCost > 0 ? `${formatCurrency(totalMaintCost)} em serviços` : ''} />
        <KpiCard label="Custo total acumulado" value={formatCurrency(totalCost)} highlight />
      </div>

      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['info', 'partes', 'manutencoes'] as Tab[]).map((t) => {
          const label = t === 'info' ? 'Informações' : t === 'partes' ? 'Peças' : 'Manutenções'
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px"
              style={{
                color: active ? 'var(--gold-strong)' : 'var(--text-muted)',
                borderColor: active ? 'var(--gold)' : 'transparent',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'info' && <InfoTab computer={computer} onUpdated={(c) => setComputer(c)} />}
      {tab === 'partes' && (
        <PartsTab
          computerId={computer.id}
          parts={parts}
          onChange={setParts}
        />
      )}
      {tab === 'manutencoes' && (
        <MaintenancesTab
          computerId={computer.id}
          maintenances={maintenances}
          onChange={setMaintenances}
        />
      )}
    </div>
  )
}

function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="p-5 md:p-6" style={{ background: highlight ? 'var(--gold-muted)' : 'var(--bg-card)' }}>
      <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
      <div className="font-heading font-semibold text-2xl md:text-3xl tracking-tight" style={{ color: highlight ? 'var(--gold-strong)' : 'var(--text)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1 font-light" style={{ color: 'var(--text-dim)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function InfoTab({ computer, onUpdated }: { computer: Computer; onUpdated: (c: Computer) => void }) {
  const supabase = createClient()
  const [form, setForm] = useState<Computer>(computer)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const { data, error } = await supabase
      .from('office_computers')
      .update({
        name: form.name,
        user_assigned: form.user_assigned,
        purchase_date: form.purchase_date,
        purchase_value: form.purchase_value,
        cpu: form.cpu,
        ram: form.ram,
        storage: form.storage,
        gpu: form.gpu,
        monitor: form.monitor,
        notes: form.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)
      .select()
      .single()
    setSaving(false)
    if (error || !data) toast.error('Erro ao salvar')
    else {
      onUpdated(data as Computer)
      toast.success('Salvo')
    }
  }

  return (
    <div className="rounded-3xl p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <FormField label="Nome / Apelido" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Usuário responsável" value={form.user_assigned ?? ''} onChange={(v) => setForm({ ...form, user_assigned: v || null })} />
        <FormField label="Data da compra" type="date" value={form.purchase_date ?? ''} onChange={(v) => setForm({ ...form, purchase_date: v || null })} />
      </div>
      <FormField label="Valor da compra (R$)" type="number" value={String(form.purchase_value ?? '')} onChange={(v) => setForm({ ...form, purchase_value: v ? Number(v) : null })} />

      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-xs font-medium uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
          <Cpu size={12} /> Specs atuais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="CPU" value={form.cpu ?? ''} onChange={(v) => setForm({ ...form, cpu: v || null })} />
          <FormField label="RAM" value={form.ram ?? ''} onChange={(v) => setForm({ ...form, ram: v || null })} />
          <FormField label="Armazenamento" value={form.storage ?? ''} onChange={(v) => setForm({ ...form, storage: v || null })} />
          <FormField label="GPU" value={form.gpu ?? ''} onChange={(v) => setForm({ ...form, gpu: v || null })} />
          <FormField label="Monitor" value={form.monitor ?? ''} onChange={(v) => setForm({ ...form, monitor: v || null })} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
          Observações
        </label>
        <textarea
          rows={4}
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={fieldStyle}
        />
      </div>

      <div className="flex justify-end pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Save size={14} />
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}

function PartsTab({
  computerId,
  parts,
  onChange,
}: {
  computerId: string
  parts: Part[]
  onChange: (p: Part[]) => void
}) {
  const supabase = createClient()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    part_type: '',
    description: '',
    installed_at: '',
    cost: '',
    warranty_until: '',
    notes: '',
  })

  const reset = () => setForm({ part_type: '', description: '', installed_at: '', cost: '', warranty_until: '', notes: '' })

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.part_type.trim() || !form.description.trim()) {
      toast.error('Preencha tipo e descrição')
      return
    }
    const { data, error } = await supabase
      .from('office_computer_parts')
      .insert({
        computer_id: computerId,
        part_type: form.part_type.trim(),
        description: form.description.trim(),
        installed_at: form.installed_at || null,
        cost: form.cost ? Number(form.cost) : null,
        warranty_until: form.warranty_until || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()
    if (error || !data) {
      toast.error('Erro ao adicionar peça')
      return
    }
    onChange([data as Part, ...parts])
    reset()
    setAdding(false)
    toast.success('Peça adicionada')
  }

  const remove = async (id: string) => {
    if (!confirm('Remover esta peça?')) return
    const { error } = await supabase.from('office_computer_parts').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else {
      onChange(parts.filter((p) => p.id !== id))
      toast.success('Removida')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>
          Liste todas as peças instaladas nesta máquina — original ou trocada depois.
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <Plus size={12} /> Adicionar peça
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Tipo (CPU, RAM, SSD, etc.) *" value={form.part_type} onChange={(v) => setForm({ ...form, part_type: v })} />
            <FormField label="Descrição *" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: Kingston Fury 8GB DDR4" />
            <FormField label="Data de instalação" type="date" value={form.installed_at} onChange={(v) => setForm({ ...form, installed_at: v })} />
            <FormField label="Valor pago (R$)" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
            <FormField label="Garantia até" type="date" value={form.warranty_until} onChange={(v) => setForm({ ...form, warranty_until: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Observações</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={fieldStyle} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setAdding(false); reset() }} className="h-10 px-4 rounded-full text-sm" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}>Cancelar</button>
            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-medium" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              <Plus size={14} /> Adicionar peça
            </button>
          </div>
        </form>
      )}

      {parts.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>Nenhuma peça cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {parts.map((p) => (
            <div key={p.id} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--gold-strong)' }}>{p.part_type}</span>
                  {p.warranty_until && new Date(p.warranty_until) > new Date() && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
                      Garantia até {formatDate(p.warranty_until)}
                    </span>
                  )}
                </div>
                <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{p.description}</div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {p.installed_at && (
                    <span className="inline-flex items-center gap-1"><Calendar size={11} /> Instalada em {formatDate(p.installed_at)}</span>
                  )}
                  {p.cost != null && (
                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--text)' }}>
                      <DollarSign size={11} /> {formatCurrency(p.cost)}
                    </span>
                  )}
                </div>
                {p.notes && (
                  <div className="text-xs mt-2 font-light" style={{ color: 'var(--text-dim)' }}>{p.notes}</div>
                )}
              </div>
              <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'transparent', border: '1px solid var(--border)', color: '#dc2626' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaintenancesTab({
  computerId,
  maintenances,
  onChange,
}: {
  computerId: string
  maintenances: Maintenance[]
  onChange: (m: Maintenance[]) => void
}) {
  const supabase = createClient()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    service_date: new Date().toISOString().slice(0, 10),
    type: 'limpeza' as Maintenance['type'],
    description: '',
    cost: '',
    performed_by: '',
    notes: '',
  })

  const reset = () => setForm({
    service_date: new Date().toISOString().slice(0, 10),
    type: 'limpeza',
    description: '',
    cost: '',
    performed_by: '',
    notes: '',
  })

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) {
      toast.error('Descreva o serviço')
      return
    }
    const { data, error } = await supabase
      .from('office_computer_maintenance')
      .insert({
        computer_id: computerId,
        service_date: form.service_date,
        type: form.type,
        description: form.description.trim(),
        cost: form.cost ? Number(form.cost) : null,
        performed_by: form.performed_by.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()
    if (error || !data) {
      toast.error('Erro ao registrar')
      return
    }
    onChange([data as Maintenance, ...maintenances])
    reset()
    setAdding(false)
    toast.success('Manutenção registrada')
  }

  const remove = async (id: string) => {
    if (!confirm('Remover esta manutenção do histórico?')) return
    const { error } = await supabase.from('office_computer_maintenance').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else {
      onChange(maintenances.filter((m) => m.id !== id))
      toast.success('Removida')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>
          Registre formatações, limpezas, trocas e qualquer manutenção realizada.
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <Plus size={12} /> Nova manutenção
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Data *" type="date" value={form.service_date} onChange={(v) => setForm({ ...form, service_date: v })} />
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Tipo *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Maintenance['type'] })} className="w-full h-11 px-4 rounded-xl text-sm" style={fieldStyle}>
                {(Object.keys(maintTypeLabel) as Maintenance['type'][]).map((t) => (
                  <option key={t} value={t}>{maintTypeLabel[t]}</option>
                ))}
              </select>
            </div>
            <FormField label="Valor (R$)" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
          </div>
          <FormField label="Descrição *" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: Formatação completa + reinstalação Windows" />
          <FormField label="Executada por" value={form.performed_by} onChange={(v) => setForm({ ...form, performed_by: v })} placeholder="Ex: Pedro / Assistência X" />
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Observações</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={fieldStyle} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setAdding(false); reset() }} className="h-10 px-4 rounded-full text-sm" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}>Cancelar</button>
            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-medium" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              <Plus size={14} /> Registrar
            </button>
          </div>
        </form>
      )}

      {maintenances.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Wrench size={28} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>Nenhuma manutenção registrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {maintenances.map((m) => (
            <div key={m.id} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}>
                <Wrench size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--gold-strong)' }}>{maintTypeLabel[m.type]}</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(m.service_date)}</span>
                </div>
                <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{m.description}</div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {m.performed_by && (
                    <span className="inline-flex items-center gap-1"><User size={11} /> {m.performed_by}</span>
                  )}
                  {m.cost != null && (
                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--text)' }}>
                      <DollarSign size={11} /> {formatCurrency(m.cost)}
                    </span>
                  )}
                </div>
                {m.notes && (
                  <div className="text-xs mt-2 font-light" style={{ color: 'var(--text-dim)' }}>{m.notes}</div>
                )}
              </div>
              <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'transparent', border: '1px solid var(--border)', color: '#dc2626' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl text-sm"
        style={fieldStyle}
      />
    </div>
  )
}
