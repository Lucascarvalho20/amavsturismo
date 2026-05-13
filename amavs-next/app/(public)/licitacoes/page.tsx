import type { Metadata } from 'next'
import { Building2, FileCheck, Shield, TrendingUp, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { formatDate, modalityLabel } from '@/lib/utils'
import { ContractStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Contract } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Licitações — Contratos Governamentais',
  description:
    "Amav's Turismo especializada em contratos públicos: pregão eletrônico, tomada de preços e dispensa de licitação para órgãos federais e distritais em Brasília.",
}

const govPartners = [
  { acronym: 'MEC', name: 'Ministério da Educação' },
  { acronym: 'MS', name: 'Ministério da Saúde' },
  { acronym: 'SESI', name: 'SESI-DF' },
  { acronym: 'SENAC', name: 'SENAC-DF' },
  { acronym: 'TJDF', name: 'Tribunal de Justiça do DF' },
  { acronym: 'CLDF', name: 'Câmara Legislativa do DF' },
  { acronym: 'SEBRAE', name: 'SEBRAE-DF' },
  { acronym: 'EMBRAPA', name: 'EMBRAPA Brasília' },
]

const faqs = [
  {
    q: "Quais tipos de licitação a Amav's Turismo participa?",
    a: 'Participamos de Pregão Eletrônico (modalidade mais comum no governo federal), Tomada de Preços, Concorrência Pública, Dispensa de Licitação e Inexigibilidade. Nossa equipe tem ampla experiência em todas as modalidades previstas na Lei 14.133/2021 (Nova Lei de Licitações).',
  },
  {
    q: 'Qual a documentação necessária para contratar por licitação?',
    a: 'Fornecemos toda a documentação exigida pelos editais: Certidão Negativa de Débitos Federais, Estaduais e Municipais, FGTS, Trabalhistas, além de CRLV dos veículos, CNH dos motoristas, RNTRC (ANTT), apólice de seguro de passageiros e certidão de regularidade da empresa.',
  },
  {
    q: 'Os veículos são vistoriados pelo DETRAN?',
    a: 'Sim, todos os veículos da frota passam por inspeção anual do DETRAN-DF e manutenção preventiva semestral. Mantemos laudo técnico atualizado disponível para os órgãos contratantes.',
  },
  {
    q: 'A empresa está cadastrada no SICAF?',
    a: 'Sim, estamos regularmente cadastrados no SICAF (Sistema de Cadastramento Unificado de Fornecedores) com todas as certidões dentro do prazo de validade, facilitando a participação em processos licitatórios federais.',
  },
  {
    q: 'É possível contratar sem licitação?',
    a: 'Sim. Para contratações de baixo valor (até R$ 57.900 para serviços), é possível utilizar a Dispensa de Licitação. Também atendemos por Inexigibilidade de Licitação quando há exclusividade de serviço ou fornecedor singular. Entre em contato para avaliar sua situação específica.',
  },
]

export default async function LicitacoesPage() {
  let contracts: Contract[] = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('contracts')
      .select('id, code, client, modality, status, start_date, end_date')
      .in('status', ['ativo', 'em_licitacao'])
      .order('start_date', { ascending: false })
    contracts = (data ?? []) as Contract[]
  } catch {
    contracts = []
  }

  const activeCount = contracts.filter((c) => c.status === 'ativo').length
  const totalCount = contracts.length

  const trustStats = [
    { value: '15+', label: 'Anos de Experiência' },
    { value: String(activeCount || '—'), label: 'Contratos Ativos' },
    { value: '100%', label: 'Documentação Regular' },
    { value: totalCount > 0 ? String(totalCount) : '—', label: 'Contratos Realizados' },
  ]

  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero */}
        <div className="text-center mb-14">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase font-heading">
            Setor Público
          </span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mt-2 mb-3 leading-tight">
            Especialistas em
            <br />
            <span className="text-gradient-gold">Contratos Governamentais</span>
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-3 leading-relaxed">
            Documentação completa, SICAF regularizado e frota homologada para atender órgãos
            federais e distritais em Brasília e Entorno.
          </p>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {trustStats.map((stat) => (
            <div key={stat.label} className="glass-gold rounded-2xl p-5 text-center">
              <div className="font-heading font-black text-3xl text-gold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Gov partners */}
        <section className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-white text-center mb-2">
            Órgãos que já nos Contrataram
          </h2>
          <div className="gold-divider-center mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {govPartners.map((p) => (
              <div
                key={p.acronym}
                className="glass-dark rounded-xl p-4 text-center hover:border-gold/20 transition-all"
              >
                <div className="font-heading font-black text-xl text-gold mb-1">{p.acronym}</div>
                <div className="text-gray-400 text-xs leading-tight">{p.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contracts table */}
        <section className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-white text-center mb-2">
            Contratos Recentes
          </h2>
          <div className="gold-divider-center mb-8" />
          {contracts.length === 0 ? (
            <div className="glass-dark rounded-2xl p-10 text-center">
              <p className="text-gray-500">Nenhum contrato público disponível no momento.</p>
            </div>
          ) : (
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Código</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Órgão</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">Modalidade</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">Período</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-5 py-3.5 text-gray-300 font-mono text-xs">{contract.code}</td>
                        <td className="px-5 py-3.5 text-white">{contract.client}</td>
                        <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{modalityLabel(contract.modality)}</td>
                        <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell text-xs">
                          {formatDate(contract.start_date)} – {formatDate(contract.end_date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <ContractStatusBadge status={contract.status} />
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
        <section className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-white text-center mb-2">
            Por que Contratar a Amav&apos;s para Licitações?
          </h2>
          <div className="gold-divider-center mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FileCheck,
                title: 'Documentação Completa',
                desc: 'SICAF, certidões, RNTRC, seguros e CNH dos motoristas sempre em dia.',
              },
              {
                icon: Shield,
                title: 'Conformidade Legal',
                desc: 'Conhecimento pleno da Lei 14.133/2021 e das exigências do TCU.',
              },
              {
                icon: TrendingUp,
                title: 'Histórico Comprovado',
                desc: 'Contratos com MEC, TJDF, SESI e SENAC sem ocorrências.',
              },
              {
                icon: Building2,
                title: 'Atendimento Governamental',
                desc: 'Motoristas treinados para protocolos e procedimentos de órgãos públicos.',
              },
              {
                icon: FileCheck,
                title: 'Rastreamento em Tempo Real',
                desc: 'GPS embarcado em todos os veículos para controle e prestação de contas.',
              },
              {
                icon: Shield,
                title: 'Seguro Total',
                desc: 'Apólice de seguro de passageiros conforme exigência dos editais públicos.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="glass-dark rounded-xl p-5">
                  <Icon size={20} className="text-gold mb-3" />
                  <h3 className="font-heading font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-white text-center mb-2">
            Perguntas Frequentes
          </h2>
          <div className="gold-divider-center mb-8" />
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-dark rounded-xl group">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium select-none list-none">
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="text-gold flex-shrink-0 ml-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="glass-dark rounded-2xl p-8 text-center border-t-2 border-gold/50">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-white mb-3">
            Precisa de uma Proposta para Licitação?
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Nossa equipe prepara toda a documentação necessária para participação em processos
            licitatórios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button as="a" href="/orcamento" variant="gold" size="lg">
              Solicitar Proposta
            </Button>
            <Button as="a" href="https://wa.me/5561984222205" variant="outline" size="lg">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
