'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { Vehicle, VehicleBlock, BlockType } from '@/lib/types'
import MonthCalendar from '@/components/ui/MonthCalendar'
import { Input, Select, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const BLOCK_LABELS: Record<BlockType, string> = {
  reserva: 'Reserva',
  contrato_privado: 'Contrato Privado',
  manutencao: 'Manutenção',
  outro: 'Outro',
}

function BlockForm({
  vehicleId,
  block,
  onSave,
  onCancel,
}: {
  vehicleId: string
  block?: VehicleBlock
  onSave: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: block?.title ?? '',
    block_type: block?.block_type ?? 'reserva',
    start_date: block?.start_date ?? '',
    end_date: block?.end_date ?? '',
    is_indefinite: block?.is_indefinite ?? false,
    notes: block?.notes ?? '',
  })

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.start_date) { toast.error('Título e data de início são obrigatórios.'); return }
    if (!form.is_indefinite && !form.end_date) { toast.error('Informe a data de término ou marque como "sem prazo definido".'); return }
    setSaving(true)
    try {
      const payload = {
        vehicle_id: vehicleId,
        title: form.title,
        block_type: form.block_type,
        start_date: form.start_date,
        end_date: form.is_indefinite ? null : (form.end_date || null),
        is_indefinite: form.is_indefinite,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (block) {
        const { error } = await supabase.from('vehicle_blocks').update(payload).eq('id', block.id)
        if (error) throw error
        toast.success('Período atualizado!')
      } else {
        const { error } = await supabase.from('vehicle_blocks').insert(payload)
        if (error) throw error
        toast.success('Período adicionado!')
      }
      onSave()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-navy-200/80 border border-white/10 rounded-xl p-4 space-y-3">
      <h4 className="text-white font-semibold text-sm">{block ? 'Editar período' : 'Adicionar período de indisponibilidade'}</h4>
      <Input label="Título *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Contrato - Fulano, Manutenção preventiva" />
      <Select
        label="Tipo"
        value={form.block_type}
        onChange={(e) => set('block_type', e.target.value)}
        options={Object.entries(BLOCK_LABELS).map(([v, l]) => ({ value: v, label: l }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data início *" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
        <Input
          label="Data término"
          type="date"
          value={form.end_date ?? ''}
          onChange={(e) => set('end_date', e.target.value)}
          disabled={form.is_indefinite}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
        <input
          type="checkbox"
          checked={form.is_indefinite}
          onChange={(e) => { set('is_indefinite', e.target.checked); if (e.target.checked) set('end_date', '') }}
          className="w-4 h-4 accent-yellow-400 rounded"
        />
        Sem prazo definido (manutenção indefinida)
      </label>
      <Textarea label="Observações" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Detalhes opcionais..." />
      <div className="flex gap-2">
        <Button variant="navy" size="sm" fullWidth onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button variant="gold" size="sm" fullWidth onClick={handleSave} loading={saving}>Salvar</Button>
      </div>
    </div>
  )
}

export default function VehicleCalendar({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const supabase = createClient()
  const [blocks, setBlocks] = useState<VehicleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<VehicleBlock | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadBlocks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vehicle_blocks')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('start_date', { ascending: true })
    setBlocks((data ?? []) as VehicleBlock[])
    setLoading(false)
  }

  useEffect(() => { loadBlocks() }, [vehicle.id])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este período bloqueado?')) return
    setDeletingId(id)
    const { error } = await supabase.from('vehicle_blocks').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir período: ' + error.message); setDeletingId(null); return }
    toast.success('Período removido.')
    setDeletingId(null)
    loadBlocks()
  }

  const calendarBlocks = blocks.map((b) => ({
    id: b.id,
    start_date: b.start_date,
    end_date: b.end_date,
    is_indefinite: b.is_indefinite,
    block_type: b.block_type,
    title: b.title,
    notes: b.notes,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-gold" />
            <h2 className="font-heading font-bold text-white">{vehicle.name}</h2>
            <span className="text-gray-500 text-sm">— Disponibilidade</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Calendar */}
          <div className="glass-dark rounded-xl p-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              </div>
            ) : (
              <MonthCalendar blocks={calendarBlocks} />
            )}
          </div>

          {/* Add block button */}
          {!showForm && !editingBlock && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setShowForm(true)}
              fullWidth
            >
              Adicionar período de indisponibilidade
            </Button>
          )}

          {/* Add form */}
          {showForm && (
            <BlockForm
              vehicleId={vehicle.id}
              onSave={() => { setShowForm(false); loadBlocks() }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Edit form */}
          {editingBlock && (
            <BlockForm
              vehicleId={vehicle.id}
              block={editingBlock}
              onSave={() => { setEditingBlock(null); loadBlocks() }}
              onCancel={() => setEditingBlock(null)}
            />
          )}

          {/* Block list */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Períodos cadastrados ({blocks.length})
            </h3>
            {blocks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Nenhum período cadastrado. O veículo está disponível em todas as datas.</p>
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => {
                  const dotColor =
                    b.block_type === 'reserva' ? 'bg-blue-400' :
                    b.block_type === 'contrato_privado' ? 'bg-purple-400' :
                    b.block_type === 'manutencao' ? 'bg-amber-400' : 'bg-gray-400'
                  return (
                    <div key={b.id} className="flex items-start justify-between gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{b.title}</p>
                          <p className="text-gray-400 text-xs">
                            {b.start_date} {b.is_indefinite ? '→ sem prazo definido' : b.end_date ? `→ ${b.end_date}` : '(1 dia)'}
                          </p>
                          {b.notes && <p className="text-gray-500 text-xs truncate">{b.notes}</p>}
                          <span className="text-xs text-gray-600">{BLOCK_LABELS[b.block_type as BlockType]}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingBlock(b); setShowForm(false) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
