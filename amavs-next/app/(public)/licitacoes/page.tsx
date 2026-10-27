import type { Metadata } from 'next'
import { ChevronDown, ArrowRight, FileCheck2, CheckCircle2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { formatDate, modalityLabel } from '@/lib/utils'
import { atestados, areaLabel, companyInfo, publicAtestados, firstPublicContractYear } from '@/lib/atestados'
import type { Contract } from '@/lib/types'
import BidRequestForm from './BidRequestForm'

export const metadata: Metadata = {
  title: 'Licitações — Transporte para órgãos públicos',
  description:
    "Transporte de passageiros para órgãos públicos em Brasília. Atestados de capacidade técnica do Exército, CFC, MPT e Ministério da Saúde. Pregão eletrônico, dispensa e adesão a ata.",
}

const documents = [
  'Cadastro no SICAF',
  'Certidões federal, estadual (GDF) e municipal',
  'Regularidade com FGTS e CNDT (débitos trabalhistas)',
  'RNTRC / ANTT para transporte de passageiros',
  'CRLV e vistoria dos veículos',
  'CNH categoria D/E e curso de transporte coletivo dos motoristas',
  'Apólice de seguro de responsabilidade civil para passageiros',
  'Atestados de capacidade técnica (abaixo)',
]

const steps = [
  { n: '01', title: 'Você envia o edital', desc: 'Pelo formulário abaixo, por e-mail ou WhatsApp. Pode ser só o número do processo.' },
  { n: '02', title: 'Análise do termo de referência', desc: 'Conferimos veículos, datas, trajeto e exigências de habilitação.' },
  { n: '03', title: 'Proposta e documentação', desc: 'Proposta de preço, planilha de custos quando exigida e documentos de habilitação.' },
  { n: '04', title: 'Execução acompanhada', desc: 'Coordenação dedicada, contato direto com o fiscal do contrato e relatório de execução.' },
]

const faqs = [
  {
    q: 'Quais modalidades a empresa atende?',
    a: 'Pregão eletrônico, concorrência, dispensa de licitação, inexigibilidade e adesão a atas de registro de preços, conforme a Lei 14.133/2021. Também respondemos cotações para pesquisa de preços.',
  },
  {
    q: 'Vocês respondem cotação para pesquisa de preços (fase interna)?',
    a: 'Sim. Envie o termo de referência ou a descrição do objeto pelo formulário e informe que se trata de pesquisa de preços.',
  },
  {
    q: 'Como solicitar cópia dos atestados de capacidade técnica?',
    a: 'Os atestados originais são enviados à comissão ou ao pregoeiro mediante solicitação, junto com os demais documentos de habilitação.',
  },
  {
    q: 'Atendem fora do Distrito Federal?',
    a: 'Sim. Já executamos contratos em Fortaleza (CE), Curitiba (PR) e Palmas (TO), além de viagens interestaduais a partir de Brasília.',
  },
  {
    q: 'É possível contratar por dispensa?',
    a: 'Sim, dentro dos limites de valor da Lei 14.133/2021. Envie a necessidade que avaliamos o enquadramento junto com o setor de compras.',
  },
]

export default async function LicitacoesPage() {
  let contracts: Contract[] = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('contracts')
      .select('id, code, client, modality, status, start_date, end_date, is_public')
      .eq('is_public', true)
      .in('status', ['ativo', 'em_licitacao'])
      .order('start_date', { ascending: false })
    contracts = (data ?? []) as Contract[]
  } catch {
    contracts = []
  }

  return (
    <div className="surface min-h-screen pt-32 md:pt-40 pb-32">
      {/* Hero */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-28">
        <div className="max-w-3xl">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Setor público
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Transporte para<br />
            <span className="text-gradient-gold">órgãos públicos.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Desde {firstPublicContractYear} prestando serviço ao Exército, a conselhos federais e a ministérios,
            com {publicAtestados.length} atestados de capacidade técnica emitidos por órgãos públicos.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#proposta" className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              Solicitar proposta <ArrowRight size={16} />
            </a>
            <a href="#atestados" className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium" style={{ color: 'var(--text)', border: '1px solid var(--border-md)' }}>
              Ver atestados
            </a>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
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
      </section>

      {/* Atestados */}
      <section id="atestados" className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32 scroll-mt-28">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
              Capacidade técnica
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)]">
              Atestados emitidos
            </h2>
          </div>
          <p className="text-sm font-light max-w-md" style={{ color: 'var(--text-muted)' }}>
            Os documentos originais, assinados, são enviados à comissão de licitação mediante solicitação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {atestados.map((a) => (
            <article key={a.id} className="rounded-3xl p-7" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-semibold text-lg tracking-tight" style={{ color: 'var(--text)' }}>{a.acronym}</span>
                    {a.kind === 'orgao_publico' && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-muted)', color: 'var(--gold-strong)' }}>
                        Órgão público
                      </span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>{a.issuer}</div>
                  {a.parent && <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{a.parent}</div>}
                </div>
                {a.highlight && (
                  <div className="text-right flex-shrink-0">
                    <div className="font-heading font-semibold text-3xl tracking-tight" style={{ color: 'var(--gold-strong)' }}>{a.highlight.value}</div>
                    <div className="text-[11px] max-w-[8rem]" style={{ color: 'var(--text-dim)' }}>{a.highlight.label}</div>
                  </div>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>{a.period}</span>
                {a.areas.map((ar) => (
                  <span key={ar} className="px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>{areaLabel[ar]}</span>
                ))}
                {a.reference && <span className="w-full mt-1">{a.reference}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Documentação + processo */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
            Habilitação
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-8">
            Documentação pronta.
          </h2>
          <ul className="space-y-3.5">
            {documents.map((d) => (
              <li key={d} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--text)' }}>
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gold-strong)' }} />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
            Como funciona
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-8">
            Do edital à execução.
          </h2>
          <ol className="space-y-6">
            {steps.map((s) => (
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

      {/* Contratos em vigência (só aparecem os marcados como públicos no admin) */}
      {contracts.length > 0 && (
        <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
            Contratos públicos
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)] mb-10">
            Em vigência
          </h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Código', 'Órgão', 'Modalidade', 'Período', 'Status'].map((h, i) => (
                      <th
                        key={h}
                        className={`text-left px-6 py-5 font-medium text-xs uppercase tracking-wider ${i === 2 ? 'hidden md:table-cell' : i === 3 ? 'hidden sm:table-cell' : ''}`}
                        style={{ color: 'var(--text-dim)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{c.code}</td>
                      <td className="px-6 py-5 font-medium" style={{ color: 'var(--text)' }}>{c.client}</td>
                      <td className="px-6 py-5 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>{modalityLabel(c.modality)}</td>
                      <td className="px-6 py-5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(c.start_date)} – {formatDate(c.end_date)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: c.status === 'ativo' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.15)',
                            color: c.status === 'ativo' ? '#059669' : 'var(--gold-strong)',
                          }}
                        >
                          {c.status === 'ativo' ? 'Ativo' : 'Em licitação'}
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

      {/* Formulário */}
      <section id="proposta" className="container mx-auto px-6 md:px-10 max-w-5xl mb-24 md:mb-32 scroll-mt-28">
        <div className="text-center mb-12">
          <FileCheck2 size={28} className="mx-auto mb-4" style={{ color: 'var(--gold-strong)' }} />
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,5vw,3.5rem)] mb-4">
            Solicitar proposta
          </h2>
          <p className="text-lg font-light max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Para pregão, dispensa, adesão a ata ou pesquisa de preços. Só os campos com * são obrigatórios.
          </p>
        </div>
        <BidRequestForm />
        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Prefere conversar?{' '}
          <a href="https://wa.me/5561984222205" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--gold-strong)' }}>
            <MessageCircle size={14} /> (61) 98422-2205
          </a>
        </p>
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
