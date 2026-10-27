import Link from 'next/link'
import { CalendarClock, AlertTriangle, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { OPEN_STATUSES, bidStatusLabel, type Bid } from '@/lib/licitacoes'
import { documentStatus } from '@/lib/documents'

// Alertas do topo do dashboard: sessões próximas e certidões vencendo.
// Se as tabelas ainda não existirem (migration não rodada), não renderiza nada.

export default async function LicitacoesAlerts() {
  const supabase = createClient()
  const in14 = new Date(Date.now() + 14 * 86_400_000).toISOString()

  const [bidsRes, docsRes] = await Promise.all([
    supabase
      .from('bids')
      .select('id, organization, process_number, session_at, status')
      .in('status', OPEN_STATUSES)
      .gte('session_at', new Date().toISOString())
      .lte('session_at', in14)
      .order('session_at')
      .limit(5),
    supabase.from('company_documents').select('id, name, expires_at').not('expires_at', 'is', null),
  ])

  if (bidsRes.error && docsRes.error) return null

  const sessions = (bidsRes.data ?? []) as Pick<Bid, 'id' | 'organization' | 'process_number' | 'session_at' | 'status'>[]
  const docAlerts = ((docsRes.data ?? []) as Array<{ id: string; name: string; expires_at: string }>)
    .map((d) => ({ ...d, ...documentStatus(d.expires_at) }))
    .filter((d) => d.status === 'vencido' || d.status === 'vencendo')
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Link href="/admin/licitacoes" className="glass-dark rounded-2xl p-5 block hover:border-gold/20 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-white flex items-center gap-2">
            <CalendarClock size={17} className="text-gold" /> Próximas sessões (14 dias)
          </h2>
          <ChevronRight size={16} className="text-gray-600 group-hover:text-gold" />
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma sessão marcada.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((b) => {
              const d = new Date(b.session_at!)
              const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000)
              return (
                <li key={b.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-200 truncate">
                    {b.organization}{b.process_number && <span className="text-gray-500"> · {b.process_number}</span>}
                  </span>
                  <span className={days <= 3 ? 'text-red-400 font-semibold shrink-0' : 'text-gray-400 shrink-0'}>
                    {d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {bidStatusLabel[b.status]}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Link>

      <Link href="/admin/documentos" className={`glass-dark rounded-2xl p-5 block transition-all group ${docAlerts.length ? 'border border-amber-500/30' : 'hover:border-gold/20'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={17} className={docAlerts.length ? 'text-amber-400' : 'text-gold'} /> Certidões e documentos
          </h2>
          <ChevronRight size={16} className="text-gray-600 group-hover:text-gold" />
        </div>
        {docAlerts.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum documento vencido ou vencendo nos próximos 15 dias.</p>
        ) : (
          <ul className="space-y-2">
            {docAlerts.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-200 truncate">{d.name}</span>
                <span className={d.status === 'vencido' ? 'text-red-400 font-semibold shrink-0' : 'text-amber-300 shrink-0'}>
                  {d.status === 'vencido' ? `vencido há ${Math.abs(d.daysLeft!)}d` : d.daysLeft === 0 ? 'vence hoje' : `vence em ${d.daysLeft}d`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Link>
    </div>
  )
}
