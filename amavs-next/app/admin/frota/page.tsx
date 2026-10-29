'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Bus, Upload, X, Image as ImageIcon, CalendarDays, Wrench, QrCode, Download, Copy, AlertTriangle, Lock } from 'lucide-react'
import type { Vehicle, VehicleCategory } from '@/lib/types'
import { cn, categoryLabel, formatCurrency, validateFileType } from '@/lib/utils'
import { VehicleStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'
import VehicleCalendar from './VehicleCalendar'
import VehicleMaintenance from './VehicleMaintenance'
import QRCode from 'react-qr-code'

// Converte texto para slug URL-safe
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const CATEGORY_TABS: { label: string; value: 'all' | VehicleCategory }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Ônibus', value: 'onibus' },
  { label: 'Micro-ônibus', value: 'micro' },
  { label: 'Vans', value: 'van' },
]

function QRCodeModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const qrRef = useRef<HTMLDivElement>(null)
  // Sempre usa o domínio oficial — é o que vai para o QR Code impresso
  const DEFAULT_DOMAIN = 'https://www.amavsturismo.com'
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const [domain, setDomain] = useState(
    envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
      ? envUrl
      : DEFAULT_DOMAIN
  )
  const qrUrl = `${domain}/frota/${vehicle.slug}`

  const downloadPNG = () => {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return
    const size = 600
    const padding = 40
    const total = size + padding * 2
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    canvas.width = total
    canvas.height = total
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, total, total)
      ctx.drawImage(img, padding, padding, size, size)
      const a = document.createElement('a')
      a.download = `qrcode-${vehicle.slug}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
      URL.revokeObjectURL(img.src)
    }
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    img.src = URL.createObjectURL(blob)
  }

  const downloadSVG = () => {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.download = `qrcode-${vehicle.slug}.svg`
    a.href = URL.createObjectURL(blob)
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl)
    toast.success('URL copiada!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-navy-100 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-bold text-white">QR Code</h2>
            <p className="text-gray-400 text-xs mt-0.5">{vehicle.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={qrRef} className="flex justify-center bg-white rounded-xl p-5 mb-4">
          <QRCode
            value={qrUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>

        <div className="bg-navy-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-xs text-gray-300 font-mono break-all flex-1">{qrUrl}</span>
          <button onClick={copyUrl} className="text-gray-400 hover:text-gold flex-shrink-0 transition-colors" title="Copiar URL">
            <Copy size={14} />
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Domínio do QR Code</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.replace(/\/$/, ''))}
            className="w-full bg-navy-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
          />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-4 flex gap-2">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 space-y-1">
            <p><strong>Use sempre o domínio oficial</strong> (www.amavsturismo.com) para QR Codes que serão impressos.</p>
            <p>Após colar no ônibus, o slug <code className="bg-amber-500/10 px-1 rounded">{vehicle.slug}</code> não pode ser alterado.</p>
          </div>
        </div>

        <div className="bg-navy-200/50 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
          <Lock size={12} className="text-gray-500 flex-shrink-0" />
          <p className="text-xs text-gray-500">Identificador permanente: <span className="text-gray-300 font-mono">{vehicle.slug}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="navy" size="sm" onClick={downloadSVG} leftIcon={<Download size={14} />}>
            SVG (vetorial)
          </Button>
          <Button variant="gold" size="sm" onClick={downloadPNG} leftIcon={<Download size={14} />}>
            PNG (impressão)
          </Button>
        </div>
      </div>
    </div>
  )
}

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
        const mime = validateFileType(file, 'images')
        if (!mime.ok) { toast.error(`${file.name}: ${mime.error}`); continue }
        const ext  = file.name.split('.').pop()?.toLowerCase()
        // nome aleatório: dois arquivos no mesmo milissegundo não se sobrescrevem
        const path = `vehicles/${vehicleId ?? 'novo'}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from('vehicles').upload(path, file)
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

  const makeMain = (url: string) => {
    const updated = [url, ...photos.filter((p) => p !== url)]
    setPhotos(updated)
    onPhotosChange(updated)
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
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(url)}
                  className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-black"
                  title="Usar como foto principal no site"
                >
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-md text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-wine/80"
                title="Remover foto"
                aria-label="Remover foto"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

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
          A foto marcada como <strong className="text-gray-300">Principal</strong> aparece nos cards e no topo da página do veículo.
          Passe o mouse sobre outra foto e clique em “Tornar principal” para trocar. As alterações só valem depois de clicar em Salvar.
        </p>
      )}
    </div>
  )
}

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
    slug:        vehicle?.slug ?? '',
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

  // Auto-gera slug a partir do nome apenas para veículos novos enquanto o slug não foi personalizado
  const [slugTouched, setSlugTouched] = useState(!!vehicle?.slug)
  useEffect(() => {
    if (isNew && !slugTouched && form.name) {
      setForm((p) => ({ ...p, slug: toSlug(p.name) }))
    }
  }, [form.name, isNew, slugTouched])

  const handleSave = async () => {
    if (!form.name || !form.plate) { toast.error('Nome e placa são obrigatórios.'); return }
    if (!form.slug) { toast.error('O slug (URL permanente) é obrigatório.'); return }
    if (!/^[a-z0-9-]+$/.test(form.slug)) { toast.error('Slug deve conter apenas letras minúsculas, números e hífens.'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        slug:      form.slug.toLowerCase(),
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
        const { error: insertErr } = await supabase.from('vehicles').insert({ ...data, created_at: new Date().toISOString() })
        if (insertErr) throw insertErr
        toast.success('Veículo adicionado!')
      } else {
        const { error: updateErr } = await supabase.from('vehicles').update(data).eq('id', vehicle.id)
        if (updateErr) throw updateErr
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
          <PhotoGallery vehicleId={vehicle?.id} existingPhotos={photos} onPhotosChange={setPhotos} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Ônibus Executivo Gold" required />
            <Input label="Modelo *" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Ex: Mercedes-Benz O-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Slug — URL permanente *
              {!isNew && <span className="ml-2 text-xs text-amber-400 font-normal inline-flex items-center gap-1"><Lock size={11} />Não altere após imprimir o QR Code</span>}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-mono whitespace-nowrap">/frota/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')) }}
                placeholder="onibus-executivo-gold"
                className="flex-1 bg-navy-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                required
              />
            </div>
            {isNew ? (
              <p className="text-xs text-gray-500 mt-1">Auto-gerado pelo nome. Você pode personalizar. Defina antes de imprimir o QR Code — não altere depois.</p>
            ) : (
              <p className="text-xs text-amber-500/80 mt-1 flex items-center gap-1">
                <AlertTriangle size={11} />
                Este slug está ou estará nos QR Codes colados no veículo. Alterar quebra todos os QR Codes impressos.
              </p>
            )}
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

export default function FrotaAdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | VehicleCategory>('all')
  const [modal, setModal]       = useState<Vehicle | 'new' | null>(null)
  const [calendarVehicle, setCalendarVehicle] = useState<Vehicle | null>(null)
  const [maintenanceVehicle, setMaintenanceVehicle] = useState<Vehicle | null>(null)
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null)
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
    if (!confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir veículo: ' + error.message); return }
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
                        <button
                          onClick={() => setQrVehicle(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="Gerar QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => setMaintenanceVehicle(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Manutenções"
                        >
                          <Wrench size={14} />
                        </button>
                        <button
                          onClick={() => setCalendarVehicle(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Calendário de disponibilidade"
                        >
                          <CalendarDays size={14} />
                        </button>
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
      {calendarVehicle && (
        <VehicleCalendar vehicle={calendarVehicle} onClose={() => setCalendarVehicle(null)} />
      )}
      {maintenanceVehicle && (
        <VehicleMaintenance vehicle={maintenanceVehicle} onClose={() => setMaintenanceVehicle(null)} />
      )}
      {qrVehicle && (
        <QRCodeModal vehicle={qrVehicle} onClose={() => setQrVehicle(null)} />
      )}
    </div>
  )
}
