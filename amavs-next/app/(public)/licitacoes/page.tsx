import type { Metadata } from 'next'
import { ChevronDown, CheckCircle2, MessageCircle, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDate, modalityLabel } from '@/lib/utils'
import { companyInfo, firstPublicContractYear } from '@/lib/atestados'
import { loadPortfolio } from '@/lib/portfolio'
import PortfolioCard from '@/components/PortfolioCard'
import type { Contract } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Setor público — Serviços prestados',
  description:
    "Serviços de transporte prestados pela Amav's Turismo a órgãos públicos: Exército, Conselho Federal de Contabilidade, Ministério Público do Trabalho e Ministério da Saúde. Atestados de capacidade técnica desde 2010.",
}

const documents = [
  'Cadastro no SICAF',
  'Certidões federal, distrital e municipal',
  'Regularidade com FGTS e CNDT',
  'RNTRC / ANTT para transporte de passageiros',
  'CRLV e vistoria dos veículos',
  'Motoristas com CNH D/E e curso de transporte coletivo',
  'Seguro de responsabilidade civil para passageiros',
  'Atestados de capacidade técnica',
]

const howWeWork = [
  { n: '01', title: 'Acompanhamento de editais', desc: 'Monitoramos pregões e dispensas de transporte de passageiros nos portais de compras públicas.' },
  { n: '02', title: 'Análise do termo de referência', desc: 'Frota exigida, datas, trajetos, equipe e documentos de habilitação.' },
  { n: '03', title: 'Proposta e habilitação', desc: 'Proposta de preços, planilha de custos e documentação com as certidões em dia.' },
  { n: '04', title: 'Execução acompanhada', desc: 'Coordenação dedicada, contato direto com o fiscal do contrato e relatório ao final.' },
]

const faqs = [
  {
    q: 'Em quais modalidades a empresa participa?',
    a: 'Pregão eletrônico, concorrência, dispensa de licitação e adesão a atas de registro de preços, conforme a Lei 14.133/2021.',
  },
  {
    q: 'Como solicitar cópia dos atestados de capacidade técnica?',
    a: 'Os atestados originais, assinados, são enviados ao pregoeiro ou à comissão junto com os documentos de habilitação, ou mediante pedido pelo e-mail de contato.',
  },
  {
    q: 'A empresa atende fora do Distrito Federal?',
    a: 'Sim. Já executou contratos em Fortaleza (CE), Curitiba (PR) e Palmas (TO), além de viagens interestaduais a partir de Brasília.',
  },
  {
    q: 'Vocês respondem cotação para pesquisa de preços?',
    a: 'Sim. Envie o termo de referência para o e-mail ou WhatsApp abaixo que a proposta para pesquisa de preços é respondida pela equipe.',
  },
]

async function wonBidsCount(): Promise<number> {
  const admin = createAdminClient()
  if (!admin) return 0
  const { count, error } = await admin.from('bids').select('id', { count: 'exact', head: true }).eq('status', 'ganha')
  return error ? 0 : count ?? 0
}

