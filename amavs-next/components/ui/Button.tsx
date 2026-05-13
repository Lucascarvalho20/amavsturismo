'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'gold' | 'outline' | 'ghost' | 'wine' | 'navy'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  fullWidth?: boolean
}

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
    href?: never
  }

type ButtonAsAnchor = ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a'
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

const variantStyles: Record<ButtonVariant, string> = {
  gold: 'bg-gold text-navy-200 hover:bg-gold-200 active:bg-gold-300 shadow-glow-gold/30 hover:shadow-glow-gold font-semibold',
  outline: 'border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold active:bg-gold/20',
  ghost: 'text-gray-300 hover:text-gold hover:bg-white/5 active:bg-white/10',
  wine: 'bg-wine text-white hover:bg-wine-200 active:bg-wine-300 shadow-glow-wine/30 hover:shadow-glow-wine font-semibold',
  navy: 'bg-navy-100 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20 active:bg-white/5',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-5 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-lg rounded-xl gap-3',
}

export default function Button(props: ButtonProps) {
  const {
    variant = 'gold',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    fullWidth,
    ...rest
  } = props

  const classes = cn(
    'inline-flex items-center justify-center font-body font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-200',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  )

  const content = (
    <>
      {loading ? <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} /> : leftIcon}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </>
  )

  if (props.as === 'a') {
    const { as: _as, variant: _v, size: _s, loading: _l, leftIcon: _li, rightIcon: _ri, fullWidth: _fw, ...anchorRest } = rest as ButtonAsAnchor
    return (
      <a className={classes} {...anchorRest}>
        {content}
      </a>
    )
  }

  const { as: _as, variant: _v, size: _s, loading: _l, leftIcon: _li, rightIcon: _ri, fullWidth: _fw, ...buttonRest } = rest as ButtonAsButton
  return (
    <button className={classes} disabled={loading || (buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled} {...buttonRest}>
      {content}
    </button>
  )
}
