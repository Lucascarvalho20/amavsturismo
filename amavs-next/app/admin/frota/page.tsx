'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Bus, Upload, X, Image as ImageIcon } from 'lucide-react'
import type { Vehicle, VehicleCategory } from '@/lib/types'
import { cn, categoryLabel, formatCurrency } from '@/lib/utils'
import { VehicleStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'

const CATEGORY_TABS: { label: string; value: 'all' | VehicleCategory }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Ônibus', value: 'onibus' },
  { label: 'Micro-ônibus', value: 'micro' },
  { label: 'Vans', value: 'van' },
]

// ── Photo Gallery Component ────────────────────────────────────────────────
function PhotoGallery({
  vehicleId,
  existingPhotos = [],
  onPhotosChange,
}: {
  vehicleId?: string
  existingPhotos?: string[]
  onPhotosChange: (urls: string[]) => void
}) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} é muito grande (máx 5MB)`); continue }
        const ext  = file.name.split('.').pop()
        const path = `vehicles/${vehicleId ?? Date.now()}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('vehicles').upload(path, file, { upsert: true })
        if (error) { toast.error(`Erro ao enviar ${file.name}`); continue }
        const { data: { publicUrl } } = supabase.storage.from('vehicles').getPublicUrl(path)
        uploaded.push(publicUrl)
      }
      const newPhotos = [...photos, ...uploaded]
      setPhotos(newPhotos)
      onPhotosChange(newPhotos)
      if (uploaded.length > 0) toast.success(`${uploaded.length} foto(s) enviada(s)!`)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) => {
    const updated = photos.filter((p) => p !== url)
    setPhotos(updated)
    onPhotosChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Fotos do Veículo
        <span className="text-gray-500 font-normal ml-1">({photos.length} foto{photos.length !== 1 ? 's' : ''})</span>
      </label>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((url, i) => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[10px] bg-gold text-black font-bold px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              <button
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-wine/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <label className="block">
        <div className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-gold/30 transition-colors cursor-pointer bg-navy-200/50">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-gold">
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Enviando...</span>
            </div>
          ) : (
            <>
              <Upload size={22} className="text-gray-500 mx-auto mb-1.5" />
              <p className="text-gray-400 text-sm">Clique para adicionar fotos</p>
              <p className="text-gray-600 text-xs mt-0.5">JPG, PNG, WEBP · Máx 5MB cada · Múltiplas seleções permitidas</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          disabled={uploading}
        />
      </label>

      {photos.length > 0 && (
        <p className="text-xs text-gray-500 mt-1.5">
          A primeira foto é exibida como principal no site. Arraste para reordenar (em breve).
        </p>
      )}
    </div>
  )
}

