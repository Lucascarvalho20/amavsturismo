'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Building2, Image as ImageIcon, Save, Plus, Trash2, Upload, X, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

type Tab = 'stats' | 'clients' | 'hero'

interface SiteStat {
  id: string
  key: string
  label: string
  sub: string
  value_override: number | null
  display_order: number
  is_active: boolean
  format: 'number' | 'currency' | 'percent'
}

interface FeaturedClient {
  id: string
  name: string
  acronym: string | null
  logo_url: string | null
  display_order: number
  is_active: boolean
}

interface HeroImage {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  display_order: number
  is_active: boolean
}

const STAT_KEYS: { value: string; label: string }[] = [
  { value: 'fleet_size',         label: 'Veículos na frota' },
  { value: 'total_capacity',     label: 'Lugares disponíveis' },
  { value: 'vehicles_available', label: 'Disponíveis hoje' },
  { value: 'active_contracts',   label: 'Contratos ativos' },
  { value: 'trips_year',         label: 'Viagens este ano' },
  { value: 'trips_month',        label: 'Viagens este mês' },
  { value: 'years_experience',   label: 'Anos de experiência' },
]

export default function PersonalizarPage() {
  const [tab, setTab] = useState<Tab>('stats')

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading font-black text-3xl text-white mb-1">Personalizar Site</h1>
        <p className="text-gray-400 text-sm">
          Edite os números, clientes em destaque e imagens do hero exibidos na landing page.
        </p>
      </header>

      <div className="flex items-center gap-1 mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'stats' as Tab, label: 'Números do site', icon: BarChart3 },
          { id: 'clients' as Tab, label: 'Clientes em destaque', icon: Building2 },
          { id: 'hero' as Tab, label: 'Imagens do hero', icon: ImageIcon },
        ].map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                active ? 'border-gold text-gold' : 'border-transparent hover:opacity-70',
              )}
              style={!active ? { color: 'var(--text-muted)' } : undefined}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'stats' && <StatsTab />}
      {tab === 'clients' && <ClientsTab />}
      {tab === 'hero' && <HeroTab />}
    </div>
  )
}

