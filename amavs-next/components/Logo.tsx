'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon'
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 40, text: 'text-base' },
  lg: { icon: 52, text: 'text-lg' },
}

function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Hexagon background */}
      <path
        d="M50 5 L92 27.5 L92 72.5 L50 95 L8 72.5 L8 27.5 Z"
        fill="#0D1B2A"
        stroke="#D4AF37"
        strokeWidth="3"
      />
      {/* Road / ground */}
      <rect x="15" y="65" width="70" height="4" rx="2" fill="#D4AF37" opacity="0.3" />
      {/* Bus body */}
      <rect x="20" y="42" width="60" height="26" rx="4" fill="#D4AF37" opacity="0.9" />
      {/* Bus roof */}
      <rect x="24" y="38" width="52" height="8" rx="3" fill="#D4AF37" />
      {/* Windows */}
      <rect x="26" y="44" width="10" height="8" rx="1.5" fill="#0D1B2A" opacity="0.8" />
      <rect x="40" y="44" width="10" height="8" rx="1.5" fill="#0D1B2A" opacity="0.8" />
      <rect x="54" y="44" width="10" height="8" rx="1.5" fill="#0D1B2A" opacity="0.8" />
      <rect x="68" y="44" width="9" height="8" rx="1.5" fill="#0D1B2A" opacity="0.8" />
      {/* Door */}
      <rect x="27" y="55" width="8" height="12" rx="1" fill="#0D1B2A" opacity="0.7" />
      {/* Headlights */}
      <rect x="76" y="50" width="5" height="4" rx="1" fill="#f5e99a" />
      {/* Wheels */}
      <circle cx="32" cy="69" r="5" fill="#1a2e42" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="68" cy="69" r="5" fill="#1a2e42" stroke="#D4AF37" strokeWidth="1.5" />
      {/* Wheel hubcaps */}
      <circle cx="32" cy="69" r="2" fill="#D4AF37" />
      <circle cx="68" cy="69" r="2" fill="#D4AF37" />
    </svg>
  )
}

export default function Logo({ variant = 'full', className, href = '/', size = 'md' }: LogoProps) {
  const s = sizes[size]

  const content = (
    <span className={cn('flex items-center gap-2.5 select-none', className)}>
      <LogoIcon size={s.icon} />
      {variant === 'full' && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              'font-heading font-bold text-gold tracking-wide',
              s.text
            )}
          >
            AMAV'S
          </span>
          <span
            className={cn(
              'font-heading font-semibold text-gray-300 tracking-widest',
              size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px]' : 'text-xs'
            )}
          >
            TURISMO
          </span>
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg">
        {content}
      </Link>
    )
  }

  return content
}
