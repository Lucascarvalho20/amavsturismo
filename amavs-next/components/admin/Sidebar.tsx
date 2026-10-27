'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Bus,
  FileText,
  ScrollText,
  BarChart2,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Palette,
  Monitor,
  Images,
  Landmark,
  HelpCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase-browser'
import ThemeToggle from '@/components/ThemeToggle'
import toast from 'react-hot-toast'

interface SidebarProps {
  userEmail: string
}

const navItems = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/frota',        icon: Bus,             label: 'Frota' },
  { href: '/admin/licitacoes',   icon: Landmark,        label: 'Licitações' },
  { href: '/admin/orcamentos',   icon: FileText,        label: 'Orçamentos' },
  { href: '/admin/contratos',    icon: ScrollText,      label: 'Contratos' },
  { href: '/admin/galeria',      icon: Images,          label: 'Galeria' },
  { href: '/admin/relatorios',   icon: BarChart2,       label: 'Relatórios' },
  { href: '/admin/personalizar', icon: Palette,         label: 'Personalizar' },
  { href: '/admin/computadores', icon: Monitor,         label: 'Computadores' },
  { href: '/admin/perfil',       icon: User,            label: 'Perfil' },
  { href: '/admin/ajuda',        icon: HelpCircle,      label: 'Ajuda' },
]

function SidebarContent({
  userEmail,
  onClose,
}: {
  userEmail: string
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Sessão encerrada')
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <Logo size="md" href="/admin/dashboard" />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-gold/15 text-gold border border-gold/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} className={active ? 'text-gold' : 'text-gray-500 group-hover:text-gray-300'} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-gold/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            <p className="text-xs text-gray-600">Administrador</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <ThemeToggle size="sm" className="flex-shrink-0" />
          <span className="text-xs text-gray-500">Alternar tema</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-wine hover:bg-wine/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-100 border-r border-white/5 h-screen sticky top-0">
        <SidebarContent userEmail={userEmail} />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-navy-100 border border-white/10 flex items-center justify-center text-gray-300 hover:text-gold shadow-glass transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-navy-100 border-r border-white/10"
            >
              <SidebarContent userEmail={userEmail} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
