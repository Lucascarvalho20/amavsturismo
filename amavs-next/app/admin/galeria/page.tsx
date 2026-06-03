'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Upload, X, Eye, EyeOff, Play, Link2, Pencil, GripVertical, Images } from 'lucide-react'
import { cn, validateFileType } from '@/lib/utils'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'
import type { TripGallery } from '@/lib/types'

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getVideoThumbnail(item: TripGallery): string {
  if (item.thumbnail_url) return item.thumbnail_url
  const ytId = getYouTubeId(item.url)
  return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''
}

// ── Add/Edit Modal ────────────────────────────────────────────────────────────
function ItemModal({
  item,
  onClose,
  onSave,
}: {
  item?: TripGallery
  onClose: () => void
  onSave: () => void
}) {
  const isNew = !item
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'photo' | 'video'>(item?.media_type ?? 'photo')
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(item?.media_type === 'photo' ? item.url : '')
  const [videoUrl, setVideoUrl] = useState(item?.media_type === 'video' ? item.url : '')
  const [form, setForm] = useState({
    caption: item?.caption ?? '',
    location: item?.location ?? '',
    trip_date: item?.trip_date ?? '',
    display_order: item?.display_order ?? 0,
  })

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} muito grande (máx 10MB)`); continue }
        const mime = validateFileType(file, 'images')
        if (!mime.ok) { toast.error(mime.error ?? 'Arquivo inválido'); continue }
        const ext = file.name.split('.').pop()
        const path = `trips/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('trip-media').upload(path, file, { upsert: false })
        if (error) { toast.error('Erro ao enviar foto: ' + error.message); continue }
        const { data: { publicUrl } } = supabase.storage.from('trip-media').getPublicUrl(path)
        setPhotoUrl(publicUrl)
        toast.success('Foto enviada!')
        break // one photo per item
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    const url = tab === 'photo' ? photoUrl.trim() : videoUrl.trim()
    if (!url) { toast.error(tab === 'photo' ? 'Envie uma foto primeiro.' : 'Informe o link do vídeo.'); return }
    if (tab === 'video') {
      const ytId = getYouTubeId(url)
      const isInstagram = url.includes('instagram.com')
      if (!ytId && !isInstagram) { toast.error('Use um link do YouTube ou Instagram.'); return }
    }

    setSaving(true)
    try {
      const payload = {
        media_type: tab,
        url,
        caption: form.caption || null,
        location: form.location || null,
        trip_date: form.trip_date || null,
        display_order: Number(form.display_order),
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { error } = await supabase.from('trip_gallery').insert({ ...payload, is_active: true, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Item adicionado à galeria!')
      } else {
        const { error } = await supabase.from('trip_gallery').update(payload).eq('id', item.id)
        if (error) throw error
        toast.success('Item atualizado!')
      }
      onSave()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const videoThumb = tab === 'video' && videoUrl ? (() => {
    const ytId = getYouTubeId(videoUrl)
    return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''
  })() : ''

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-navy-100 border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-navy-100 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-white">
            {isNew ? 'Adicionar à galeria' : 'Editar item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type tabs — only for new items */}
          {isNew && (
            <div className="flex gap-1 p-1 bg-navy-200 rounded-xl border border-white/5">
              <button
                onClick={() => setTab('photo')}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                  tab === 'photo' ? 'bg-gold text-navy-200' : 'text-gray-400 hover:text-white')}
              >
                <Images size={15} /> Foto
              </button>
              <button
                onClick={() => setTab('video')}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                  tab === 'video' ? 'bg-gold text-navy-200' : 'text-gray-400 hover:text-white')}
              >
                <Play size={15} /> Vídeo
              </button>
            </div>
          )}

          {/* Photo upload */}
          {tab === 'photo' && (
            <div>
              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-wine/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-gold/30 transition-colors bg-navy-200/50">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 text-gold">
                        <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Enviando...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Clique para enviar uma foto</p>
                        <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP · Máx 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          )}

          {/* Video URL */}
          {tab === 'video' && (
            <div className="space-y-3">
              <Input
                label="Link do YouTube ou Instagram"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                leftIcon={<Link2 size={15} className="text-gray-500" />}
              />
              {videoThumb && (
                <div className="relative rounded-xl overflow-hidden aspect-video">
                  <img src={videoThumb} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-black/50 border-2 border-white/40 flex items-center justify-center">
                      <Play size={18} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
              {videoUrl && !videoThumb && (
                <p className="text-xs text-amber-400">
                  Link de Instagram detectado — a thumbnail não é gerada automaticamente mas o vídeo será exibido corretamente.
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <Textarea
            label="Legenda (opcional)"
            value={form.caption}
            onChange={(e) => set('caption', e.target.value)}
            rows={2}
            placeholder="Ex: Excursão para Bonito — 42 passageiros"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Destino (opcional)"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Ex: Bonito - MS"
            />
            <Input
              label="Data da viagem"
              type="date"
              value={form.trip_date}
              onChange={(e) => set('trip_date', e.target.value)}
            />
          </div>
          <Input
            label="Ordem de exibição"
            type="number"
            value={form.display_order}
            onChange={(e) => set('display_order', e.target.value)}
            min={0}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="navy" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button variant="gold" className="flex-1" loading={saving} onClick={handleSave}>
              {isNew ? 'Adicionar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GaleriaAdminPage() {
  const [items, setItems] = useState<TripGallery[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<TripGallery | 'new' | null>(null)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('trip_gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      setItems((data ?? []) as TripGallery[])
    } catch { setItems([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (item: TripGallery) => {
    const { error } = await supabase
      .from('trip_gallery')
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) { toast.error('Erro ao atualizar.'); return }
    toast.success(item.is_active ? 'Ocultado do site' : 'Visível no site')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item da galeria? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('trip_gallery').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir: ' + error.message); return }
    toast.success('Item excluído.')
    load()
  }

  const activeCount = items.filter((i) => i.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Galeria de Viagens</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} cadastrado{items.length !== 1 ? 's' : ''} · {activeCount} visível{activeCount !== 1 ? 'is' : ''} no site
          </p>
        </div>
        <Button variant="gold" leftIcon={<Plus size={16} />} onClick={() => setModal('new')}>
          Adicionar item
        </Button>
      </div>

      {/* Info box */}
      <div className="glass-dark rounded-xl p-4 border border-white/5 text-sm text-gray-400">
        <p>
          <span className="text-gold font-medium">Dica:</span> Fotos enviadas ficam salvas no Supabase Storage (bucket <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">trip-media</code>).
          Para vídeos, cole o link do YouTube ou Instagram. A seção de galeria aparece automaticamente na home quando há pelo menos 1 item ativo.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="glass-dark rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando galeria...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-dark rounded-2xl p-14 text-center">
          <Images size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nenhum item na galeria ainda</p>
          <p className="text-gray-600 text-sm mt-1 mb-5">Adicione fotos ou vídeos das suas viagens para exibir na home do site</p>
          <Button variant="gold" size="sm" onClick={() => setModal('new')} leftIcon={<Plus size={14} />}>
            Adicionar primeira mídia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const thumb = item.media_type === 'photo' ? item.url : getVideoThumbnail(item)
            return (
              <div
                key={item.id}
                className={cn(
                  'group relative rounded-2xl overflow-hidden border transition-all duration-200',
                  item.is_active
                    ? 'border-white/10 hover:border-gold/30'
                    : 'border-white/5 opacity-50 hover:opacity-70'
                )}
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] relative">
                  {thumb ? (
                    <img src={thumb} alt={item.caption ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-navy-100 flex items-center justify-center">
                      <Images size={24} className="text-gray-600" />
                    </div>
                  )}

                  {/* Video badge */}
                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center">
                        <Play size={14} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Inactive badge */}
                  {!item.is_active && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-gray-400 font-medium">
                        Oculto
                      </span>
                    </div>
                  )}

                  {/* Order badge */}
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                      <GripVertical size={10} className="text-gray-400" />
                      <span className="text-[10px] text-gray-300">{item.display_order}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-navy-100 border-t border-white/5">
                  {item.caption ? (
                    <p className="text-white text-xs font-medium truncate">{item.caption}</p>
                  ) : (
                    <p className="text-gray-600 text-xs italic">Sem legenda</p>
                  )}
                  {item.location && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{item.location}</p>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute bottom-10 inset-x-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setModal(item)}
                    className="p-2 rounded-lg bg-navy-100/90 border border-white/10 text-gray-300 hover:text-gold hover:border-gold/30 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    className="p-2 rounded-lg bg-navy-100/90 border border-white/10 text-gray-300 hover:text-blue-400 hover:border-blue-400/30 transition-colors"
                    title={item.is_active ? 'Ocultar do site' : 'Exibir no site'}
                  >
                    {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-navy-100/90 border border-white/10 text-gray-300 hover:text-red-400 hover:border-wine/30 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ItemModal
          item={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
