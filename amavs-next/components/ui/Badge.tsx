import { cn } from '@/lib/utils'
import type { VehicleStatus, ContractStatus, LeadStatus } from '@/lib/types'

type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'gray' | 'amber'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-gold/20 text-gold border-gold/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  red: 'bg-wine/20 text-red-400 border-wine/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Auto-colored badge based on vehicle status
export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const map: Record<VehicleStatus, { variant: BadgeVariant; label: string }> = {
    disponivel: { variant: 'green', label: 'Disponível' },
    em_uso: { variant: 'blue', label: 'Em Uso' },
    manutencao: { variant: 'amber', label: 'Manutenção' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// Auto-colored badge based on contract status
export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const map: Record<ContractStatus, { variant: BadgeVariant; label: string }> = {
    ativo: { variant: 'green', label: 'Ativo' },
    encerrado: { variant: 'gray', label: 'Encerrado' },
    em_licitacao: { variant: 'blue', label: 'Em Licitação' },
    suspenso: { variant: 'red', label: 'Suspenso' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// Auto-colored badge based on lead status
export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, { variant: BadgeVariant; label: string }> = {
    pendente: { variant: 'amber', label: 'Pendente' },
    em_contato: { variant: 'blue', label: 'Em Contato' },
    aprovado: { variant: 'green', label: 'Aprovado' },
    recusado: { variant: 'red', label: 'Recusado' },
    convertido: { variant: 'gold', label: 'Convertido' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
