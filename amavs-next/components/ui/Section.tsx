'use client'

import React from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  as?: 'section' | 'div' | 'article'
  delay?: number
}

export default function Section({ children, className, id, as: Tag = 'section', delay = 0 }: SectionProps) {
  const ref = React.useRef<HTMLElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-80px' })

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag id={id} ref={ref as any} className={cn('relative', className)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay }}
      >
        {children}
      </motion.div>
    </Tag>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  titleClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-12', align === 'center' ? 'text-center' : 'text-left')}>
      {eyebrow && (
        <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-3 block font-heading">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'font-heading font-bold text-3xl md:text-4xl text-white leading-tight',
          titleClassName
        )}
      >
        {title}
      </h2>
      <div className={cn('gold-divider', align === 'center' ? 'gold-divider-center' : '')} />
      {subtitle && (
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}
