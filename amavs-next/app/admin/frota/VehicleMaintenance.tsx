'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Wrench, Trash2, FileText, Upload, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { Vehicle } from '@/lib/types'
import { Input, Select, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MaintenanceRecord {
  id: string
  vehicle_id: string
  maintenance_date: string
  type: 'preventiva' | 'corretiva' | 'revisao' | 'troca_pecas' | 'vistoria' | 'outro'
  description: string
  cost: number | null
  km_at_service: number | null
  document_url: string | null
  notes: string | null
  created_at: string
}

const TYPE_LABELS: Record<MaintenanceRecord['type'], string> = {
  preventiva: 'Manutenção Preventiva',
  corretiva: 'Manutenção Corretiva',
  revisao: 'Revisão Geral',
  troca_pecas: 'Troca de Peças',
  vistoria: 'Vistoria / Inspeção',
  outro: 'Outro',
}

const TYPE_COLORS: Record<MaintenanceRecord['type'], string> = {
  preventiva: 'text-blue-400 bg-blue-500/10',
  corretiva: 'text-red-400 bg-red-500/10',
  revisao: 'text-emerald-400 bg-emerald-500/10',
  troca_pecas: 'text-amber-400 bg-amber-500/10',
  vistoria: 'text-purple-400 bg-purple-500/10',
  outro: 'text-gray-400 bg-gray-500/10',
}

function MaintenanceForm({
  vehicleId,
  record,
  onSave,
  onCancel,
}: {
  vehicleId: string
  record?: MaintenanceRecord
  onSave: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    maintenance_date: record?.maintenance_date ?? new Date().toISOString().slice(0, 10),
    type: record?.type ?? 'preventiva',
    description: record?.description ?? '',
    cost: record?.cost != null ? String(record.cost) : '',
    km_at_service: record?.km_at_service != null ? String(record.km_at_service) : '',
    notes: record?.notes ?? '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.description || !form.maintenance_date) {
      toast.error('Data e descrição são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      let document_url = record?.document_url ?? null

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `${vehicleId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('maintenance').upload(path, file, { upsert: true })
        if (upErr) { toast.error('Erro ao enviar documento: ' + upErr.message); setSaving(false); return }
        document_url = path
      }

      const payload = {
        vehicle_id: vehicleId,
        maintenance_date: form.maintenance_date,
        type: form.type,
        description: form.description,
        cost: form.cost ? parseFloat(form.cost) : null,
        km_at_service: form.km_at_service ? parseInt(form.km_at_service) : null,
        notes: form.notes || null,
        document_url,
      }

      if (record) {
        const { error } = await supabase.from('vehicle_maintenance').update(payload).eq('id', record.id)
        if (error) throw error
        toast.success('Manutenção atualizada!')
      } else {
        const { error } = await supabase.from('vehicle_maintenance').insert(payload)
        if (error) throw error
        toast.success('Manutenção registrada!')
      }
      onSave()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-navy-200/60 border border-white/10 rounded-xl p-5 space-y-3">
      <h4 className="text-white font-semibold text-sm">{record ? 'Editar registro' : 'Novo registro de manutenção'}</h4>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data *" type="date" value={form.maintenance_date} onChange={(e) => set('maintenance_date', e.target.value)} />
        <Select
          label="Tipo *"
          value={form.type}
          onChange={(e) => set('type', e.target.value)}
          options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        />
      </div>
      <Input label="Descrição *" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ex: Troca de óleo e filtros" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Custo (R$)" type="number" step="0.01" value={form.cost} onChange={(e) => set('cost', e.target.value)} placeholder="0,00" />
        <Input label="KM na manutenção" type="number" value={form.km_at_service} onChange={(e) => set('km_at_service', e.target.value)} placeholder="ex: 95000" />
      </div>
      <Textarea label="Observações" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />

      {/* Document upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Documento (NF, Laudo, PDF)</label>
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-gold/30 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={16} className="text-gray-500" />
          <span className="text-gray-400 text-sm">{file ? file.name : record?.document_url ? 'Substituir documento' : 'Clique para anexar'}</span>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="navy" size="sm" fullWidth onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button variant="gold" size="sm" fullWidth onClick={handleSave} loading={saving}>Salvar</Button>
      </div>
    </div>
  )
}

export default function VehicleMaintenance({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const supabase = createClient()
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vehicle_maintenance')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('maintenance_date', { ascending: false })
    setRecords((data ?? []) as MaintenanceRecord[])
    setLoading(false)
  }

  useEffect(() => { load() }, [vehicle.id])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return
    setDeleting(id)
    await supabase.from('vehicle_maintenance').delete().eq('id', id)
    toast.success('Registro removido.')
    setDeleting(null)
    load()
  }

  const openDoc = async (url: string) => {
    if (url.startsWith('http')) { window.open(url, '_blank', 'noopener,noreferrer'); return }
    const { data } = await supabase.storage.from('maintenance').createSignedUrl(url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    else toast.error('Não foi possível abrir o documento.')
  }

  const totalCost = records.reduce((s, r) => s + (r.cost ?? 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-gold" />
            <h2 className="font-heading font-bold text-white">{vehicle.name}</h2>
            <span className="text-gray-500 text-sm">— Manutenções</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          {records.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="font-heading font-black text-2xl text-gold">{records.length}</div>
                <div className="text-gray-500 text-xs mt-0.5">Registros</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="font-heading font-black text-xl text-gold">{formatCurrency(totalCost)}</div>
                <div className="text-gray-500 text-xs mt-0.5">Custo Total</div>
              </div>
            </div>
          )}

          {/* Add button */}
          {!showForm && !editing && (
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)} fullWidth>
              Adicionar registro de manutenção
            </Button>
          )}

          {showForm && (
            <MaintenanceForm vehicleId={vehicle.id} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          )}
          {editing && (
            <MaintenanceForm vehicleId={vehicle.id} record={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
          )}

          {/* Records list */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Histórico ({records.length})</h3>
            {loading ? (
              <div className="py-10 text-center"><div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto" /></div>
            ) : records.length === 0 ? (
              <div className="py-10 text-center">
                <Wrench size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma manutenção registrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 glass-dark rounded-xl px-4 py-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLORS[r.type]}`}>
                        {TYPE_LABELS[r.type]}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">{r.description}</p>
                        <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                          <span>{formatDate(r.maintenance_date)}</span>
                          {r.km_at_service && <span>· {r.km_at_service.toLocaleString('pt-BR')} km</span>}
                          {r.cost && <span>· {formatCurrency(r.cost)}</span>}
                        </div>
                        {r.notes && <p className="text-gray-600 text-xs mt-0.5 truncate">{r.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {r.document_url && (
                        <button onClick={() => openDoc(r.document_url!)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Ver documento">
                          <FileText size={13} />
                        </button>
                      )}
                      <button onClick={() => { setEditing(r); setShowForm(false) }} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all">
                        <Wrench size={13} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
