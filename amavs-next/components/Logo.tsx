'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon'
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
  /** Texto claro, para usar sobre fundo escuro (ex.: hero da página inicial). */
  onDark?: boolean
}

const sizes = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 44, text: 'text-base' },
  lg: { icon: 56, text: 'text-lg' },
}

/**
 * Amav's — selo "cena moderna" (identidade nova).
 *
 * Círculo com céu, sol, montanhas (verde + navio), estrada e avião de papel.
 * Geometria fiel ao logo novo; o único acento vermelho original (a estrada)
 * foi convertido para o dourado da marca (#D4AF37).
 */
function LogoIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Amav's Turismo"
    >
      <defs>
        <clipPath id="amavs-circle-clip">
          <circle cx="50" cy="50" r="47" />
        </clipPath>
      </defs>

      {/* Base escura do selo */}
      <circle cx="50" cy="50" r="47" fill="#1A1820" />

      {/* Cena (clipada dentro do círculo) */}
      <g clipPath="url(#amavs-circle-clip)">
        {/* Céu e chão */}
        <rect x="0" y="0" width="100" height="60" fill="#8FB6CE" />
        <rect x="0" y="60" width="100" height="40" fill="#F5F2EA" />

        {/* Sol */}
        <circle cx="32" cy="34" r="8.5" fill="#F0C24A" />

        {/* Montanha verde (fundo) */}
        <path d="M-2 60 L24 24 L52 60 Z" fill="#5F7E57" />
        {/* Montanha navy (frente) */}
        <path d="M36 60 L66 28 L100 60 Z" fill="#1A1820" opacity="0.88" />

        {/* Estrada (vermelho original → dourado da marca) */}
        <path d="M47 60 L53 60 L64 96 L36 96 Z" fill="#D4AF37" />
        {/* Faixa central tracejada */}
        <g
          stroke="#F5F2EA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 5"
        >
          <line x1="50" y1="62" x2="50" y2="96" />
        </g>

        {/* Avião de papel subindo */}
        <g transform="translate(80 22) rotate(14) scale(0.9)">
          <path
            d="M0 0 L-22 7 L-13 11 L-15 22 Z"
            fill="#F5F2EA"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Aro interno claro */}
      <circle
        cx="50"
        cy="50"
        r="45.5"
        fill="none"
        stroke="#F5F2EA"
        strokeWidth="2"
        opacity="0.85"
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
            className={cn(
              'font-heading font-bold uppercase tracking-tight',
              s.text,
            )}
            style={{ color: primaryColor }}
          >
            AMAV<span style={{ color: 'var(--gold)' }}>&apos;</span>S
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