function StatsTab() {
  const supabase = createClient()
  const [rows, setRows] = useState<SiteStat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) {
      toast.error('Erro ao carregar números')
    } else {
      setRows((data as SiteStat[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: string, patch: Partial<SiteStat>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const save = async (row: SiteStat) => {
    setSaving(row.id)
    const { error } = await supabase
      .from('site_stats')
      .update({
        label: row.label,
        sub: row.sub,
        value_override: row.value_override,
        display_order: row.display_order,
        is_active: row.is_active,
        format: row.format,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
    setSaving(null)
    if (error) toast.error('Erro ao salvar')
    else toast.success('Salvo!')
  }

  const add = async () => {
    const usedKeys = new Set(rows.map((r) => r.key))
    const next = STAT_KEYS.find((k) => !usedKeys.has(k.value))
    if (!next) {
      toast.error('Todos os tipos de número já estão cadastrados')
      return
    }
    const { data, error } = await supabase
      .from('site_stats')
      .insert({
        key: next.value,
        label: next.label,
        sub: '',
        display_order: rows.length + 1,
        is_active: true,
        format: 'number',
      })
      .select()
      .single()
    if (error || !data) toast.error('Erro ao criar')
    else {
      setRows((rs) => [...rs, data as SiteStat])
      toast.success('Adicionado')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Remover este número da landing?')) return
    const { error } = await supabase.from('site_stats').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else {
      setRows((rs) => rs.filter((r) => r.id !== id))
      toast.success('Removido')
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Deixe <strong>Valor manual</strong> em branco para o sistema calcular automaticamente do banco. Preencha apenas se quiser substituir o cálculo.
        </p>
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_120px_120px_auto] gap-3 items-start"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Tipo
            </label>
            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{row.key}</div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Rótulo
            </label>
            <input
              value={row.label}
              onChange={(e) => update(row.id, { label: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Descrição
            </label>
            <input
              value={row.sub}
              onChange={(e) => update(row.id, { sub: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Valor manual
            </label>
            <input
              type="number"
              placeholder="auto"
              value={row.value_override ?? ''}
              onChange={(e) =>
                update(row.id, {
                  value_override: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Ordem
            </label>
            <input
              type="number"
              value={row.display_order}
              onChange={(e) => update(row.id, { display_order: Number(e.target.value) })}
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex flex-col gap-2 pt-5">
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={row.is_active}
                onChange={(e) => update(row.id, { is_active: e.target.checked })}
              />
              <span style={{ color: 'var(--text-muted)' }}>Ativo</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => save(row)}
                disabled={saving === row.id}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                <Save size={12} /> {saving === row.id ? 'Salvando' : 'Salvar'}
              </button>
              <button
                onClick={() => remove(row.id)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: '#dc2626' }}
                title="Remover"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Nenhum número cadastrado. Clique em "Adicionar".</p>
      )}
    </div>
  )
}

function ClientsTab() {
  const supabase = createClient()
  const [rows, setRows] = useState<FeaturedClient[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('featured_clients')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) toast.error('Erro ao carregar clientes')
    else setRows((data as FeaturedClient[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: string, patch: Partial<FeaturedClient>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const save = async (row: FeaturedClient) => {
    setSaving(row.id)
    const { error } = await supabase
      .from('featured_clients')
      .update({
        name: row.name,
        acronym: row.acronym,
        logo_url: row.logo_url,
        display_order: row.display_order,
        is_active: row.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
    setSaving(null)
    if (error) toast.error('Erro ao salvar')
    else toast.success('Salvo')
  }

  const add = async () => {
    const { data, error } = await supabase
      .from('featured_clients')
      .insert({ name: 'Novo cliente', display_order: rows.length + 1, is_active: true })
      .select()
      .single()
    if (error || !data) toast.error('Erro ao criar')
    else setRows((rs) => [...rs, data as FeaturedClient])
  }

  const remove = async (id: string) => {
    if (!confirm('Remover este cliente?')) return
    const { error } = await supabase.from('featured_clients').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else setRows((rs) => rs.filter((r) => r.id !== id))
  }

  const uploadLogo = async (id: string, file: File) => {
    setUploading(id)
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo muito grande (máx 5MB)')
        return
      }
      const ext = file.name.split('.').pop()
      const path = `clients/${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
      if (upErr) {
        toast.error('Erro ao enviar')
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
      const { error } = await supabase.from('featured_clients').update({ logo_url: publicUrl }).eq('id', id)
      if (error) toast.error('Erro ao salvar URL')
      else {
        update(id, { logo_url: publicUrl })
        toast.success('Logo enviado')
      }
    } finally {
      setUploading(null)
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Apenas clientes <strong>ativos</strong> aparecem na home. Use sigla (ex: "MEC") quando não tiver logo.
        </p>
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Plus size={14} /> Adicionar cliente
        </button>
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[120px_1fr_120px_100px_auto] gap-4 items-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="aspect-[3/2] rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {row.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.logo_url} alt={row.name} className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Sem logo</span>
            )}
            <label
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadLogo(row.id, f)
                }}
              />
              <Upload size={16} className="text-white" />
            </label>
            {uploading === row.id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
                Enviando...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              placeholder="Nome do cliente"
              value={row.name}
              onChange={(e) => update(row.id, { name: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-sm font-medium"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
            <input
              placeholder="Sigla (opcional, ex: MEC)"
              value={row.acronym ?? ''}
              onChange={(e) => update(row.id, { acronym: e.target.value || null })}
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
              Ordem
            </label>
            <input
              type="number"
              value={row.display_order}
              onChange={(e) => update(row.id, { display_order: Number(e.target.value) })}
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={row.is_active}
              onChange={(e) => update(row.id, { is_active: e.target.checked })}
            />
            <span style={{ color: 'var(--text-muted)' }}>Ativo</span>
          </label>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => save(row)}
              disabled={saving === row.id}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
              style={{ background: 'var(--gold)', color: '#fff' }}
            >
              <Save size={12} /> {saving === row.id ? 'Salvando' : 'Salvar'}
            </button>
            <button
              onClick={() => remove(row.id)}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: '#dc2626' }}
            >
              <Trash2 size={12} /> Remover
            </button>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Nenhum cliente cadastrado. Clique em "Adicionar cliente".</p>
      )}
    </div>
  )
}

function HeroTab() {
  const supabase = createClient()
  const [rows, setRows] = useState<HeroImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) toast.error('Erro ao carregar imagens')
    else setRows((data as HeroImage[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: string, patch: Partial<HeroImage>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} muito grande (máx 5MB)`)
          continue
        }
        const ext = file.name.split('.').pop()
        const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
        const { error: upErr } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
        if (upErr) {
          toast.error(`Erro ao enviar ${file.name}`)
          continue
        }
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
        const { data, error } = await supabase
          .from('hero_images')
          .insert({
            image_url: publicUrl,
            display_order: rows.length + 1,
            is_active: true,
          })
          .select()
          .single()
        if (error || !data) {
          toast.error('Erro ao registrar')
          continue
        }
        setRows((rs) => [...rs, data as HeroImage])
      }
      toast.success('Imagens enviadas')
    } finally {
      setUploading(false)
    }
  }

  const save = async (row: HeroImage) => {
    setSaving(row.id)
    const { error } = await supabase
      .from('hero_images')
      .update({
        title: row.title,
        subtitle: row.subtitle,
        display_order: row.display_order,
        is_active: row.is_active,
      })
      .eq('id', row.id)
    setSaving(null)
    if (error) toast.error('Erro ao salvar')
    else toast.success('Salvo')
  }

  const remove = async (id: string) => {
    if (!confirm('Remover esta imagem?')) return
    const { error } = await supabase.from('hero_images').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else setRows((rs) => rs.filter((r) => r.id !== id))
  }

  const moveOrder = (id: string, dir: -1 | 1) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    update(id, { display_order: row.display_order + dir })
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          As imagens ativas rodam no carrossel do hero. Se nenhuma estiver cadastrada, o site usa fotos de veículos cadastrados.
        </p>
        <label
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium cursor-pointer"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <Upload size={14} />
          {uploading ? 'Enviando...' : 'Enviar imagens'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="relative aspect-[16/9] overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <img src={row.image_url} alt={row.title ?? 'Hero'} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(row.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  onClick={() => moveOrder(row.id, -1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveOrder(row.id, 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <input
                placeholder="Título (opcional)"
                value={row.title ?? ''}
                onChange={(e) => update(row.id, { title: e.target.value || null })}
                className="w-full h-9 px-3 rounded-lg text-sm"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
              />
              <input
                placeholder="Legenda (opcional)"
                value={row.subtitle ?? ''}
                onChange={(e) => update(row.id, { subtitle: e.target.value || null })}
                className="w-full h-9 px-3 rounded-lg text-sm"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text)' }}
              />
              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(e) => update(row.id, { is_active: e.target.checked })}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>Ativo</span>
                </label>
                <button
                  onClick={() => save(row)}
                  disabled={saving === row.id}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--gold)', color: '#fff' }}
                >
                  <Save size={12} /> {saving === row.id ? 'Salvando' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Nenhuma imagem cadastrada. O site cairá automaticamente para fotos da frota.</p>
      )}
    </div>
  )
}
