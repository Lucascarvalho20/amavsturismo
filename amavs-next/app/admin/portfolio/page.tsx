'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trophy, Plus, X, Upload, Eye, EyeOff, Pencil, Trash2, ExternalLink, ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { cn, validateFileType } from '@/lib/utils'
import { PORTFOLIO_COLUMNS, portfolioAreaLabel, portfolioKindLabel, toSlug, type PortfolioItem, type PortfolioKind } from '@/lib/portfolio'

const fieldCls = 'w-full bg-navy-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40'
const AREAS = Object.keys(portfolioAreaLabel)

export default function AdminPortfolioPage() {
  return (
    <Suspense fallback={null}>
      <PortfolioManager />
    </Suspense>
  )
}

function PortfolioManager() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [missingTable, setMissingTable] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | 'new' | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('portfolio_items').select(PORTFOLIO_COLUMNS).order('display_order')
    setMissingTable(!!error)
    const list = (data ?? []) as PortfolioItem[]
    setItems(list)
    setLoading(false)
    const toEdit = params.get('editar')
    if (toEdit) {
      const found = list.find((i) => i.id === toEdit)
      if (found) setEditing(found)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeModal = () => {
    setEditing(null)
    if (params.get('editar')) router.replace('/admin/portfolio')
  }

  const togglePublish = async (item: PortfolioItem) => {
    const { error } = await supabase.from('portfolio_items').update({ is_published: !item.is_published, updated_at: new Date().toISOString() }).eq('id', item.id)
    if (error) return toast.error('Não foi possível salvar.')
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_published: !i.is_published } : i)))
    toast.success(item.is_published ? 'Ocultado do site' : 'Publicado no site')
  }

  const remove = async (item: PortfolioItem) => {
    if (!window.confirm(`Excluir “${item.organization}” do portfólio? As fotos continuam guardadas no Storage.`)) return
    const { error } = await supabase.from('portfolio_items').delete().eq('id', item.id)
    if (error) return toast.error('Não foi possível excluir.')
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-white mb-1 flex items-center gap-3">
            <Trophy size={26} className="text-gold" /> Portfólio
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Serviços já prestados que aparecem no site, na página inicial e em <strong className="text-gray-300">/licitacoes</strong>.
            Adicione fotos da operação para cada um. Itens ocultos não aparecem para visitantes.
          </p>
        </div>
        <button onClick={() => setEditing('new')} disabled={missingTable}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-40">
          <Plus size={16} /> Novo serviço
        </button>
      </header>

      {missingTable && (
        <div className="rounded-2xl p-5 mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          A tabela do portfólio ainda não existe. Rode <code>supabase/migrations/2026-10-27_security_hardening.sql</code> no
          SQL Editor do Supabase. Até lá, o site mostra os atestados fixos do código.
        </div>
      )}

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className={cn('glass-dark rounded-2xl overflow-hidden border', item.is_published ? 'border-white/5' : 'border-dashed border-white/15 opacity-70')}>
              <div className="relative aspect-[16/9] bg-navy-100 flex items-center justify-center">
                {item.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photos[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500 text-xs"><ImageOff size={22} className="mx-auto mb-1" />Sem fotos</div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60" style={{ color: '#fff' }}>
                  {item.is_published ? 'Publicado' : 'Oculto'} · {item.photos.length} foto{item.photos.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="p-4">
                <div className="text-white font-medium">{item.acronym ? `${item.acronym} — ` : ''}{item.organization}</div>
                <div className="text-gray-500 text-xs mt-0.5">{item.period_label} · ordem {item.display_order}</div>
                <div className="flex items-center gap-1 mt-3 -ml-1.5">
                  <button onClick={() => setEditing(item)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-gold/10 text-gold hover:bg-gold/20">
                    <Pencil size={13} /> Editar e fotos
                  </button>
                  <button onClick={() => togglePublish(item)} title={item.is_published ? 'Ocultar do site' : 'Publicar no site'} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    {item.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {item.is_published && (
                    <a href={`/licitacoes/${item.slug}`} target="_blank" title="Ver no site" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"><ExternalLink size={15} /></a>
                  )}
                  <button onClick={() => remove(item)} title="Excluir" className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10 ml-auto"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PortfolioModal
          item={editing === 'new' ? null : editing}
          onClose={closeModal}
          onSaved={(saved) => {
            setItems((prev) => (prev.some((i) => i.id === saved.id) ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved].sort((a, b) => a.display_order - b.display_order)))
            closeModal()
          }}
        />
      )}
    </div>
  )
}

function PortfolioModal({ item, onClose, onSaved }: { item: PortfolioItem | null; onClose: () => void; onSaved: (i: PortfolioItem) => void }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<string[]>(item?.photos ?? [])
  const [f, setF] = useState({
    organization: item?.organization ?? '',
    acronym: item?.acronym ?? '',
    parent_org: item?.parent_org ?? '',
    kind: (item?.kind ?? 'orgao_publico') as PortfolioKind,
    slug: item?.slug ?? '',
    period_label: item?.period_label ?? '',
    location: item?.location ?? '',
    summary: item?.summary ?? '',
    description: item?.description ?? '',
    highlight_value: item?.highlight_value ?? '',
    highlight_label: item?.highlight_label ?? '',
    reference: item?.reference ?? '',
    areas: item?.areas ?? ['transporte'],
    is_published: item?.is_published ?? false,
    display_order: String(item?.display_order ?? 100),
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const added: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) { toast.error(`${file.name}: máximo 8 MB`); continue }
      const v = validateFileType(file, 'images')
      if (!v.ok) { toast.error(`${file.name}: ${v.error}`); continue }
      const ext = file.name.split('.').pop()?.toLowerCase()
      const path = `${item?.id ?? 'novo'}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('portfolio').upload(path, file)
      if (error) { toast.error(`Erro ao enviar ${file.name}`); continue }
      added.push(supabase.storage.from('portfolio').getPublicUrl(path).data.publicUrl)
    }
    setPhotos((p) => [...p, ...added])
    setUploading(false)
    if (added.length) toast.success(`${added.length} foto(s) enviada(s). Clique em Salvar para confirmar.`)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.organization.trim().length < 2 || f.summary.trim().length < 10) return toast.error('Preencha o contratante e o resumo (mín. 10 caracteres).')
    const slug = toSlug(f.slug || `${f.acronym || f.organization} ${f.period_label}`)
    if (!slug) return toast.error('Endereço (slug) inválido.')

    const payload = {
      slug,
      organization: f.organization.trim(),
      acronym: f.acronym.trim() || null,
      parent_org: f.parent_org.trim() || null,
      kind: f.kind,
      period_label: f.period_label.trim() || null,
      location: f.location.trim() || null,
      summary: f.summary.trim(),
      description: f.description.trim() || null,
      highlight_value: f.highlight_value.trim() || null,
      highlight_label: f.highlight_label.trim() || null,
      reference: f.reference.trim() || null,
      areas: f.areas,
      photos,
      is_published: f.is_published,
      display_order: Number(f.display_order) || 0,
      updated_at: new Date().toISOString(),
    }
    setSaving(true)
    const q = item ? supabase.from('portfolio_items').update(payload).eq('id', item.id) : supabase.from('portfolio_items').insert(payload)
    const { data, error } = await q.select(PORTFOLIO_COLUMNS).single()
    setSaving(false)
    if (error || !data) {
      return toast.error(error?.code === '23505' ? 'Já existe um serviço com esse endereço (slug). Altere o campo.' : 'Não foi possível salvar.')
    }
    toast.success('Salvo')
    onSaved(data as unknown as PortfolioItem)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-navy-200 border border-white/10">
        <div className="flex items-center justify-between p-6 sticky top-0 bg-navy-200 border-b border-white/10 z-10">
          <h2 className="font-heading font-bold text-white text-lg">{item ? 'Editar serviço prestado' : 'Novo serviço prestado'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Fotos */}
          <section>
            <div className="text-sm font-medium text-gray-300 mb-2">Fotos da operação <span className="text-gray-500 font-normal">({photos.length})</span></div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {photos.map((url, i) => (
                  <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-gold text-black font-bold px-1.5 py-0.5 rounded">Capa</span>}
                    {i > 0 && (
                      <button type="button" onClick={() => setPhotos([url, ...photos.filter((p) => p !== url)])}
                        className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gold hover:text-black">
                        Usar como capa
                      </button>
                    )}
                    <button type="button" onClick={() => setPhotos(photos.filter((p) => p !== url))} aria-label="Remover foto"
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-md text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-wine/80">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-gold/30 transition-colors bg-navy-100/50">
                {uploading ? (
                  <span className="text-gold text-sm">Enviando…</span>
                ) : (
                  <>
                    <Upload size={20} className="text-gray-500 mx-auto mb-1" />
                    <p className="text-gray-400 text-sm">Clique para adicionar fotos</p>
                    <p className="text-gray-600 text-xs mt-0.5">JPG, PNG ou WEBP · até 8 MB cada · pode escolher várias</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
            </label>
            <p className="text-xs text-gray-500 mt-2">A primeira foto é a capa no site. Evite rostos de passageiros sem autorização.</p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Contratante *" full><input className={fieldCls} value={f.organization} onChange={(e) => set('organization', e.target.value)} placeholder="Ex.: Colégio Militar de Brasília" /></Field>
            <Field label="Sigla"><input className={fieldCls} value={f.acronym} onChange={(e) => set('acronym', e.target.value)} placeholder="Ex.: CMB" /></Field>
            <Field label="Vinculado a"><input className={fieldCls} value={f.parent_org} onChange={(e) => set('parent_org', e.target.value)} placeholder="Ex.: Ministério da Defesa · Exército" /></Field>
            <Field label="Tipo de contratante">
              <select className={fieldCls} value={f.kind} onChange={(e) => set('kind', e.target.value as PortfolioKind)}>
                {(Object.keys(portfolioKindLabel) as PortfolioKind[]).map((k) => <option key={k} value={k}>{portfolioKindLabel[k]}</option>)}
              </select>
            </Field>
            <Field label="Período"><input className={fieldCls} value={f.period_label} onChange={(e) => set('period_label', e.target.value)} placeholder="Ex.: Jul/2026 ou 2024 – 2026" /></Field>
            <Field label="Local"><input className={fieldCls} value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Ex.: Brasília-DF" /></Field>
            <Field label="Número em destaque"><input className={fieldCls} value={f.highlight_value} onChange={(e) => set('highlight_value', e.target.value)} placeholder="Ex.: 40" /></Field>
            <Field label="O que o número mede"><input className={fieldCls} value={f.highlight_label} onChange={(e) => set('highlight_label', e.target.value)} placeholder="Ex.: veículos em operação" /></Field>
            <Field label="Resumo (aparece no card) *" full>
              <textarea rows={2} maxLength={400} className={`${fieldCls} resize-none`} value={f.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <Field label="Descrição completa (página do serviço)" full>
              <textarea rows={4} className={`${fieldCls} resize-y`} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Como foi a operação, quantos veículos, rotas, desafios…" />
            </Field>
            <Field label="Referência (processo, pregão, contrato)" full><input className={fieldCls} value={f.reference} onChange={(e) => set('reference', e.target.value)} placeholder="Ex.: Pregão Eletrônico nº 17/2026" /></Field>
            <Field label="Áreas" full>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => {
                  const on = f.areas.includes(a)
                  return (
                    <button key={a} type="button" onClick={() => set('areas', on ? f.areas.filter((x) => x !== a) : [...f.areas, a])}
                      className={cn('px-3 py-1.5 rounded-lg text-xs', on ? 'bg-gold text-navy-200 font-semibold' : 'bg-white/5 text-gray-400')}>
                      {portfolioAreaLabel[a]}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Endereço no site (slug)">
              <input className={fieldCls} value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="gerado automaticamente" />
            </Field>
            <Field label="Ordem (menor aparece primeiro)"><input type="number" className={fieldCls} value={f.display_order} onChange={(e) => set('display_order', e.target.value)} /></Field>
          </section>

          <label className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer">
            <input type="checkbox" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} className="rounded" />
            Publicar no site
          </label>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
          <button type="submit" disabled={saving || uploading} className="px-5 py-2 rounded-lg bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn('block', full && 'md:col-span-2')}>
      <span className="block text-xs text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
