'use client'

import { useState, useEffect } from 'react'
import { Search, MessageCircle, ChevronDown, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { LeadStatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/lib/types'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const STATUS_TABS: { label: string; value: 'all' | LeadStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Em Contato', value: 'em_contato' },
  { label: 'Aprovados', value: 'aprovado' },
  { label: 'Convertidos', value: 'convertido' },
]

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
  { value: 'convertido', label: 'Convertido' },
]

export default function OrcamentosAdminPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<'all' | LeadStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadLeads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads((data ?? []) as Lead[])
    setLoading(false)
  }

  useEffect(() => { loadLeads() }, [])

  const updateStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Erro ao atualizar status'); setUpdatingId(null); return }
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    toast.success('Status atualizado')
    setUpdatingId(null)
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.origin.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase())
    const matchStatus = activeStatus === 'all' || l.status === activeStatus
    return matchSearch && matchStatus
  })

  const counts = {
    pendente: leads.filter((l) => l.status === 'pendente').length,
    em_contato: leads.filter((l) => l.status === 'em_contato').length,
    aprovado: leads.filter((l) => l.status === 'aprovado').length,
    convertido: leads.filter((l) => l.status === 'convertido').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Orçamentos</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {loading ? 'Carregando...' : `${leads.length} solicitaç${leads.length !== 1 ? 'ões' : 'ão'} recebida${leads.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendentes', count: counts.pendente, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Em Contato', count: counts.em_contato, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Aprovados', count: counts.aprovado, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Convertidos', count: counts.convertido, color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`glass-dark rounded-xl p-4 border ${bg}`}>
            <div className={`font-heading font-black text-2xl ${color}`}>{loading ? '—' : count}</div>
            <div className="text-gray-400 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-100 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex flex-wrap gap-1 p-1 bg-navy-100 border border-white/10 rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeStatus === tab.value ? 'bg-gold text-navy-200 font-semibold' : 'text-gray-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-14 text-center">
            <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Carregando orçamentos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <MessageSquare size={28} className="text-gray-700 mb-2" />
            <p className="text-gray-500 text-sm">
              {leads.length === 0 ? 'Nenhum orçamento recebido ainda' : 'Nenhum orçamento encontrado'}
            </p>
            {leads.length === 0 && (
              <p className="text-gray-600 text-xs mt-1">Eles aparecerão aqui quando clientes solicitarem pelo site</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Código</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Solicitante</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">Rota</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">Data</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden lg:table-cell">Pax</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 && 'bg-white/[0.01]')}>
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{lead.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-gray-500 text-xs">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 hidden md:table-cell">
                      {lead.origin} → {lead.destination}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell text-xs">
                      {formatDate(lead.travel_date)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">
                      {lead.passengers} pax
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="relative group">
                        <LeadStatusBadge status={lead.status} />
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          title="Alterar status"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(lead.name)},%20recebi%20seu%20orçamento%20e%20vou%20verificar%20a%20disponibilidade.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
