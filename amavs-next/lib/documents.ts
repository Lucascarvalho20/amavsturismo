// Documentos de habilitação (certidões, alvarás, apólices…) e suas validades.
// Em licitação, certidão vencida no dia da sessão = inabilitação.

export const DOC_CATEGORIES = ['fiscal', 'trabalhista', 'juridica', 'tecnica', 'economica', 'veiculos', 'outro'] as const
export type DocCategory = (typeof DOC_CATEGORIES)[number]

export const docCategoryLabel: Record<DocCategory, string> = {
  fiscal: 'Regularidade fiscal',
  trabalhista: 'Trabalhista',
  juridica: 'Habilitação jurídica',
  tecnica: 'Qualificação técnica',
  economica: 'Econômico-financeira',
  veiculos: 'Veículos e transporte',
  outro: 'Outro',
}

/** Sugestões para o campo "nome" — os documentos mais pedidos em editais de transporte. */
export const COMMON_DOCUMENTS: Array<{ name: string; category: DocCategory; issuer?: string }> = [
  { name: 'CND Federal (Receita/PGFN)', category: 'fiscal', issuer: 'Receita Federal' },
  { name: 'Certidão de Regularidade do FGTS (CRF)', category: 'fiscal', issuer: 'Caixa' },
  { name: 'Certidão Negativa de Débitos do GDF', category: 'fiscal', issuer: 'SEEC-DF' },
  { name: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', category: 'trabalhista', issuer: 'TST' },
  { name: 'Certidão de Falência e Recuperação Judicial', category: 'economica', issuer: 'TJDFT' },
  { name: 'Registro no SICAF', category: 'juridica', issuer: 'Compras.gov.br' },
  { name: 'Contrato social e alterações', category: 'juridica' },
  { name: 'Balanço patrimonial', category: 'economica' },
  { name: 'RNTRC / Registro ANTT', category: 'veiculos', issuer: 'ANTT' },
  { name: 'Apólice de seguro de passageiros (RC)', category: 'veiculos' },
  { name: 'Alvará de funcionamento', category: 'juridica' },
]

export type DocStatus = 'valido' | 'vencendo' | 'vencido' | 'sem_validade'

export const docStatusLabel: Record<DocStatus, string> = {
  valido: 'Válido',
  vencendo: 'Vence em breve',
  vencido: 'Vencido',
  sem_validade: 'Sem validade',
}

/**
 * Situação de um documento em relação a hoje.
 * `warnDays` = antecedência do alerta (padrão 15 dias: tempo de emitir uma certidão nova).
 * Datas em YYYY-MM-DD; o documento vale até o fim do dia de vencimento.
 */
export function documentStatus(
  expiresAt: string | null | undefined,
  today: Date = new Date(),
  warnDays = 15,
): { status: DocStatus; daysLeft: number | null } {
  if (!expiresAt) return { status: 'sem_validade', daysLeft: null }
  const [y, m, d] = expiresAt.split('-').map(Number)
  const exp = Date.UTC(y, m - 1, d)
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const daysLeft = Math.round((exp - now) / 86_400_000)
  if (daysLeft < 0) return { status: 'vencido', daysLeft }
  if (daysLeft <= warnDays) return { status: 'vencendo', daysLeft }
  return { status: 'valido', daysLeft }
}
