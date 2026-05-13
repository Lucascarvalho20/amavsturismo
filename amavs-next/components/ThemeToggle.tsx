'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-white/5',
          size === 'sm' ? 'w-8 h-8' : 'w-9 h-9',
          className
        )}
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      className={cn(
        'flex items-center justify-center rounded-xl transition-all duration-200',
        'border border-white/10 hover:border-gold/30',
        'bg-white/5 hover:bg-gold/10',
        'text-gray-400 hover:text-gold',
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9',
        className
      )}
    >
      {isDark
        ? <Sun size={size === 'sm' ? 14 : 16} />
        : <Moon size={size === 'sm' ? 14 : 16} />
      }
    </button>
  )
}
