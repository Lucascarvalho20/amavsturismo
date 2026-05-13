'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'
import Logo from '@/components/Logo'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Início' },
  {
    label: 'Frota',
    href: '/frota',
    dropdown: [
      { href: '/frota?categoria=onibus', label: 'Ônibus' },
      { href: '/frota?categoria=micro', label: 'Micro-ônibus' },
      { href: '/frota?categoria=van', label: 'Vans' },
    ],
  },
  { href: '/licitacoes', label: 'Licitações' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
          scrolled
            ? 'bg-navy-200/95 backdrop-blur-md shadow-glass border-b border-white/5'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label} className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen((v) => !v)}
                        className={cn(
                          'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          pathname.startsWith('/frota')
                            ? 'text-gold'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        )}
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
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1.5 w-44 glass-dark rounded-xl overflow-hidden shadow-glass-gold border border-gold/20"
                          >
                            <Link
                              href="/frota"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              Ver toda a frota
                            </Link>
                            <div className="h-px bg-white/5 mx-3" />
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors"
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
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-gold'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+5561984222205"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gold transition-colors"
              >
                <Phone size={14} />
                <span>(61) 98422-2205</span>
              </a>
              <ThemeToggle size="sm" />
              <Button
                as="a"
                href="/orcamento"
                variant="gold"
                size="sm"
              >
                Solicitar Orçamento
              </Button>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle size="sm" />
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-lg text-gray-300 hover:text-gold hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-navy-200/95 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="absolute right-0 top-0 bottom-0 w-72 bg-navy-100 border-l border-white/10 p-6 pt-20 flex flex-col gap-1">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label}>
                      <Link
                        href="/frota"
                        className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:text-gold hover:bg-white/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                      <div className="ml-4 border-l border-white/10 pl-4 mt-1 space-y-1">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-gray-400 hover:text-gold transition-colors"
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
                    className={cn(
                      'px-4 py-3 rounded-xl text-base font-medium transition-colors',
                      pathname === link.href
                        ? 'text-gold bg-gold/10'
                        : 'text-gray-200 hover:text-gold hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                <a
                  href="tel:+5561984222205"
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
                >
                  <Phone size={16} />
                  <span>(61) 98422-2205</span>
                </a>
                <Button as="a" href="/orcamento" variant="gold" size="md" fullWidth>
                  Solicitar Orçamento
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
