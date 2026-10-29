'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Bus, MapPin, CheckCircle2, ShieldCheck, Users } from 'lucide-react'
import { categoryLabel } from '@/lib/utils'
import { publicAtestados, firstPublicContractYear } from '@/lib/atestados'
import type { Vehicle } from '@/lib/types'

interface HeroSlide {
  image_url: string
  title?: string | null
  subtitle?: string | null
  meta?: string | null
  capacity?: number | null
}

interface Props {
  slides: HeroSlide[]
  vehiclesFallback: Vehicle[]
}

const trustBadges = [
  'SICAF regularizado',
  'RNTRC / ANTT',
  'Atestados de capacidade técnica',
  'Seguro de passageiros',
]

const proofStats = [
  { value: `${firstPublicContractYear}`, label: 'Primeiro contrato público atestado' },
  { value: '132', label: 'Veículos em um único evento (CFC)' },
  { value: '80+', label: 'Veículos em comboio (Exército)' },
]

export default function HeroClient({
  slides,
  vehiclesFallback,
}: Props) {
  const { scrollY } = useScroll()
  const textY = useTransform(scrollY, [0, 500], [0, -60])
  const photoY = useTransform(scrollY, [0, 500], [0, 80])
  const fadeOut = useTransform(scrollY, [0, 400], [1, 0.3])

  const effectiveSlides: HeroSlide[] =
    slides.length > 0
      ? slides
      : vehiclesFallback
          .filter((v) => v.photo_url)
          .slice(0, 5)
          .map((v) => ({
            image_url: v.photo_url!,
            title: v.name,
            subtitle: `${v.model} · ${v.year}`,
            meta: categoryLabel(v.category),
            capacity: v.capacity,
          }))

  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (effectiveSlides.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % effectiveSlides.length), 5500)
    return () => clearInterval(t)
  }, [effectiveSlides.length])

  const current = effectiveSlides[index]

  return (
    <section
      className="force-dark relative w-full overflow-hidden flex items-center"
      style={{
        minHeight: '100vh',
        // dark canvas always (hero é dramático). Light/dark mode é coordenado nas outras sections.
        background: 'linear-gradient(180deg, #0A0A0C 0%, #111114 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 100% 50%, rgba(212,175,55,0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 0% 100%, rgba(212,175,55,0.06) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.3) 50%, transparent 100%)' }} />

      <motion.div
        style={{ opacity: fadeOut }}
        className="relative z-10 w-full container mx-auto px-6 md:px-10 max-w-7xl py-24 lg:py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          {/* Texto: no celular aparece depois da foto */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-7">
              <MapPin size={14} strokeWidth={1.5} className="text-white/70" />
              <span className="text-[11px] font-medium tracking-[0.28em] uppercase text-white/70">
                Transporte para o setor público · Brasília
              </span>
              <span className="w-12 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
            </div>

            <h1 className="font-heading font-semibold text-white tracking-tight leading-[0.95] text-[clamp(2.5rem,6.5vw,5.25rem)] mb-6">
              Transporte oficial<br />
              com histórico{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F5D97A 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                comprovado.
              </span>
            </h1>

            <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-9">
              Desde 2010 em contratos com o Exército, conselhos federais e ministérios.
              Ônibus, micro-ônibus e vans com documentação pronta para habilitação.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-9">
              <a
                href="/licitacoes"
                className="group inline-flex items-center gap-2 bg-white text-black px-7 h-12 rounded-full text-[15px] font-medium hover:bg-white/90 transition-all"
              >
                Serviços prestados
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="/frota"
                className="group inline-flex items-center gap-2 text-white px-7 h-12 rounded-full text-[15px] font-medium hover:bg-white/10 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Conheça a frota
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-10">
              {trustBadges.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 text-white/50 text-xs font-light"
                >
                  <CheckCircle2 size={12} className="flex-shrink-0" style={{ color: '#D4AF37' }} />
                  {t}
                </span>
              ))}
            </div>

            {/* Números comprovados por atestados de capacidade técnica */}
            <div className="flex gap-8 md:gap-10 pt-7" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {proofStats.map((st) => (
                <div key={st.label}>
                  <div className="font-heading font-semibold text-2xl md:text-3xl tracking-tight" style={{ color: '#D4AF37' }}>
                    {st.value}
                  </div>
                  <div className="text-white/50 text-[11px] mt-1 font-light max-w-[9rem]">{st.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Carrossel de fotos: no celular aparece primeiro */}
          <motion.div
            style={{ y: photoY }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center order-1 lg:order-2"
          >
            <div
              className="relative w-full aspect-[4/3] rounded-[28px] overflow-hidden"
              style={{
                background: '#0F0F12',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px z-20" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 50%, transparent 100%)' }} />

              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div
                    key={current.image_url + index}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={current.image_url}
                      alt={current.title ?? 'Amavs Turismo'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  </motion.div>
                ) : (
                  <BrandFallback />
                )}
              </AnimatePresence>

              {current && (current.title || current.meta) && (
                <motion.div
                  key={`cap-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute bottom-5 left-5 right-5 z-10"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      {current.meta && (
                        <div className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5" style={{ color: '#F5D97A' }}>
                          {current.meta}
                        </div>
                      )}
                      {current.title && (
                        <div className="text-white font-heading font-semibold text-lg leading-tight tracking-tight">
                          {current.title}
                        </div>
                      )}
                      {current.subtitle && (
                        <div className="text-white/60 text-xs mt-0.5 font-light">
                          {current.subtitle}
                        </div>
                      )}
                    </div>
                    {current.capacity && (
                      <div
                        className="flex items-center gap-1.5 backdrop-blur-md rounded-full px-3 py-1.5 shrink-0"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <Users size={11} style={{ color: '#D4AF37' }} />
                        <span className="text-white text-xs font-medium">{current.capacity} pax</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {effectiveSlides.length > 1 && (
                <div className="absolute top-5 right-5 z-20 flex gap-1.5">
                  {effectiveSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        i === index ? 'w-7' : 'w-2.5 hover:opacity-80'
                      }`}
                      style={{
                        background: i === index ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -right-5 rounded-2xl px-4 py-3 shadow-lg"
              style={{
                background: 'rgba(15,15,18,0.95)',
                border: '1px solid rgba(212,175,55,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="text-[10px] text-white/60 font-medium tracking-widest uppercase">
                Órgãos públicos atendidos
              </div>
              <div
                className="font-heading font-semibold text-2xl tracking-tight"
                style={{ color: '#D4AF37' }}
              >
                {publicAtestados.length}+
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-5 -left-5 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2.5"
              style={{
                background: 'rgba(15,15,18,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <ShieldCheck size={20} style={{ color: '#D4AF37' }} strokeWidth={1.5} />
              <div>
                <div className="text-[10px] text-white/60 leading-tight font-medium">Documentação</div>
                <div className="text-white text-sm font-medium tracking-tight">ANTT · SICAF</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[10px] text-white/50 tracking-[0.3em] uppercase font-medium">Role</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8"
            style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.6) 0%, transparent 100%)' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

function BrandFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#16161A] via-[#101013] to-[#0A0A0C] flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.18) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative flex flex-col items-center gap-3 text-white/40">
        <Bus size={56} strokeWidth={1} />
        <span className="text-[11px] tracking-[0.3em] uppercase font-medium">
          Amav&apos;s Turismo
        </span>
      </div>
    </div>
  )
}
