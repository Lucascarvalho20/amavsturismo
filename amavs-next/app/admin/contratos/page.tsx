'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus, Pencil, Trash2, FileText, Search, Upload, X,
  AlertTriangle, Building2, User, Briefcase,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { Contract, ContractStatus, ContractModality } from '@/lib/types'
import { formatCurrency, formatDate, modalityLabel, validateFileType } from '@/lib/utils'
import { ContractStatusBadge } from '@/components/ui/Badge'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────

type ContractType = Contract['contract_type']
type FormTab = 'licitacao' | 'privado'
type PrivateClientType = 'particular' | 'pessoa_juridica' | 'fretamento'

interface LicitacaoForm {
  code: string
  client: string
  process_number: string
  modality: ContractModality
  status: ContractStatus
  start_date: string
  end_date: string
  value: string
  vehicles: string
  is_public: boolean
  notes: string
}

interface PrivadoForm {
  code: string
  client_type: PrivateClientType
  client: string
  service_type: 'fretamento' | 'aluguel' | 'excursao' | 'outro'
  status: ContractStatus
  start_date: string
  end_date: string
  value: string
  notes: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function contractTypeLabel(type: ContractType): string {
  const labels: Record<ContractType, string> = {
    licitacao: 'Licitação',
    particular: 'Particular',
    pessoa_juridica: 'Pessoa Jurídica',
    fretamento: 'Fretamento',
    aluguel: 'Aluguel',
    outro: 'Outro',
  }
  return labels[type] ?? type
}

function ContractTypeBadge({ type }: { type: ContractType }) {
  if (type === 'licitacao') {
    return <Badge variant="blue">Licitação</Badge>
  }
  return <Badge variant="gray">{contractTypeLabel(type)}</Badge>
}

function resolveContractType(
  privateClientType: PrivateClientType,
  serviceType: PrivadoForm['service_type']
): ContractType {
  if (serviceType === 'aluguel') return 'aluguel'
  return privateClientType
}

// ── PDF handler ────────────────────────────────────────────────────────────

async function openPdfUrl(documentUrl: string) {
  if (documentUrl.startsWith('http')) {
    window.open(documentUrl, '_blank', 'noopener,noreferrer')
    return
  }
  const supabase = createClient()
  const { data } = await supabase.storage.from('contracts').createSignedUrl(documentUrl, 60)
  if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  else toast.error('Não foi possível abrir o documento.')
}

// ── Contract Modal ─────────────────────────────────────────────────────────

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

  const initialTab: FormTab =
    !contract || contract.contract_type === 'licitacao' ? 'licitacao' : 'privado'
  const [activeTab, setActiveTab] = useState<FormTab>(initialTab)

  const [licitacaoForm, setLicitacaoForm] = useState<LicitacaoForm>({
    code: contract?.code ?? '',
    client: contract?.client ?? '',
    process_number: contract?.notes ?? '',
    modality: contract?.modality ?? 'pregao_eletronico',
    status: contract?.status ?? 'em_licitacao',
    start_date: contract?.start_date ?? '',
    end_date: contract?.end_date ?? '',
    value: contract?.value != null ? String(contract.value) : '',
    vehicles: '',
    is_public: contract?.is_public ?? false,
    notes: '',
  })

  const [privadoForm, setPrivadoForm] = useState<PrivadoForm>({
    code: contract?.code ?? '',
    client_type:
      contract?.contract_type === 'pessoa_juridica'
        ? 'pessoa_juridica'
        : contract?.contract_type === 'fretamento'
        ? 'fretamento'
        : 'particular',
    client: contract?.client ?? '',
    service_type:
      contract?.contract_type === 'aluguel'
        ? 'aluguel'
        : 'fretamento',
    status: contract?.status ?? 'ativo',
    start_date: contract?.start_date ?? '',
    end_date: contract?.end_date ?? '',
    value: contract?.value != null ? String(contract.value) : '',
    notes: contract?.notes ?? '',
  })

  const setL = (k: keyof LicitacaoForm, v: string | boolean) =>
    setLicitacaoForm((f) => ({ ...f, [k]: v }) as LicitacaoForm)
  const setP = (k: keyof PrivadoForm, v: string) =>
    setPrivadoForm((f) => ({ ...f, [k]: v }) as PrivadoForm)

