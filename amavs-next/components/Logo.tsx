'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon'
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
  /** Force light text (use when overlay on a dark background — eg hero) */
  onDark?: boolean
}

const sizes = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 44, text: 'text-base' },
  lg: { icon: 56, text: 'text-lg' },
}

/**
 * Amav's logo — modernização fiel da identidade original.
 *
 * Mantém o conceito histórico (oval · céu · montanhas · estrada · avião)
 * com linhas refinadas, gradientes suaves e um aro dourado sutil que
 * conecta a marca à paleta do site.
 */
function LogoIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="amavs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#82B8DD" />
          <stop offset="55%" stopColor="#A8CFE4" />
          <stop offset="100%" stopColor="#F1D5AA" />
        </linearGradient>
        <linearGradient id="amavs-mtn-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8662F" />
          <stop offset="100%" stopColor="#B14B20" />
        </linearGradient>
        <linearGradient id="amavs-mtn-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E18654" />
          <stop offset="100%" stopColor="#C66838" />
        </linearGradient>
        <linearGradient id="amavs-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8472B" />
          <stop offset="100%" stopColor="#7E331E" />
        </linearGradient>
        <linearGradient id="amavs-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B68A1F" />
          <stop offset="50%" stopColor="#F5D97A" />
          <stop offset="100%" stopColor="#B68A1F" />
        </linearGradient>
        <clipPath id="amavs-oval-clip">
          <ellipse cx="50" cy="50" rx="46" ry="40" />
        </clipPath>
      </defs>

      {/* Conteúdo da insígnia (clipado dentro do oval) */}
      <g clipPath="url(#amavs-oval-clip)">
        {/* Céu com leve gradiente para o pôr-do-sol */}
        <rect x="0" y="0" width="100" height="100" fill="url(#amavs-sky)" />

        {/* Nuvens */}
        <g opacity="0.9">
          <ellipse cx="24" cy="24" rx="7" ry="2.2" fill="#FFFFFF" />
          <ellipse cx="30" cy="22" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.7" />
          <ellipse cx="74" cy="28" rx="8" ry="2.6" fill="#FFFFFF" />
          <ellipse cx="68" cy="26" rx="4" ry="1.4" fill="#FFFFFF" opacity="0.7" />
        </g>

        {/* Montanhas do fundo */}
        <path
          d="M-4 72 L18 44 L36 60 L54 38 L72 56 L88 42 L104 72 Z"
          fill="url(#amavs-mtn-back)"
        />

        {/* Montanhas da frente */}
        <path
          d="M-4 82 L10 60 L26 78 L42 52 L58 76 L74 56 L92 80 L104 82 L104 100 L-4 100 Z"
          fill="url(#amavs-mtn-front)"
        />

        {/* Estrada / chão */}
        <rect x="0" y="80" width="100" height="20" fill="url(#amavs-road)" />

        {/* Faixa central da estrada (tracejada) */}
        <g fill="#F5D97A" opacity="0.75">
          <rect x="16" y="89" width="10" height="2" rx="1" />
          <rect x="34" y="89" width="10" height="2" rx="1" />
          <rect x="52" y="89" width="10" height="2" rx="1" />
          <rect x="70" y="89" width="10" height="2" rx="1" />
        </g>

        {/* Avião estilizado em vôo (subindo para a direita) */}
        <g transform="translate(48 36) rotate(-14)">
          {/* Fuselagem */}
          <path
            d="M-16 0 L9 -1.5 L18 -6 L15 0.5 L21 2.5 L15 4.5 L9 11 L4 3 L-16 3 Z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
          {/* Trilho/estela */}
          <path
            d="M-20 1 L-12 1"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M-26 1 L-22 1"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>
      </g>

      {/* Aro externo dourado (assinatura do site) */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="40"
        fill="none"
        stroke="url(#amavs-ring)"
        strokeWidth="2"
      />
      {/* Sombra interna sutil pra dar profundidade */}
      <ellipse
        cx="50"
        cy="50"
        rx="44.5"
        ry="38.5"
        fill="none"
        stroke="#000000"
        strokeOpacity="0.08"
        strokeWidth="0.8"
      />
    </svg>
  )
}

export default function Logo({
  variant = 'full',
  className,
  href = '/',
  size = 'md',
  onDark = false,
}: LogoProps) {
  const s = sizes[size]
  const primaryColor = onDark ? '#FFFFFF' : 'var(--text)'
  const secondaryColor = onDark ? 'rgba(255,255,255,0.6)' : 'var(--text-dim)'

  const content = (
    <span className={cn('flex items-center gap-3 select-none', className)}>
      <LogoIcon size={s.icon} />
      {variant === 'full' && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn('font-heading font-semibold tracking-tight', s.text)}
            style={{ color: primaryColor }}
          >
            Amav&apos;s
          </span>
          <span
            className={cn(
              'font-heading font-medium tracking-[0.28em] uppercase',
              size === 'sm'
                ? 'text-[8px]'
                : size === 'md'
                  ? 'text-[10px]'
                  : 'text-[11px]',
            )}
            style={{ color: secondaryColor }}
          >
            Turismo
          </span>
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] rounded-lg"
      >
        {content}
      </Link>
    )
  }

  return content
}
