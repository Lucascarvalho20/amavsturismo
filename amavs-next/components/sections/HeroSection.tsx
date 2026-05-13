'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'

const trust = [
  'SICAF Regularizado',
  'RNTRC / ANTT',
  'CNH categoria E',
  'Seguro de Passageiros',
]

const stats = [
  { value: '500+', label: 'Viagens' },
  { value: '15+', label: 'Anos' },
  { value: '4', label: 'Contratos Gov.' },
  { value: '6', label: 'Veículos' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
      {/* Subtle gold glow behind visual side */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[50vw] h-[70vh] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full container mx-auto px-4 md:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">

          {/* ── Left: Text ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col justify-center"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">
                Brasília · Distrito Federal
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-black leading-[0.92] tracking-tight mb-6">
              <span className="block text-white text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                A Frota Certa
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F5D97A 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Para Cada
              </span>
              <span className="block text-white text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                Viagem.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              Ônibus, micro-ônibus e vans com documentação regularizada, motoristas habilitados e
              15 anos de experiência em contratos públicos e privados.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button as="a" href="/orcamento" variant="gold" size="lg" rightIcon={<ArrowRight size={18} />}>
                Solicitar Orçamento Grátis
              </Button>
              <Button as="a" href="/frota" variant="outline" size="lg">
                Conhecer a Frota
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {trust.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <CheckCircle2 size={13} className="text-gold flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-heading font-black text-2xl text-gold">{s.value}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Visual ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Main visual container */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/[0.06]">
              {/* Gold accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

              {/* Bus SVG */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <svg viewBox="0 0 520 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Bus body */}
                  <rect x="10" y="40" width="480" height="150" rx="12" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.5" />
                  {/* Roof */}
                  <rect x="20" y="22" width="460" height="22" rx="6" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.3" />
                  {/* Gold stripe */}
                  <rect x="10" y="90" width="480" height="4" fill="#D4AF37" opacity="0.7" />
                  {/* Windows */}
                  {[40, 100, 160, 220, 280, 340, 400].map((x, i) => (
                    <rect key={i} x={x} y="52" width="48" height="30" rx="4" fill="#111" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4" />
                  ))}
                  {/* Front windshield */}
                  <rect x="440" y="48" width="40" height="36" rx="4" fill="#0d1117" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.6" />
                  {/* Door */}
                  <rect x="62" y="130" width="30" height="58" rx="3" fill="#0d0d0d" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4" />
                  {/* Wheels */}
                  <circle cx="100" cy="195" r="28" fill="#0d0d0d" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.7" />
                  <circle cx="100" cy="195" r="14" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.9" />
                  <circle cx="400" cy="195" r="28" fill="#0d0d0d" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.7" />
                  <circle cx="400" cy="195" r="14" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.9" />
                  {/* Headlights */}
                  <rect x="470" y="130" width="18" height="12" rx="3" fill="#D4AF37" opacity="0.6" />
                  <rect x="470" y="148" width="18" height="8" rx="2" fill="#D4AF37" opacity="0.3" />
                  {/* AMAV'S text on bus */}
                  <text x="180" y="135" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#D4AF37" opacity="0.5" letterSpacing="4">AMAV'S</text>
                  <text x="200" y="158" fontFamily="sans-serif" fontSize="11" fill="#888" letterSpacing="8">TURISMO</text>
                </svg>
              </div>

              {/* Bottom tag */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-gray-400">Frota Regularizada</span>
                  <div className="flex gap-2">
                    {['ANTT', 'DETRAN', 'RNTRC'].map((tag) => (
                      <span key={tag} className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-[#0d0d0d] border border-gold/30 rounded-xl px-4 py-2.5 shadow-lg"
            >
              <div className="text-xs text-gray-400">Contratos Gov.</div>
              <div className="font-heading font-black text-xl text-gold">4 Ativos</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
