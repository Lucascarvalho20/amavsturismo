'use client'

import { useEffect, useMemo, useState } from 'react'
import { FolderCheck, Plus, X, Upload, Pencil, Trash2, FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-browser'
import { cn, formatDate, validateFileType } from '@/lib/utils'
import {
  COMMON_DOCUMENTS, DOC_CATEGORIES, docCategoryLabel, docStatusLabel, documentStatus,
  type DocCategory, type DocStatus,
} from '@/lib/documents'

interface CompanyDocument {
  id: string
  name: string
  category: DocCategory
  issuer: string | null
  number: string | null
  issued_at: string | null
  expires_at: string | null
  file_path: string | null
  notes: string | null
}

const BUCKET = 'company-docs'
const fieldCls = 'w-full bg-navy-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/40'

const statusStyle: Record<DocStatus, string> = {
  vencido: 'bg-red-500/15 text-red-400',
  vencendo: 'bg-amber-500/15 text-amber-300',
  valido: 'bg-emerald-500/15 text-emerald-400',
  sem_validade: 'bg-white/5 text-gray-400',
}

// Ordem de exibição: o que exige ação primeiro
const statusRank: Record<DocStatus, number> = { vencido: 0, vencendo: 1, valido: 2, sem_validade: 3 }

export default function AdminDocumentosPage() {
  const supabase = createClient()
  const [docs, setDocs] = useState<CompanyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [missingTable, setMissingTable] = useState(false)
  const [editing, setEditing] = useState<CompanyDocument | 'new' | null>(null)

  useEffect(() => {
    supabase.from('company_documents').select('*').then(({ data, error }) => {
      setMissingTable(!!error)
      setDocs((data ?? []) as CompanyDocument[])
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(
    () =>
      docs
        .map((d) => ({ doc: d, ...documentStatus(d.expires_at) }))
        .sort((a, b) => statusRank[a.status] - statusRank[b.status] || (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9)),
    [docs],
  )
  const count = (s: DocStatus) => rows.filter((r) => r.status === s).length

  const open = async (doc: CompanyDocument) => {
    if (!doc.file_path) return
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 60)
    if (error || !data) return toast.error('Não foi possível abrir o arquivo.')
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const remove = async (doc: CompanyDocument) => {
    if (!window.confirm(`Excluir “${doc.name}”? O arquivo anexado também será apagado.`)) return
    if (doc.file_path) await supabase.storage.from(BUCKET).remove([doc.file_path])
    const { error } = await supabase.from('company_documents').delete().eq('id', doc.id)
    if (error) return toast.error('Não foi possível excluir.')
    setDocs((p) => p.filter((d) => d.id !== doc.id))
  }

  const summary = [
    { s: 'vencido' as const, icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/40' },
    { s: 'vencendo' as const, icon: Clock, color: 'text-amber-300', border: 'border-amber-500/40' },
    { s: 'valido' as const, icon: CheckCircle2, color: 'text-emerald-400', border: 'border-white/5' },
  ]

  return (
    <div>
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-white mb-1 flex items-center gap-3">
            <FolderCheck size={26} className="text-gold" /> Documentos de habilitação
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Certidões e documentos pedidos nos editais. Certidão vencida no dia da sessão inabilita a empresa:
            o painel avisa 15 dias antes. Os arquivos ficam privados e só abrem para administradores.
          </p>
        </div>
        <button onClick={() => setEditing('new')} disabled={missingTable}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-40">
          <Plus size={16} /> Novo documento
        </button>
      </header>

      {missingTable && (
        <div className="rounded-2xl p-5 mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          A tabela de documentos ainda não existe. Rode <code>supabase/migrations/2026-10-27_security_hardening.sql</code> no SQL Editor do Supabase.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8">
        {summary.map(({ s, icon: Icon, color, border }) => (
          <div key={s} className={cn('glass-dark rounded-2xl p-5 border', count(s) > 0 && s !== 'valido' ? border : 'border-white/5')}>
            <Icon size={18} className={color} />
            <div className="font-heading font-bold text-2xl text-white mt-3">{count(s)}</div>
            <div className="text-gray-400 text-xs mt-0.5">{docStatusLabel[s]}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="glass-dark rounded-2xl p-12 text-center text-gray-500">
          <FileText size={32} className="mx-auto mb-3 opacity-60" />
          Nenhum documento cadastrado. Comece pelas certidões federal, FGTS, trabalhista e do GDF.
        </div>
      ) : (
        <div className="glass-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                  <th className="px-5 py-3.5">Documento</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Categoria</th>
                  <th className="px-5 py-3.5">Validade</th>
                  <th className="px-5 py-3.5">Situação</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ doc, status, daysLeft }) => (
                  <tr key={doc.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="text-white">{doc.name}</div>
                      {(doc.issuer || doc.number) && <div className="text-gray-500 text-xs">{[doc.issuer, doc.number].filter(Boolean).join(' · ')}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{docCategoryLabel[doc.category]}</td>
                    <td className="px-5 py-3.5 text-gray-300 whitespace-nowrap">{doc.expires_at ? formatDate(doc.expires_at) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap', statusStyle[status])}>
                        {status === 'vencido' ? `Vencido há ${Math.abs(daysLeft!)}d`
                          : status === 'vencendo' ? (daysLeft === 0 ? 'Vence hoje' : `Vence em ${daysLeft}d`)
                          : docStatusLabel[status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {doc.file_path && (
                          <button onClick={() => open(doc)} title="Abrir arquivo" className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10"><FileText size={15} /></button>
                        )}
                        <button onClick={() => setEditing(doc)} title="Editar / renovar" className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10"><Pencil size={15} /></button>
                        <button onClick={() => remove(doc)} title="Excluir" className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine/10"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <DocModal
          doc={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(d) => {
            setDocs((p) => (p.some((x) => x.id === d.id) ? p.map((x) => (x.id === d.id ? d : x)) : [...p, d]))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function DocModal({ doc, onClose, onSaved }: { doc: CompanyDocument | null; onClose: () => void; onSaved: (d: CompanyDocument) => void }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [f, setF] = useState({
    name: doc?.name ?? '',
    category: doc?.category ?? 'fiscal',
    issuer: doc?.issuer ?? '',
    number: doc?.number ?? '',
    issued_at: doc?.issued_at ?? '',
    expires_at: doc?.expires_at ?? '',
    notes: doc?.notes ?? '',
  })
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))

  // Ao escolher um documento comum, sugere categoria e emissor
  const pickName = (name: string) => {
    const preset = COMMON_DOCUMENTS.find((d) => d.name === name)
    setF((p) => ({ ...p, name, ...(preset && !doc ? { category: preset.category, issuer: preset.issuer ?? p.issuer } : {}) }))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return toast.error('Informe o nome do documento.')
    if (f.issued_at && f.expires_at && f.expires_at < f.issued_at) return toast.error('A validade não pode ser anterior à emissão.')
    setSaving(true)

    let file_path = doc?.file_path ?? null
    if (file) {
      if (file.size > 15 * 1024 * 1024) { setSaving(false); return toast.error('Arquivo maior que 15 MB.') }
      const v = validateFileType(file, 'images_or_pdf')
      if (!v.ok) { setSaving(false); return toast.error(v.error ?? 'Tipo inválido') }
      const ext = file.name.split('.').pop()?.toLowerCase()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file)
      if (error) { setSaving(false); return toast.error('Erro ao enviar o arquivo.') }
      // arquivo antigo é substituído (renovação da certidão)
      if (doc?.file_path) await supabase.storage.from(BUCKET).remove([doc.file_path])
      file_path = path
    }

    const payload = {
      name: f.name.trim(),
      category: f.category,
      issuer: f.issuer.trim() || null,
      number: f.number.trim() || null,
      issued_at: f.issued_at || null,
      expires_at: f.expires_at || null,
      notes: f.notes.trim() || null,
      file_path,
      updated_at: new Date().toISOString(),
    }
    const q = doc ? supabase.from('company_documents').update(payload).eq('id', doc.id) : supabase.from('company_documents').insert(payload)
    const { data, error } = await q.select('*').single()
    setSaving(false)
    if (error || !data) return toast.error('Não foi possível salvar.')
    toast.success('Documento salvo')
    onSaved(data as CompanyDocument)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full md:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-navy-200 border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-heading font-bold text-white text-lg">{doc ? 'Editar / renovar documento' : 'Novo documento'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="block text-xs text-gray-400 mb-1">Documento *</span>
            <input className={fieldCls} list="common-docs" value={f.name} onChange={(e) => pickName(e.target.value)} placeholder="Comece a digitar ou escolha da lista" />
            <datalist id="common-docs">{COMMON_DOCUMENTS.map((d) => <option key={d.name} value={d.name} />)}</datalist>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">Categoria</span>
            <select className={fieldCls} value={f.category} onChange={(e) => set('category', e.target.value)}>
              {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{docCategoryLabel[c]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">Emissor</span>
            <input className={fieldCls} value={f.issuer} onChange={(e) => set('issuer', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">Emitido em</span>
            <input type="date" className={fieldCls} value={f.issued_at} onChange={(e) => set('issued_at', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">Válido até</span>
            <input type="date" className={fieldCls} value={f.expires_at} onChange={(e) => set('expires_at', e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="block text-xs text-gray-400 mb-1">Número / código de controle</span>
            <input className={fieldCls} value={f.number} onChange={(e) => set('number', e.target.value)} />
          </label>
          <label className="block md:col-span-2 cursor-pointer">
            <span className="block text-xs text-gray-400 mb-1">Arquivo (PDF ou imagem)</span>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-gold/30 bg-navy-100/50 text-sm text-gray-400">
              <Upload size={18} className="mx-auto mb-1 text-gray-500" />
              {file ? file.name : doc?.file_path ? 'Arquivo anexado. Clique para substituir.' : 'Clique para anexar'}
            </div>
            <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="block md:col-span-2">
            <span className="block text-xs text-gray-400 mb-1">Observações</span>
            <textarea rows={2} className={`${fieldCls} resize-none`} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
          </label>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gold text-navy-200 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
