'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, FileText, Search, Upload, X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { Contract, ContractStatus } from '@/lib/types'
import { formatCurrency, formatDate, modalityLabel } from '@/lib/utils'
import { ContractStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Modal ──────────────────────────────────────────────────────────────────

function ContractModal({
  contract,
  onClose,
  onSaved,
}: {
  contract?: Contract
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = !contract
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    code: contract?.code ?? '',
    client: contract?.client ?? '',
    modality: contract?.modality ?? 'pregao_eletronico',
    status: contract?.status ?? 'ativo',
    start_date: contract?.start_date ?? '',
    end_date: contract?.end_date ?? '',
    value: contract?.value != null ? String(contract.value) : '',
    notes: contract?.notes ?? '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.code || !form.client || !form.start_date || !form.end_date || !form.value) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setSaving(true)
    try {
      let document_url = contract?.document_url ?? null

      // Upload PDF if selected
      if (pdfFile) {
        const ext = pdfFile.name.split('.').pop()
        const path = `${form.code.replace(/[^a-zA-Z0-9-_]/g, '_')}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('contracts').upload(path, pdfFile, { upsert: true })
        if (uploadError) {
          toast.error('Erro ao enviar PDF: ' + uploadError.message)
          setSaving(false)
          return
        }
        document_url = path
      }

      const payload = {
        code: form.code,
        client: form.client,
        modality: form.modality,
        status: form.status,
        start_date: form.start_date,
        end_date: form.end_date,
        value: parseFloat(form.value),
        notes: form.notes || null,
        document_url,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { error } = await supabase.from('contracts').insert(payload)
        if (error) throw error
        toast.success('Contrato criado!')
      } else {
        const { error } = await supabase.from('contracts').update(payload).eq('id', contract!.id)
        if (error) throw error
        toast.success('Contrato atualizado!')
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const openPdf = async () => {
    if (!contract?.document_url) return
    const { data } = await supabase.storage.from('contracts').createSignedUrl(contract.document_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else toast.error('Não foi possível abrir o documento.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-xl bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-white">
            {isNew ? 'Novo Contrato' : `Editar — ${contract.code}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Documento do Contrato (PDF)</label>
            {contract?.document_url && !pdfFile && (
              <div className="flex items-center gap-2 mb-2">
                <button onClick={openPdf} className="text-gold text-sm hover:underline flex items-center gap-1">
                  <FileText size={14} /> Ver documento atual
                </button>
              </div>
            )}
            <div
              className="border-2 border-dashed border-white/10 rounded-xl p-5 flex items-center gap-3 hover:border-gold/30 transition-colors cursor-pointer bg-navy-200/50"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={20} className="text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">
                  {pdfFile ? pdfFile.name : 'Clique para fazer upload do PDF'}
                </p>
                <p className="text-gray-600 text-xs">Máx 20MB</p>
              </div>
              {pdfFile && (
                <button
                  className="ml-auto text-gray-500 hover:text-red-400"
                  onClick={(e) => { e.stopPropagation(); setPdfFile(null) }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Código *" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="CT-2024-XXX" required />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'em_licitacao', label: 'Em Licitação' },
                { value: 'suspenso', label: 'Suspenso' },
                { value: 'encerrado', label: 'Encerrado' },
              ]}
            />
          </div>

          <Input label="Órgão / Cliente *" value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Ex: Ministério da Educação" required />

          <Select
            label="Modalidade de Licitação"
            value={form.modality}
            onChange={(e) => set('modality', e.target.value)}
            options={[
              { value: 'pregao_eletronico', label: 'Pregão Eletrônico' },
              { value: 'tomada_precos', label: 'Tomada de Preços' },
              { value: 'concorrencia', label: 'Concorrência' },
              { value: 'dispensa', label: 'Dispensa de Licitação' },
              { value: 'inexigibilidade', label: 'Inexigibilidade' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de início *" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required />
            <Input label="Data de término *" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} required />
          </div>

          <Input
            label="Valor total do contrato (R$) *"
            type="number"
            step="0.01"
            value={form.value}
            onChange={(e) => set('value', e.target.value)}
            min={0}
            required
          />

          <Textarea label="Observações" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Detalhes, condições especiais..." />

          <div className="flex gap-3 pt-2">
            <Button variant="navy" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button variant="gold" className="flex-1" onClick={handleSave} loading={saving}>
              {isNew ? 'Criar contrato' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm ─────────────────────────────────────────────────────────

function DeleteConfirm({ contract, onClose, onDeleted }: { contract: Contract; onClose: () => void; onDeleted: () => void }) {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('contracts').delete().eq('id', contract.id)
    if (error) { toast.error('Erro ao excluir: ' + error.message); setDeleting(false); return }
    toast.success('Contrato excluído.')
    onDeleted()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-navy-100 border border-white/10 rounded-2xl p-6 text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-white text-lg mb-1">Excluir contrato?</h3>
        <p className="text-gray-400 text-sm mb-5">
          <strong className="text-white">{contract.code}</strong> — {contract.client}<br />
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="navy" fullWidth onClick={onClose} disabled={deleting}>Cancelar</Button>
          <Button variant="wine" fullWidth onClick={handleDelete} loading={deleting}>Excluir</Button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ContratosAdminPage() {
  const supabase = createClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all')
  const [modal, setModal] = useState<Contract | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null)

  const loadContracts = async () => {
    setLoading(true)
    const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
    setContracts((data ?? []) as Contract[])
    setLoading(false)
  }

  useEffect(() => { loadContracts() }, [])

  const filtered = contracts.filter((c) => {
    const matchSearch =
      !search ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeValue = contracts.filter((c) => c.status === 'ativo').reduce((s, c) => s + Number(c.value), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Contratos</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? 'Carregando...' : `${contracts.length} contratos · Ativos: `}
            {!loading && <span className="text-gold font-semibold">{formatCurrency(activeValue)}</span>}
          </p>
        </div>
        <Button variant="gold" leftIcon={<Plus size={16} />} onClick={() => setModal('new')}>
          Novo Contrato
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por código ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-100 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex gap-1 p-1 bg-navy-100 border border-white/10 rounded-xl">
          {(['all', 'ativo', 'em_licitacao', 'encerrado'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === s ? 'bg-gold text-navy-200 font-semibold' : 'text-gray-400 hover:text-white'
              )}
            >
              {s === 'all' ? 'Todos' : s === 'ativo' ? 'Ativos' : s === 'em_licitacao' ? 'Em Licitação' : 'Encerrados'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-14 text-center">
            <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Carregando contratos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <FileText size={28} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {contracts.length === 0 ? 'Nenhum contrato cadastrado ainda.' : 'Nenhum contrato encontrado.'}
            </p>
            {contracts.length === 0 && (
              <Button variant="gold" size="sm" className="mt-4" onClick={() => setModal('new')}>
                Adicionar primeiro contrato
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Código</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">Modalidade</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">Período</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden lg:table-cell">Valor</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 && 'bg-white/[0.01]')}>
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{c.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{c.client}</p>
                      {c.notes && <p className="text-gray-500 text-xs truncate max-w-[200px]">{c.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell text-xs">{modalityLabel(c.modality)}</td>
                    <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell text-xs">
                      {formatDate(c.start_date)} – {formatDate(c.end_date)}
                    </td>
                    <td className="px-5 py-3.5 text-gold font-semibold hidden lg:table-cell">
                      {formatCurrency(Number(c.value))}
                    </td>
                    <td className="px-5 py-3.5">
                      <ContractStatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {c.document_url && (
                          <button
                            onClick={async () => {
                              const { data } = await supabase.storage.from('contracts').createSignedUrl(c.document_url!, 60)
                              if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Ver PDF"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setModal(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ContractModal
          contract={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={loadContracts}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          contract={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={loadContracts}
        />
      )}
    </div>
  )
}
