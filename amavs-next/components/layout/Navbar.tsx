'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Phone, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/licitacoes', label: 'Setor público' },
  {
    label: 'Frota',
    href: '/frota',
    dropdown: [
      { href: '/frota?categoria=onibus', label: 'Ônibus' },
      { href: '/frota?categoria=micro', label: 'Micro-ônibus' },
      { href: '/frota?categoria=van', label: 'Vans' },
    ],
  },
  { href: '/orcamento', label: 'Orçamento' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Home page has the dark hero — navbar text should be white until scrolled
  const isHome = pathname === '/'
  const useDarkText = !isHome || scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || !isHome ? 'backdrop-blur-xl' : '',
        )}
        style={{
          background:
            scrolled || !isHome
              ? 'color-mix(in srgb, var(--bg) 88%, transparent)'
              : 'transparent',
          borderBottom: scrolled || !isHome ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="container mx-auto px-6 md:px-10 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Logo size="md" onDark={!useDarkText} />

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label} className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen((v) => !v)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: useDarkText ? 'var(--text)' : '#ffffff' }}
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
                          className={cn('transition-transform', dropdownOpen && 'rotate-180')}
                        />
                      </button>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 w-48 rounded-2xl overflow-hidden surface-card"
                            style={{ boxShadow: 'var(--shadow)' }}
                          >
                            <Link
                              href="/frota"
                              className="flex items-center px-4 py-3 text-sm hover:opacity-70 transition-opacity"
                              style={{ color: 'var(--text)' }}
                              onClick={() => setDropdownOpen(false)}
                            >
                              Ver toda a frota
                            </Link>
                            <div style={{ height: 1, background: 'var(--border)' }} />
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-sm hover:opacity-70 transition-opacity"
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => setDropdownOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
                    style={{ color: useDarkText ? 'var(--text)' : '#ffffff' }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+5561984222205"
                className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
                style={{ color: useDarkText ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)' }}
              >
                <Phone size={14} />
                <span>(61) 98422-2205</span>
              </a>
              <ThemeToggle size="sm" />
              <Link
                href="/contato"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: useDarkText ? 'var(--text)' : '#ffffff',
                  color: useDarkText ? 'var(--bg)' : '#000000',
                }}
              >
                Fale conosco
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle size="sm" />
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: useDarkText ? 'var(--text)' : '#ffffff' }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 backdrop-blur-xl"
              style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 top-14 bottom-0 flex flex-col gap-1 p-6 overflow-y-auto"
            >
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label}>
                      <Link
                        href="/frota"
                        className="flex items-center px-4 py-4 rounded-2xl text-xl font-medium transition-opacity hover:opacity-70"
                        style={{ color: 'var(--text)' }}
                      >
                        {link.label}
                      </Link>
                      <div className="ml-4 pl-4 mt-1 space-y-1" style={{ borderLeft: '1px solid var(--border)' }}>
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 text-base"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className="px-4 py-4 rounded-2xl text-xl font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text)' }}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="mt-8 pt-8 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                <a
                  href="tel:+5561984222205"
                  className="flex items-center gap-2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Phone size={16} />
                  <span>(61) 98422-2205</span>
                </a>
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-full text-base font-medium"
                  style={{ background: 'var(--text)', color: 'var(--bg)' }}
                >
                  Fale conosco
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