  const handleSave = async () => {
    const form = activeTab === 'licitacao' ? licitacaoForm : privadoForm
    if (!form.code || !form.client || !form.start_date || !form.end_date || !form.value) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setSaving(true)
    try {
      let document_url = contract?.document_url ?? null

      if (pdfFile) {
        const mime = validateFileType(pdfFile, 'pdf')
        if (!mime.ok) { toast.error(mime.error!); setSaving(false); return }
        const ext = pdfFile.name.split('.').pop()
        const path = `${form.code.replace(/[^a-zA-Z0-9-_]/g, '_')}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(path, pdfFile, { upsert: true })
        if (uploadError) {
          toast.error('Erro ao enviar PDF: ' + uploadError.message)
          setSaving(false)
          return
        }
        document_url = path
      }

      let payload: Omit<Contract, 'id' | 'created_at' | 'vehicle_ids'>

      if (activeTab === 'licitacao') {
        const f = licitacaoForm
        payload = {
          code: f.code,
          client: f.client,
          modality: f.modality,
          status: f.status,
          start_date: f.start_date,
          end_date: f.end_date,
          value: parseFloat(f.value),
          notes: [f.process_number, f.vehicles, f.notes].filter(Boolean).join(' | ') || null,
          document_url,
          contract_type: 'licitacao',
          is_public: f.is_public,
          updated_at: new Date().toISOString(),
        }
      } else {
        const f = privadoForm
        const contractType = resolveContractType(f.client_type, f.service_type)
        payload = {
          code: f.code,
          client: f.client,
          modality: 'dispensa',
          status: f.status,
          start_date: f.start_date,
          end_date: f.end_date,
          value: parseFloat(f.value),
          notes: f.notes || null,
          document_url,
          contract_type: contractType,
          is_public: false,
          updated_at: new Date().toISOString(),
        }
      }

      if (isNew) {
        const { error } = await supabase.from('contracts').insert(payload)
        if (error) throw error
        toast.success('Contrato criado!')
      } else {
        const { error } = await supabase
          .from('contracts')
          .update(payload)
          .eq('id', contract!.id)
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-white">
            {isNew ? 'Novo Contrato' : `Editar — ${contract.code}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-4 pb-0">
          {(['licitacao', 'privado'] as FormTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                activeTab === tab
                  ? tab === 'licitacao'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              )}
            >
              {tab === 'licitacao' ? (
                <><Building2 size={14} /> Licitação Pública</>
              ) : (
                <><Briefcase size={14} /> Contrato Privado</>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* PDF upload — shared */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Documento do Contrato (PDF)
            </label>
            {contract?.document_url && !pdfFile && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => contract.document_url && openPdfUrl(contract.document_url)}
                  className="text-gold text-sm hover:underline flex items-center gap-1"
                >
                  <FileText size={14} /> Ver documento atual
                </button>
              </div>
            )}
            <div
              className="border-2 border-dashed border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-gold/30 transition-colors cursor-pointer bg-navy-200/50"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-sm truncate">
                  {pdfFile ? pdfFile.name : 'Clique para fazer upload do PDF'}
                </p>
                <p className="text-gray-600 text-xs">Máx 20MB</p>
              </div>
              {pdfFile && (
                <button
                  className="text-gray-500 hover:text-red-400 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setPdfFile(null) }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* ── Tab 1: Licitação Pública ─────────────────────────────── */}
          {activeTab === 'licitacao' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Código *"
                  value={licitacaoForm.code}
                  onChange={(e) => setL('code', e.target.value)}
                  placeholder="CT-2024-001"
                  required
                />
                <Select
                  label="Status"
                  value={licitacaoForm.status}
                  onChange={(e) => setL('status', e.target.value)}
                  options={[
                    { value: 'em_licitacao', label: 'Em Licitação' },
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'suspenso', label: 'Suspenso' },
                    { value: 'encerrado', label: 'Encerrado' },
                  ]}
                />
              </div>

              <Input
                label="Órgão / Entidade Pública *"
                value={licitacaoForm.client}
                onChange={(e) => setL('client', e.target.value)}
                placeholder="Ex: Ministério da Educação"
                required
              />

              <Input
                label="Nº do Processo / Edital"
                value={licitacaoForm.process_number}
                onChange={(e) => setL('process_number', e.target.value)}
                placeholder="Ex: 001/2024"
              />

              <Select
                label="Modalidade de Licitação"
                value={licitacaoForm.modality}
                onChange={(e) => setL('modality', e.target.value)}
                options={[
                  { value: 'pregao_eletronico', label: 'Pregão Eletrônico' },
                  { value: 'tomada_precos', label: 'Tomada de Preços' },
                  { value: 'concorrencia', label: 'Concorrência' },
                  { value: 'dispensa', label: 'Dispensa de Licitação' },
                  { value: 'inexigibilidade', label: 'Inexigibilidade' },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de início *"
                  type="date"
                  value={licitacaoForm.start_date}
                  onChange={(e) => setL('start_date', e.target.value)}
                  required
                />
                <Input
                  label="Data de término *"
                  type="date"
                  value={licitacaoForm.end_date}
                  onChange={(e) => setL('end_date', e.target.value)}
                  required
                />
              </div>

              <Input
                label="Valor total do contrato (R$) *"
                type="number"
                step="0.01"
                min={0}
                value={licitacaoForm.value}
                onChange={(e) => setL('value', e.target.value)}
                required
              />

              <Input
                label="Veículos vinculados"
                value={licitacaoForm.vehicles}
                onChange={(e) => setL('vehicles', e.target.value)}
                placeholder="Ex: Ônibus 1 (ABC-1234), Van 2..."
              />

              <Textarea
                label="Observações"
                value={licitacaoForm.notes}
                onChange={(e) => setL('notes', e.target.value)}
                rows={3}
                placeholder="Detalhes, condições especiais..."
              />

              {/* is_public toggle */}
              <div className="flex items-center justify-between p-4 bg-navy-200/50 rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-medium text-gray-200">Mostrar no site público</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Exibe este contrato na página pública de licitações
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setL('is_public', !licitacaoForm.is_public)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                    licitacaoForm.is_public ? 'bg-gold' : 'bg-gray-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      licitacaoForm.is_public ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </>
          )}

          {/* ── Tab 2: Contrato Privado ──────────────────────────────── */}
          {activeTab === 'privado' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Código *"
                  value={privadoForm.code}
                  onChange={(e) => setP('code', e.target.value)}
                  placeholder="CT-2024-001"
                  required
                />
                <Select
                  label="Status"
                  value={privadoForm.status}
                  onChange={(e) => setP('status', e.target.value)}
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'suspenso', label: 'Suspenso' },
                    { value: 'encerrado', label: 'Encerrado' },
                  ]}
                />
              </div>

              {/* Client type radio */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Tipo de Cliente *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'particular', label: 'Pessoa Física (Particular)', icon: User },
                      { value: 'pessoa_juridica', label: 'Pessoa Jurídica (CNPJ)', icon: Building2 },
                      { value: 'fretamento', label: 'Empresa de Turismo / Fretamento', icon: Briefcase },
                    ] as { value: PrivateClientType; label: string; icon: React.ElementType }[]
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setP('client_type', value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs text-center transition-all',
                        privadoForm.client_type === value
                          ? 'border-gold/50 bg-gold/10 text-gold'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Nome / Razão Social *"
                value={privadoForm.client}
                onChange={(e) => setP('client', e.target.value)}
                placeholder="Nome do cliente ou empresa"
                required
              />

              <Select
                label="Tipo de Serviço"
                value={privadoForm.service_type}
                onChange={(e) => setP('service_type', e.target.value)}
                options={[
                  { value: 'fretamento', label: 'Fretamento (viagem com destino)' },
                  { value: 'aluguel', label: 'Locação / Aluguel de Veículo' },
                  { value: 'excursao', label: 'Excursão / Turismo' },
                  { value: 'outro', label: 'Outro' },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de início *"
                  type="date"
                  value={privadoForm.start_date}
                  onChange={(e) => setP('start_date', e.target.value)}
                  required
                />
                <Input
                  label="Data de término *"
                  type="date"
                  value={privadoForm.end_date}
                  onChange={(e) => setP('end_date', e.target.value)}
                  required
                />
              </div>

              <Input
                label="Valor total (R$) *"
                type="number"
                step="0.01"
                min={0}
                value={privadoForm.value}
                onChange={(e) => setP('value', e.target.value)}
                required
              />

              <Textarea
                label="Observações"
                value={privadoForm.notes}
                onChange={(e) => setP('notes', e.target.value)}
                rows={3}
                placeholder="Detalhes, condições especiais..."
              />
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="navy" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="gold" className="flex-1" onClick={handleSave} loading={saving}>
              {isNew ? 'Criar contrato' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm ─────────────────────────────────────────────────────────

function DeleteConfirm({
  contract,
  onClose,
  onDeleted,
}: {
  contract: Contract
  onClose: () => void
  onDeleted: () => void
}) {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('contracts').delete().eq('id', contract.id)
    if (error) {
      toast.error('Erro ao excluir: ' + error.message)
      setDeleting(false)
      return
    }
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
          <strong className="text-white">{contract.code}</strong> — {contract.client}
          <br />
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="navy" fullWidth onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="wine" fullWidth onClick={handleDelete} loading={deleting}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

type ListTab = 'all' | 'licitacao' | 'privado'

export default function ContratosAdminPage() {
  const supabase = createClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all')
  const [listTab, setListTab] = useState<ListTab>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [modal, setModal] = useState<Contract | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null)

  const loadContracts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
    setContracts((data ?? []) as Contract[])
    setLoading(false)
  }

  useEffect(() => {
    loadContracts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = contracts.filter((c) => {
    const matchSearch =
      !search ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchListTab =
      listTab === 'all' ||
      (listTab === 'licitacao' && c.contract_type === 'licitacao') ||
      (listTab === 'privado' && c.contract_type !== 'licitacao')
    const matchDateFrom = !dateFrom || c.start_date >= dateFrom
    const matchDateTo = !dateTo || c.start_date <= dateTo
    return matchSearch && matchStatus && matchListTab && matchDateFrom && matchDateTo
  })

  // Summary stats
  const activeLicitacoes = contracts.filter(
    (c) => c.contract_type === 'licitacao' && c.status === 'ativo'
  ).length
  const privateContracts = contracts.filter((c) => c.contract_type !== 'licitacao').length
  const totalValue = contracts
    .filter((c) => c.status === 'ativo')
    .reduce((s, c) => s + Number(c.value), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Contratos</h1>
          {!loading && (
            <p className="text-gray-400 text-sm mt-0.5">
              <span className="text-blue-400 font-medium">{activeLicitacoes} licitações ativas</span>
              {' · '}
              <span className="text-purple-400 font-medium">{privateContracts} contratos privados</span>
              {' · Total: '}
              <span className="text-gold font-semibold">{formatCurrency(totalValue)}</span>
            </p>
          )}
          {loading && <p className="text-gray-500 text-sm mt-0.5">Carregando...</p>}
        </div>
        <Button variant="gold" leftIcon={<Plus size={16} />} onClick={() => setModal('new')}>
          Novo Contrato
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3">
        {/* Search + Status */}
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

          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-navy-100 border border-white/10 rounded-xl">
            {(['all', 'ativo', 'em_licitacao', 'encerrado', 'suspenso'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  statusFilter === s
                    ? 'bg-gold text-navy-200 font-semibold'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {s === 'all'
                  ? 'Todos'
                  : s === 'ativo'
                  ? 'Ativos'
                  : s === 'em_licitacao'
                  ? 'Em Licitação'
                  : s === 'encerrado'
                  ? 'Encerrados'
                  : 'Suspensos'}
              </button>
            ))}
          </div>
        </div>

        {/* List tab + date range */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* List tab: Todos / Licitações / Privados */}
          <div className="flex gap-1 p-1 bg-navy-100 border border-white/10 rounded-xl">
            {(['all', 'licitacao', 'privado'] as ListTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setListTab(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  listTab === t
                    ? t === 'licitacao'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : t === 'privado'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-gold text-navy-200 font-semibold'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {t === 'all' ? 'Todos' : t === 'licitacao' ? 'Licitações' : 'Privados'}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-xs">De:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-navy-100 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <span className="text-xs">Até:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-navy-100 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Limpar datas"
              >
                <X size={13} />
              </button>
            )}
          </div>
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
              {contracts.length === 0
                ? 'Nenhum contrato cadastrado ainda.'
                : 'Nenhum contrato encontrado para os filtros aplicados.'}
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
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">
                    Modalidade
                  </th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">
                    Período
                  </th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden lg:table-cell">
                    Valor
                  </th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                      i % 2 && 'bg-white/[0.01]'
                    )}
                  >
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{c.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{c.client}</p>
                      {c.notes && (
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{c.notes}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <ContractTypeBadge type={c.contract_type} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell text-xs">
                      {c.contract_type === 'licitacao' ? modalityLabel(c.modality) : '—'}
                    </td>
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
                            onClick={() => c.document_url && openPdfUrl(c.document_url)}
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