// ── Vehicle Modal ──────────────────────────────────────────────────────────
function VehicleModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle?: Vehicle
  onClose: () => void
  onSave: () => void
}) {
  const isNew = !vehicle
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState<string[]>(vehicle?.images?.length ? vehicle.images : vehicle?.photo_url ? [vehicle.photo_url] : [])

  const [form, setForm] = useState({
    name:        vehicle?.name ?? '',
    model:       vehicle?.model ?? '',
    category:    vehicle?.category ?? 'onibus',
    capacity:    vehicle?.capacity ?? 46,
    year:        vehicle?.year ?? new Date().getFullYear(),
    plate:       vehicle?.plate ?? '',
    km:          vehicle?.km ?? 0,
    price_km:    vehicle?.price_km ?? 0,
    price_day:   vehicle?.price_day ?? 0,
    status:      vehicle?.status ?? 'disponivel',
    next_service:vehicle?.next_service ?? '',
    features:    vehicle?.features.join(', ') ?? '',
    description: vehicle?.description ?? '',
  })

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.plate) { toast.error('Nome e placa são obrigatórios.'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        capacity:  Number(form.capacity),
        year:      Number(form.year),
        km:        Number(form.km),
        price_km:  Number(form.price_km),
        price_day: Number(form.price_day),
        features:  form.features.split(',').map((f) => f.trim()).filter(Boolean),
        images: photos,
        photo_url: photos[0] ?? null,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        await supabase.from('vehicles').insert({ ...data, created_at: new Date().toISOString() })
        toast.success('Veículo adicionado!')
      } else {
        await supabase.from('vehicles').update(data).eq('id', vehicle.id)
        toast.success('Veículo atualizado!')
      }
      onSave()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-white">{isNew ? 'Adicionar Veículo' : `Editar — ${vehicle.name}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Photos */}
          <PhotoGallery vehicleId={vehicle?.id} existingPhotos={photos} onPhotosChange={setPhotos} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Ônibus Executivo Gold" required />
            <Input label="Modelo *" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Ex: Mercedes-Benz O-500" required />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Select label="Categoria *" value={form.category} onChange={(e) => set('category', e.target.value)} options={[{ value: 'onibus', label: 'Ônibus' }, { value: 'micro', label: 'Micro-ônibus' }, { value: 'van', label: 'Van' }]} />
            <Input label="Capacidade (pax)" type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} min={1} max={60} />
            <Input label="Ano" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Placa *" value={form.plate} onChange={(e) => set('plate', e.target.value)} placeholder="ABC-1A23" required />
            <Input label="KM atual" type="number" value={form.km} onChange={(e) => set('km', e.target.value)} min={0} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço/km (R$)" type="number" step="0.01" value={form.price_km} onChange={(e) => set('price_km', e.target.value)} />
            <Input label="Diária (R$)" type="number" step="0.01" value={form.price_day} onChange={(e) => set('price_day', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)} options={[{ value: 'disponivel', label: 'Disponível' }, { value: 'em_uso', label: 'Em Uso' }, { value: 'manutencao', label: 'Em Manutenção' }]} />
            <Input label="Próxima revisão" type="date" value={form.next_service} onChange={(e) => set('next_service', e.target.value)} />
          </div>
          <Input label="Diferenciais (separados por vírgula)" value={form.features} onChange={(e) => set('features', e.target.value)} placeholder="Wi-Fi, Ar condicionado, Poltronas reclináveis..." />
          <Textarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Descreva o veículo para os clientes..." />

          <div className="flex gap-3 pt-2">
            <Button variant="navy" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button variant="gold" className="flex-1" loading={saving} onClick={handleSave}>
              {isNew ? 'Adicionar veículo' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FrotaAdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | VehicleCategory>('all')
  const [modal, setModal]       = useState<Vehicle | 'new' | null>(null)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
      setVehicles((data ?? []) as Vehicle[])
    } catch { setVehicles([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    toast.success('Veículo excluído.')
    load()
  }

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch = !q || v.name.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q)
    return matchSearch && (activeCategory === 'all' || v.category === activeCategory)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Gestão de Frota</h1>
          <p className="text-gray-400 text-sm mt-0.5">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} cadastrado{vehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="gold" leftIcon={<Plus size={16} />} onClick={() => setModal('new')}>
          Adicionar Veículo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, modelo ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-100 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
          />
        </div>
        <div className="flex gap-1 p-1 bg-navy-100 border border-white/10 rounded-xl">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', activeCategory === tab.value ? 'bg-gold text-navy-200 font-semibold' : 'text-gray-400 hover:text-white')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-dark rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando frota...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-dark rounded-2xl p-14 text-center">
          <Bus size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{vehicles.length === 0 ? 'Nenhum veículo cadastrado ainda' : 'Nenhum veículo encontrado'}</p>
          {vehicles.length === 0 && (
            <Button variant="gold" size="sm" className="mt-4" onClick={() => setModal('new')} leftIcon={<Plus size={14} />}>
              Adicionar primeiro veículo
            </Button>
          )}
        </div>
      ) : (
        <div className="glass-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Veículo', 'Categoria', 'Capacidade', 'Preço/km', 'Diária', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={v.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 && 'bg-white/[0.01]')}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {v.photo_url ? (
                          <img src={v.photo_url} alt={v.name} className="w-10 h-7 rounded object-cover border border-white/10 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={12} className="text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{v.name}</p>
                          <p className="text-gray-500 text-xs">{v.model} · {v.plate} · {v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="badge-gold">{categoryLabel(v.category)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 hidden sm:table-cell">{v.capacity} pax</td>
                    <td className="px-5 py-3.5 text-gold font-semibold hidden lg:table-cell">{formatCurrency(v.price_km)}/km</td>
                    <td className="px-5 py-3.5 text-gray-300 hidden lg:table-cell">{formatCurrency(v.price_day)}</td>
                    <td className="px-5 py-3.5"><VehicleStatusBadge status={v.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal(v)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all" title="Editar"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10 transition-all" title="Excluir"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <VehicleModal
          vehicle={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