export default async function LicitacoesPage() {
  const supabase = createClient()
  const [portfolio, won, contractsRes] = await Promise.all([
    loadPortfolio(supabase),
    wonBidsCount(),
    supabase
      .from('contracts')
      .select('id, code, client, modality, status, start_date, end_date, is_public')
      .eq('is_public', true)
      .in('status', ['ativo', 'em_licitacao'])
      .order('start_date', { ascending: false }),
  ])
  const contracts = (contractsRes.data ?? []) as Contract[]
  const publicCount = portfolio.filter((p) => p.kind === 'orgao_publico').length

  const stats = [
    { value: String(firstPublicContractYear), label: 'primeiro contrato público atestado' },
    { value: String(publicCount), label: 'órgãos públicos atestam o serviço' },
    ...(won > 0 ? [{ value: String(won), label: 'licitações vencidas registradas' }] : []),
  ]

  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-32">
      {/* Hero */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-20 md:mb-24">
        <div className="max-w-3xl">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Setor público
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Serviços prestados<br />
            <span className="text-gradient-gold">ao governo.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            A Amav&apos;s Turismo participa de licitações de transporte de passageiros e já atendeu o Exército,
            conselhos federais e ministérios. Abaixo, os contratos executados e os atestados que eles geraram.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-heading font-semibold text-4xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>{s.value}</div>
                <div className="text-sm mt-1 max-w-[11rem]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfólio */}
      <section id="atestados" className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32 scroll-mt-28">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
              Contratos executados
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)]">
              Quem já contratou, atesta.
            </h2>
          </div>
          <p className="text-sm font-light max-w-md" style={{ color: 'var(--text-muted)' }}>
            Cada item corresponde a um atestado de capacidade técnica emitido pelo contratante.
            Clique para ver detalhes e fotos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Habilitação + como atuamos */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Habilitação</div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-8">Documentação em dia.</h2>
          <ul className="space-y-3.5">
            {documents.map((d) => (
              <li key={d} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--text)' }}>
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gold-strong)' }} />
                {d}
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
            <div>
              <dt style={{ color: 'var(--text-dim)' }}>Razão social</dt>
              <dd className="font-medium" style={{ color: 'var(--text)' }}>{companyInfo.legalName}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--text-dim)' }}>CNPJ</dt>
              <dd className="font-medium font-mono" style={{ color: 'var(--text)' }}>{companyInfo.cnpj}</dd>
            </div>
          </dl>
        </div>
        <div>
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Como atuamos</div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-8">Do edital ao atestado.</h2>
          <ol className="space-y-6">
            {howWeWork.map((s) => (
              <li key={s.n} className="flex gap-5">
                <span className="font-mono text-sm pt-1" style={{ color: 'var(--gold-strong)' }}>{s.n}</span>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text)' }}>{s.title}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contratos em vigência (só os marcados como públicos no painel) */}
      {contracts.length > 0 && (
        <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Em andamento</div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-10">Contratos em vigência</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Órgão', 'Modalidade', 'Período', 'Status'].map((h, i) => (
                      <th key={h} className={`text-left px-6 py-5 font-medium text-xs uppercase tracking-wider ${i === 1 ? 'hidden md:table-cell' : i === 2 ? 'hidden sm:table-cell' : ''}`} style={{ color: 'var(--text-dim)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-5 font-medium" style={{ color: 'var(--text)' }}>{c.client}</td>
                      <td className="px-6 py-5 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>{modalityLabel(c.modality)}</td>
                      <td className="px-6 py-5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(c.start_date)} – {formatDate(c.end_date)}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: c.status === 'ativo' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.15)', color: c.status === 'ativo' ? '#059669' : 'var(--gold-strong)' }}>
                          {c.status === 'ativo' ? 'Em execução' : 'Em licitação'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Contato para órgãos */}
      <section id="contato" className="container mx-auto px-6 md:px-10 max-w-5xl mb-24 md:mb-32 scroll-mt-28">
        <div className="rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-heading font-semibold tracking-tight text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight mb-3">
              Pregoeiro, fiscal ou gestor de contrato?
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Para pedir atestados, documentos de habilitação ou cotação para pesquisa de preços, fale direto com a equipe.
            </p>
          </div>
          <div className="space-y-3">
            <a href="https://wa.me/5561984222205" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 h-12 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors font-medium" style={{ color: '#fff' }}>
              <MessageCircle size={18} /> WhatsApp (61) 98422-2205
            </a>
            <a href="mailto:contato@amavsturismo.com.br" className="flex items-center gap-3 h-12 px-5 rounded-full font-medium" style={{ border: '1px solid var(--border-md)', color: 'var(--text)' }}>
              <Mail size={18} /> contato@amavsturismo.com.br
            </a>
            <a href="tel:+5561984222205" className="flex items-center gap-3 h-12 px-5 rounded-full font-medium" style={{ border: '1px solid var(--border-md)', color: 'var(--text)' }}>
              <Phone size={18} /> Ligar
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 md:px-10 max-w-5xl">
        <div className="text-center mb-14">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>FAQ</div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3.25rem)]">Perguntas frequentes.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl group" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-medium select-none list-none">
                <span style={{ color: 'var(--text)' }}>{faq.q}</span>
                <ChevronDown size={18} className="flex-shrink-0 ml-3 transition-transform group-open:rotate-180" style={{ color: 'var(--gold-strong)' }} />
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
