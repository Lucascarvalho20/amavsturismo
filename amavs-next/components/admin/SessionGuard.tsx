'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const INACTIVE_TIMEOUT_MS = 30 * 60 * 1000  // 30 min
const WARNING_BEFORE_MS = 2 * 60 * 1000     // Show warning 2 min before

export default function SessionGuard() {
  const router = useRouter()
  const supabase = createClient()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const logout = useCallback(async () => {
    setShowWarning(false)
    await supabase.auth.signOut()
    router.push('/admin/login?reason=inactivity')
  }, [router, supabase])

  const resetTimer = useCallback(() => {
    setShowWarning(false)
    setCountdown(120)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(120)
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current!)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, INACTIVE_TIMEOUT_MS - WARNING_BEFORE_MS)

    timeoutRef.current = setTimeout(() => {
      logout()
    }, INACTIVE_TIMEOUT_MS)
  }, [logout])

  useEffect(() => {
    resetTimer()

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    const handleActivity = () => {
      if (!showWarning) resetTimer()
    }

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))

    // Check session on window focus
    const handleFocus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      window.removeEventListener('focus', handleFocus)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [resetTimer, showWarning, supabase, router])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-dark border border-gold/20 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-glass-gold">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gold" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-white text-xl mb-2">Sessão Expirando</h3>
        <p className="text-gray-400 text-sm mb-2">
          Sua sessão será encerrada por inatividade em:
        </p>
        <div className="text-4xl font-heading font-black text-gold mb-6">
          {String(Math.floor(countdown / 60)).padStart(2, '0')}:
          {String(countdown % 60).padStart(2, '0')}
        </div>
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sair agora
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 py-2.5 rounded-xl bg-gold text-navy-200 font-semibold text-sm hover:bg-gold-200 transition-colors"
          >
            Continuar sessão
          </button>
        </div>
      </div>
    </div>
  )
}
