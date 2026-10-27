import { Suspense } from 'react'
import { MessageSquare, FileText, Bus, TrendingUp, ArrowUpRight, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LeadStatusBadge, ContractStatusBadge } from '@/components/ui/Badge'
import { DemandChart, RevenueChart, VehicleMixChart } from './DashboardCharts'
import LicitacoesAlerts from './LicitacoesAlerts'

// ── Real Supabase data fetchers ────────────────────────────────────────────

async function getStats() {
  try {
    const supabase = createClient()
    const [leads, contracts, vehicles] = await Promise.all([
      supabase.from('leads').select('id, status').order('created_at', { ascending: false }),
      supabase.from('contracts').select('id, value, status'),
      supabase.from('vehicles').select('id, status'),
    ])

    const pendingLeads       = leads.data?.filter((l) => l.status === 'pendente').length ?? 0
    const activeContracts    = contracts.data?.filter((c) => c.status === 'ativo') ?? []
    const activeValue        = activeContracts.reduce((s, c) => s + (Number(c.value) || 0), 0)
    const availableVehicles  = vehicles.data?.filter((v) => v.status === 'disponivel').length ?? 0
    const totalVehicles      = vehicles.data?.length ?? 0

    return { pendingLeads, activeContracts: activeContracts.length, activeValue, availableVehicles, totalVehicles, hasData: true }
  } catch {
    return { pendingLeads: 0, activeContracts: 0, activeValue: 0, availableVehicles: 0, totalVehicles: 0, hasData: false }
  }
}

async function getRecentLeads() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('leads')
      .select('id, code, name, origin, destination, travel_date, status, created_at')
      .order('created_at', { ascending: false })
      .limit(6)
    return data ?? []
  } catch { return [] }
}

async function getActiveContracts() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('contracts')
      .select('id, code, client, value, status, end_date')
      .eq('status', 'ativo')
      .order('created_at', { ascending: false })
      .limit(5)
    return data ?? []
  } catch { return [] }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [stats, recentLeads, activeContracts] = await Promise.all([
    getStats(),
    getRecentLeads(),
    getActiveContracts(),
  ])

  const kpis = [
    {
      label: 'Orçamentos Pendentes',
      value: stats.pendingLeads === 0 ? '—' : stats.pendingLeads.toString(),
      sub:   stats.pendingLeads === 0 ? 'Nenhum pendente' : 'Aguardando resposta',
      icon:  MessageSquare,
      color: 'text-amber-400',
      bg:    'bg-amber-500/10 border-amber-500/20',
      href:  '/admin/orcamentos?status=pendente',
    },
    {
      label: 'Contratos Ativos',
      value: stats.activeContracts === 0 ? '—' : stats.activeContracts.toString(),
      sub:   stats.activeContracts === 0 ? 'Nenhum ativo' : `${formatCurrency(stats.activeValue)} em vigor`,
      icon:  FileText,
      color: 'text-emerald-400',
      bg:    'bg-emerald-500/10 border-emerald-500/20',
      href:  '/admin/contratos',
    },
    {
      label: 'Frota Disponível',
      value: stats.totalVehicles === 0 ? '—' : `${stats.availableVehicles}/${stats.totalVehicles}`,
      sub:   stats.totalVehicles === 0 ? 'Nenhum veículo cadastrado' : `${stats.totalVehicles - stats.availableVehicles} em uso/manutenção`,
      icon:  Bus,
      color: 'text-gold',
      bg:    'bg-gold/10 border-gold/20',
      href:  '/admin/frota',
    },
    {
      label: 'Receita Contratos',
      value: stats.activeValue === 0 ? '—' : formatCurrency(stats.activeValue),
      sub:   stats.activeValue === 0 ? 'Sem contratos ativos' : 'Total contratos vigentes',
      icon:  TrendingUp,
      color: 'text-blue-400',
      bg:    'bg-blue-500/10 border-blue-500/20',
      href:  '/admin/relatorios',
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

      {/* KPI Cards */}
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

      {/* Charts — client components wrapped in Suspense */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 glass-dark rounded-2xl p-5">
          <h3 className="font-heading font-semibold text-white text-sm mb-1">Demanda por Veículo</h3>
          <p className="text-gray-500 text-xs mb-4">Jan – Jul (dados de exemplo até o sistema ter histórico)</p>
          <Suspense fallback={<div className="h-[220px] animate-pulse bg-white/5 rounded-xl" />}>
            <DemandChart />
          </Suspense>
        </div>
        <div className="xl:col-span-2 glass-dark rounded-2xl p-5">
          <h3 className="font-heading font-semibold text-white text-sm mb-1">Mix da Frota</h3>
          <p className="text-gray-500 text-xs mb-4">% por categoria (dados de exemplo)</p>
          <Suspense fallback={<div className="h-[140px] animate-pulse bg-white/5 rounded-xl" />}>
            <VehicleMixChart />
          </Suspense>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="glass-dark rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-white text-sm">Faturamento — Meta vs Realizado</h3>
            <p className="text-gray-500 text-xs mt-0.5">Dados de exemplo — atualiza conforme contratos forem lançados</p>
          </div>
          <a href="/admin/relatorios" className="text-gold text-xs hover:underline flex items-center gap-1">
            Ver mais <ChevronRight size={12} />
          </a>
        </div>
        <Suspense fallback={<div className="h-[220px] animate-pulse bg-white/5 rounded-xl" />}>
          <RevenueChart />
        </Suspense>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent leads */}
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

        {/* Active contracts */}
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
              {activeContracts.map((c) => (
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
