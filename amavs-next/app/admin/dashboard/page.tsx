import { Suspense } from 'react'
import { MessageSquare, FileText, Bus, Gavel, ArrowUpRight, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { bidStats } from '@/lib/licitacoes'
import { bidsByMonth, fleetByCategory, wonValueByMonth } from '@/lib/dashboard'
import { LeadStatusBadge, ContractStatusBadge } from '@/components/ui/Badge'
import { BidsByMonthChart, FleetMixChart, WonValueChart } from './DashboardCharts'
import LicitacoesAlerts from './LicitacoesAlerts'

async function loadDashboard() {
  const supabase = createClient()
  const [pending, contracts, vehicles, bids, recentLeads] = await Promise.all([
    // head: true conta no banco sem baixar as linhas
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase
      .from('contracts')
      .select('id, code, client, value, status, end_date')
      .eq('status', 'ativo')
      .order('created_at', { ascending: false }),
    supabase.from('vehicles').select('status, category, capacity'),
    supabase.from('bids').select('status, session_at, created_at, awarded_value, proposed_value'),
    supabase
      .from('leads')
      .select('id, code, name, origin, destination, travel_date, status, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // Se uma tabela ainda não existir (migration não rodada), o painel abre com aquele bloco vazio
  return {
    pendingLeads: pending.count ?? 0,
    activeContracts: contracts.data ?? [],
    vehicles: vehicles.data ?? [],
    bids: bids.data ?? [],
    recentLeads: recentLeads.data ?? [],
  }
}

export default async function DashboardPage() {
  const { pendingLeads, activeContracts, vehicles, bids, recentLeads } = await loadDashboard()
  const now = new Date()

  const activeValue = activeContracts.reduce((sum, c) => sum + (Number(c.value) || 0), 0)
  const availableVehicles = vehicles.filter((v) => v.status === 'disponivel').length
  const bidSummary = bidStats(bids, now)
  const decided = bidSummary.won + bidSummary.lost

  const kpis = [
    {
      label: 'Orçamentos Pendentes',
      value: pendingLeads === 0 ? '—' : pendingLeads.toString(),
      sub: pendingLeads === 0 ? 'Nenhum pendente' : 'Aguardando resposta',
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/admin/orcamentos?status=pendente',
    },
    {
      label: 'Contratos Ativos',
      value: activeContracts.length === 0 ? '—' : activeContracts.length.toString(),
      sub: activeContracts.length === 0 ? 'Nenhum ativo' : `${formatCurrency(activeValue)} em vigor`,
      icon: FileText,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/admin/contratos',
    },
    {
      label: 'Frota Disponível',
      value: vehicles.length === 0 ? '—' : `${availableVehicles}/${vehicles.length}`,
      sub: vehicles.length === 0 ? 'Nenhum veículo cadastrado' : `${vehicles.length - availableVehicles} em uso/manutenção`,
      icon: Bus,
      color: 'text-gold',
      bg: 'bg-gold/10 border-gold/20',
      href: '/admin/frota',
    },
    {
      label: 'Taxa de Sucesso',
      value: bidSummary.winRate === null ? '—' : `${Math.round(bidSummary.winRate * 100)}%`,
      sub: decided === 0 ? 'Nenhuma licitação com resultado' : `${bidSummary.won} ganha(s) de ${decided} com resultado`,
      icon: Gavel,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/admin/licitacoes',
    },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Bem-vindo ao painel da Amav&apos;s Turismo</p>
      </div>

      <Suspense fallback={<div className="h-[140px] animate-pulse bg-white/5 rounded-2xl" />}>
        <LicitacoesAlerts />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <a key={label} href={href} className="glass-dark rounded-2xl p-5 hover:border-gold/20 transition-all duration-200 group block">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl border ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <ArrowUpRight size={15} className="text-gray-600 group-hover:text-gold transition-colors" />
            </div>
            <div className={`font-heading font-black text-2xl mb-0.5 ${value === '—' ? 'text-gray-600' : 'text-white'}`}>{value}</div>
            <div className="text-sm font-medium text-gray-300">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 glass-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-white text-sm">Licitações por mês</h3>
              <p className="text-gray-500 text-xs mt-0.5">Últimos 12 meses, pelo mês da sessão</p>
            </div>
            <a href="/admin/licitacoes" className="text-gold text-xs hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={12} />
            </a>
          </div>
          <BidsByMonthChart data={bidsByMonth(bids, now)} />
        </div>
        <div className="xl:col-span-2 glass-dark rounded-2xl p-5">
          <h3 className="font-heading font-semibold text-white text-sm mb-1">Frota por categoria</h3>
          <p className="text-gray-500 text-xs mb-4">Veículos cadastrados e lugares</p>
          <FleetMixChart data={fleetByCategory(vehicles)} />
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-white text-sm">Valor ganho em licitações</h3>
        <p className="text-gray-500 text-xs mt-0.5 mb-4">Valor homologado (ou proposto, se ainda não informado), por mês da sessão</p>
        <WonValueChart data={wonValueByMonth(bids, now)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="glass-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white text-sm">Últimos Orçamentos</h3>
            <a href="/admin/orcamentos" className="text-gold text-xs hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </a>
          </div>
          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageSquare size={28} className="text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">Nenhum orçamento recebido ainda</p>
              <p className="text-gray-600 text-xs mt-1">Eles aparecerão aqui quando clientes solicitarem pelo site</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-gray-500 text-xs">{lead.origin} → {lead.destination}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-gray-500 text-xs hidden sm:block">{formatDate(lead.created_at)}</span>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white text-sm">Contratos Ativos</h3>
            <a href="/admin/contratos" className="text-gold text-xs hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </a>
          </div>
          {activeContracts.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <FileText size={28} className="text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">Nenhum contrato ativo</p>
              <p className="text-gray-600 text-xs mt-1">Adicione contratos na seção Contratos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeContracts.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.client}</p>
                    <p className="text-gray-500 text-xs font-mono">{c.code}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-gold text-sm font-semibold hidden sm:block">{formatCurrency(Number(c.value))}</span>
                    <ContractStatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
