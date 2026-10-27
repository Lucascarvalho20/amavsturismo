// Atestados de capacidade técnica emitidos à Amav's Turismo (CNPJ 06.071.701/0001-06).
// Fonte: documentos originais publicados no site antigo (amavsturismo.com, 2019).
// Os documentos completos (com assinaturas) NÃO são publicados — ficam disponíveis
// para comissões de licitação mediante solicitação.

export type AtestadoKind = 'orgao_publico' | 'entidade'
export type AtestadoArea = 'transporte' | 'eventos' | 'passagens'

export interface Atestado {
  id: string
  issuer: string
  acronym: string
  parent?: string
  kind: AtestadoKind
  areas: AtestadoArea[]
  period: string
  /** Data de emissão do atestado (quando legível no documento) */
  issuedAt?: string
  /** Número em destaque (ex.: "80+") e o que ele mede */
  highlight?: { value: string; label: string }
  summary: string
  reference?: string
}

export const atestados: Atestado[] = [
  {
    id: 'cmb',
    issuer: 'Colégio Militar de Brasília',
    acronym: 'CMB',
    parent: 'Ministério da Defesa · Exército Brasileiro',
    kind: 'orgao_publico',
    areas: ['transporte', 'passagens'],
    period: '2010 – 2017',
    issuedAt: '2017-12-19',
    highlight: { value: '80+', label: 'veículos em comboio' },
    summary:
      'Transporte rodoviário interestadual e urbano com ônibus de turismo, ônibus urbanos, micro-ônibus e vans executivas nos Jogos da Amizade (Brasília 2010, Curitiba 2011 e 2017) e na Parada Militar de 7 de Setembro de 2010 a 2016.',
  },
  {
    id: 'cfc',
    issuer: 'Conselho Federal de Contabilidade',
    acronym: 'CFC',
    parent: 'Autarquia federal',
    kind: 'orgao_publico',
    areas: ['transporte', 'eventos'],
    period: 'Set/2016',
    issuedAt: '2016-10-24',
    highlight: { value: '132', label: 'veículos em um único evento' },
    summary:
      '90 ônibus de turismo, 34 vans e 8 micro-ônibus, além de 102 monitores, 26 recepcionistas e 6 coordenadores, para o 20º Congresso Brasileiro de Contabilidade em Fortaleza-CE.',
    reference: 'Pregão Eletrônico nº 17/2016 · Processo nº 2016/000699',
  },
  {
    id: '22bi',
    issuer: '22º Batalhão de Infantaria',
    acronym: '22º BI',
    parent: 'Ministério da Defesa · Exército Brasileiro',
    kind: 'orgao_publico',
    areas: ['transporte'],
    period: '2018',
    issuedAt: '2019-02-07',
    highlight: { value: '30+', label: 'veículos em operação eleitoral' },
    summary:
      'Transporte estadual e urbano em Palmas-TO com ônibus, micro-ônibus, veículos e caminhonetes na eleição suplementar para governador do Tocantins e nas eleições gerais de 2018 (1º e 2º turnos).',
  },
  {
    id: 'eme',
    issuer: 'Estado-Maior do Exército',
    acronym: 'EME',
    parent: 'Ministério da Defesa · Exército Brasileiro',
    kind: 'orgao_publico',
    areas: ['transporte'],
    period: '2019',
    issuedAt: '2019-01-22',
    highlight: { value: '65', label: 'diárias de veículo executivo' },
    summary: 'Locação de veículo executivo sedã com motorista para o Estado-Maior do Exército em Brasília-DF.',
    reference: 'Nota de Empenho 2018NE800001',
  },
  {
    id: 'mpt',
    issuer: 'Ministério Público do Trabalho',
    acronym: 'MPT',
    parent: 'Procuradoria-Geral do Trabalho',
    kind: 'orgao_publico',
    areas: ['eventos'],
    period: '2012 – 2015',
    issuedAt: '2015-11-16',
    highlight: { value: '9.900', label: 'diárias de hospedagem/ano' },
    summary: 'Agenciamento de hospedagem em hotéis de 3 a 5 estrelas em Brasília-DF.',
    reference: 'Contrato nº 29/2012 (3º Termo Aditivo)',
  },
  {
    id: 'ms-unesco',
    issuer: 'Departamento de DST, Aids e Hepatites Virais',
    acronym: 'MS / UNESCO',
    parent: 'Ministério da Saúde · Projeto 914 BRA 1101',
    kind: 'orgao_publico',
    areas: ['eventos'],
    period: 'Mai/2012',
    issuedAt: '2012-06-26',
    summary:
      'Vencedora de processo licitatório para hospedagem, alimentação, salas e equipamentos de evento internacional em Manágua (Nicarágua).',
    reference: 'Processo nº 069/2012 · Contrato UNESCO ED00649/2012',
  },
  {
    id: 'ifsuldeminas',
    issuer: 'Instituto Federal do Sul de Minas Gerais',
    acronym: 'IFSULDEMINAS',
    parent: 'Ministério da Educação',
    kind: 'orgao_publico',
    areas: ['passagens'],
    period: '2014',
    summary: 'Agenciamento de viagens: cotação, reserva, emissão, remarcação e cancelamento de passagens aéreas nacionais e internacionais.',
    reference: 'Contrato nº 01/2014',
  },
  {
    id: 'fenapef',
    issuer: 'Federação Nacional dos Policiais Federais',
    acronym: 'FENAPEF',
    kind: 'entidade',
    areas: ['transporte', 'eventos', 'passagens'],
    period: '2012',
    issuedAt: '2012-02-02',
    summary:
      'Receptivo aeroporto/hotel em vans executivas (15 lugares) e micro-ônibus executivo (26 lugares), hospedagem, salas, áudio e vídeo e passagens aéreas.',
  },
  {
    id: 'ibrad',
    issuer: 'Instituto Brasileiro de Administração para o Desenvolvimento',
    acronym: 'IBRAD',
    kind: 'entidade',
    areas: ['transporte', 'eventos', 'passagens'],
    period: '2012',
    issuedAt: '2012-02-02',
    summary:
      'Receptivo aeroporto/hotel em vans executivas e micro-ônibus executivo, hospedagem, coffee-break, salas e equipamentos de áudio e vídeo.',
  },
  {
    id: 'gob',
    issuer: 'Grande Oriente do Brasil',
    acronym: 'GOB',
    kind: 'entidade',
    areas: ['eventos'],
    period: '2013',
    issuedAt: '2013-07-15',
    summary: 'Tradução simultânea (inglês, espanhol, francês e Libras), recepcionistas e locação de áudio e vídeo.',
  },
]

export const publicAtestados = atestados.filter((a) => a.kind === 'orgao_publico')

/** Ano do primeiro contrato público comprovado por atestado. */
export const firstPublicContractYear = 2010

export const areaLabel: Record<AtestadoArea, string> = {
  transporte: 'Transporte',
  eventos: 'Eventos e hospedagem',
  passagens: 'Passagens aéreas',
}

/** Dados cadastrais que as comissões de licitação pedem com frequência. */
export const companyInfo = {
  legalName: "AMAV'S TURISMO LTDA",
  cnpj: '06.071.701/0001-06',
}
