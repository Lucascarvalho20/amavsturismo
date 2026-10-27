'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppFAB() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
    setShowTooltip(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip bubble */}
      <AnimatePresence>
        {showTooltip && !dismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25 }}
            className="relative bg-navy-100 border border-white/10 rounded-2xl rounded-br-sm px-4 py-3 shadow-glass max-w-[220px]"
          >
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-navy-100 border border-white/20 flex items-center justify-center text-gray-400 hover:text-gold transition-colors"
              aria-label="Fechar"
            >
              <X size={10} />
            </button>
            <p className="text-white text-sm font-medium leading-snug">
              Proposta ou orçamento? 🚌
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Fale direto com a equipe pelo WhatsApp
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <a
        href="https://wa.me/5561984222205?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20fretamento!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        onClick={() => setShowTooltip(false)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-transform hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        }}
      >
        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping-slow opacity-30" />
        <MessageCircle size={26} className="text-white relative z-10" fill="white" />
      </a>
    </div>
  )
}
