import type { Metadata } from 'next'
import { Building2, FileCheck, Shield, TrendingUp, ChevronDown, ArrowRight, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { formatDate, modalityLabel } from '@/lib/utils'
import type { Contract } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Licitações — Contratos Governamentais',
  description:
    "Amav's Turismo especializada em contratos públicos: pregão eletrônico, tomada de preços e dispensa de licitação em Brasília.",
}

const faqs = [
  {
    q: "Quais tipos de licitação a Amav's Turismo participa?",
    a: 'Pregão Eletrônico, Tomada de Preços, Concorrência Pública, Dispensa de Licitação e Inexigibilidade — todas as modalidades previstas na Lei 14.133/2021.',
  },
  {
    q: 'Qual a documentação necessária?',
    a: 'Fornecemos toda a documentação exigida pelos editais: certidões federais/estaduais/municipais, FGTS, trabalhistas, CRLV, CNH dos motoristas, RNTRC (ANTT), apólice de seguro de passageiros e regularidade da empresa.',
  },
  {
    q: 'Os veículos são vistoriados pelo DETRAN?',
    a: 'Sim, todos os veículos passam por inspeção anual do DETRAN-DF e manutenção preventiva. Laudo técnico atualizado disponível para os órgãos contratantes.',
  },
  {
    q: 'A empresa está cadastrada no SICAF?',
    a: 'Sim, estamos regularmente cadastrados no SICAF com todas as certidões dentro do prazo de validade.',
  },
  {
    q: 'É possível contratar sem licitação?',
    a: 'Sim. Para contratações de baixo valor é possível usar Dispensa de Licitação. Também atendemos por Inexigibilidade quando aplicável. Entre em contato para avaliar sua situação.',
  },
]

const advantages = [
  { icon: FileCheck,  title: 'Documentação completa', desc: 'SICAF, certidões, RNTRC, seguros e CNH dos motoristas sempre em dia.' },
  { icon: Shield,     title: 'Conformidade legal',    desc: 'Operação conforme Lei 14.133/2021 e exigências do TCU.' },
  { icon: TrendingUp, title: 'Histórico comprovado',  desc: 'Atuação em contratos com órgãos federais e distritais.' },
  { icon: Building2,  title: 'Atendimento gov.',      desc: 'Motoristas treinados para protocolos de órgãos públicos.' },
  { icon: FileCheck,  title: 'Rastreamento real-time', desc: 'GPS embarcado para controle e prestação de contas.' },
  { icon: Shield,     title: 'Seguro total',          desc: 'Apólice de passageiros conforme exigência dos editais.' },
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
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
        <div className="max-w-3xl">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Setor público
          </div>
          <h1 className="font-heading font-semibold tracking-tight leading-[1.02] text-[clamp(2.5rem,6vw,5rem)]">
            Especialistas em<br />
            <span className="text-gradient-gold">contratos públicos.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Documentação completa, SICAF regularizado e frota homologada para atender
            órgãos federais e distritais em Brasília e Entorno.
          </p>
        </div>
      </section>

      {/* Contracts table */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-medium tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
              Contratos públicos
            </div>
            <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3rem)]">
              Em vigência
            </h2>
          </div>
          <p className="text-sm font-light max-w-md" style={{ color: 'var(--text-muted)' }}>
            Lista atualizada automaticamente conforme novos contratos são cadastrados pelo administrador.
          </p>
        </div>
        {contracts.length === 0 ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              Nenhum contrato público em vigência divulgado no momento.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left px-6 py-5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Código</th>
                    <th className="text-left px-6 py-5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Órgão</th>
                    <th className="text-left px-6 py-5 font-medium text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-dim)' }}>Modalidade</th>
                    <th className="text-left px-6 py-5 font-medium text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--text-dim)' }}>Período</th>
                    <th className="text-left px-6 py-5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{contract.code}</td>
                      <td className="px-6 py-5 font-medium" style={{ color: 'var(--text)' }}>{contract.client}</td>
                      <td className="px-6 py-5 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>{modalityLabel(contract.modality)}</td>
                      <td className="px-6 py-5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(contract.start_date)} – {formatDate(contract.end_date)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: contract.status === 'ativo' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.15)',
                            color: contract.status === 'ativo' ? '#059669' : 'var(--gold-strong)',
                          }}
                        >
                          {contract.status === 'ativo' ? 'Ativo' : 'Em licitação'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Advantages */}
      <section className="container mx-auto px-6 md:px-10 max-w-7xl mb-24 md:mb-32">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Por que a Amav's
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3.25rem)]">
            Pronto para licitar.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 md:gap-x-16">
          {advantages.map((a) => {
            const Icon = a.icon
            return (
              <div key={a.title}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--gold-muted)' }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
                </div>
                <h3 className="font-heading font-semibold text-xl tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                  {a.title}
                </h3>
                <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {a.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 md:px-10 max-w-5xl mb-24 md:mb-32">
        <div className="text-center mb-16">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            FAQ
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,4vw,3.25rem)]">
            Perguntas frequentes.
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="rounded-2xl group"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-medium select-none list-none">
                <span style={{ color: 'var(--text)' }}>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className="flex-shrink-0 ml-3 transition-transform group-open:rotate-180"
                  style={{ color: 'var(--gold-strong)' }}
                />
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 md:px-10 max-w-4xl text-center">
        <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2rem,5vw,3.5rem)] mb-6">
          Precisa de uma<br />proposta para licitação?
        </h2>
        <p className="text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Nossa equipe prepara toda a documentação para participação em processos licitatórios.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/orcamento"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            Solicitar proposta
            <ArrowRight size={16} />
          </a>
          <a
            href="https://wa.me/5561984222205"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium transition-all"
            style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-md)' }}
          >
            <MessageCircle size={16} />
            Falar com especialista
          </a>
        </div>
      </section>
    </div>
  )
}
