'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Monitor, Plus, Search, User, Calendar, DollarSign, ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Computer {
  id: string
  name: string
  user_assigned: string | null
  purchase_date: string | null
  purchase_value: number | null
  cpu: string | null
  ram: string | null
  storage: string | null
  gpu: string | null
  monitor: string | null
  notes: string | null
  created_at: string
}

const fieldStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-md)',
  color: 'var(--text)',
}

export default function ComputadoresPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<Computer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('office_computers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Erro ao carregar computadores')
    else setRows((data ?? []) as Computer[])
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = rows.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      (r.user_assigned ?? '').toLowerCase().includes(q) ||
      (r.cpu ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-semibold tracking-tight text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
            Computadores
          </h1>
          <p className="text-sm font-light mt-1" style={{ color: 'var(--text-muted)' }}>
            Controle interno dos PCs da empresa. Cadastre máquinas, peças e manutenções.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Plus size={14} /> Adicionar computador
        </button>
      </header>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-dim)' }}
        />
        <input
          placeholder="Buscar por nome, usuário ou CPU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-full text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Monitor size={36} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
          <p className="text-base mb-1" style={{ color: 'var(--text)' }}>
            {rows.length === 0 ? 'Nenhum computador cadastrado.' : 'Nenhum resultado para essa busca.'}
          </p>
          {rows.length === 0 && (
            <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>
              Clique em "Adicionar computador" pra começar.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/computadores/${c.id}`}
              className="group rounded-3xl p-6 transition-all card-hover"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}
                >
                  <Monitor size={20} strokeWidth={1.5} />
                </div>
                <ArrowRight
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
                  style={{ color: 'var(--text-dim)' }}
                />
              </div>
              <h3 className="font-heading font-semibold text-lg tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                {c.name}
              </h3>
              {c.user_assigned && (
                <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  <User size={12} /> {c.user_assigned}
                </div>
              )}
              <div className="space-y-1.5 text-xs font-light mt-4 pt-4" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                {c.cpu && <div>CPU: {c.cpu}</div>}
                {c.ram && <div>RAM: {c.ram}</div>}
                {c.storage && <div>Armazenamento: {c.storage}</div>}
                {c.gpu && <div>GPU: {c.gpu}</div>}
              </div>
              {(c.purchase_date || c.purchase_value) && (
                <div className="flex items-center justify-between mt-4 pt-4 text-xs" style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--border)' }}>
                  {c.purchase_date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(c.purchase_date)}
                    </span>
                  )}
                  {c.purchase_value && (
                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--text)' }}>
                      <DollarSign size={11} /> {formatCurrency(c.purchase_value)}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <CreateComputerModal
          onClose={() => setModalOpen(false)}
          onCreated={(c) => {
            setRows((rs) => [c, ...rs])
            setModalOpen(false)
            toast.success('Computador cadastrado')
          }}
        />
      )}
    </div>
  )
}

function CreateComputerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (c: Computer) => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    user_assigned: '',
    purchase_date: '',
    purchase_value: '',
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    monitor: '',
    notes: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Informe o nome do computador')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      user_assigned: form.user_assigned.trim() || null,
      purchase_date: form.purchase_date || null,
      purchase_value: form.purchase_value ? Number(form.purchase_value) : null,
      cpu: form.cpu.trim() || null,
      ram: form.ram.trim() || null,
      storage: form.storage.trim() || null,
      gpu: form.gpu.trim() || null,
      monitor: form.monitor.trim() || null,
      notes: form.notes.trim() || null,
    }
    const { data, error } = await supabase.from('office_computers').insert(payload).select().single()
    setSaving(false)
    if (error || !data) {
      toast.error('Erro ao cadastrar')
      return
    }
    onCreated(data as Computer)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 md:p-8 sticky top-0 z-10" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-heading font-semibold text-2xl tracking-tight" style={{ color: 'var(--text)' }}>
              Novo computador
            </h2>
            <p className="text-sm font-light mt-1" style={{ color: 'var(--text-muted)' }}>
              Cadastre as informações básicas. Peças e manutenções você adiciona no detalhe.
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 md:p-8 space-y-5">
          <Field label="Nome / Apelido *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: PC do Escritório 01" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Usuário responsável" value={form.user_assigned} onChange={(v) => setForm({ ...form, user_assigned: v })} placeholder="Ex: Pedro Silva" />
            <Field label="Data da compra" type="date" value={form.purchase_date} onChange={(v) => setForm({ ...form, purchase_date: v })} />
          </div>
          <Field label="Valor da compra (R$)" type="number" value={form.purchase_value} onChange={(v) => setForm({ ...form, purchase_value: v })} placeholder="0,00" />

          <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
              Specs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CPU" value={form.cpu} onChange={(v) => setForm({ ...form, cpu: v })} placeholder="Ex: Intel i5-12400F" />
              <Field label="RAM" value={form.ram} onChange={(v) => setForm({ ...form, ram: v })} placeholder="Ex: 16GB DDR4" />
              <Field label="Armazenamento" value={form.storage} onChange={(v) => setForm({ ...form, storage: v })} placeholder="Ex: SSD 512GB" />
              <Field label="GPU" value={form.gpu} onChange={(v) => setForm({ ...form, gpu: v })} placeholder="Ex: GTX 1660" />
              <Field label="Monitor" value={form.monitor} onChange={(v) => setForm({ ...form, monitor: v })} placeholder="Ex: LG 24'' FHD" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
              Observações
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={fieldStyle}
            />
          </div>

          <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
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
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
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
