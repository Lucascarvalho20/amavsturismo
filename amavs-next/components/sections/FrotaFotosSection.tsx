'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fleetPhotos } from '@/lib/fleet-photos'

// Fotos reais da frota e da garagem, com visualização ampliada.

export default function FrotaFotosSection({ limit = 9 }: { limit?: number }) {
  const photos = fleetPhotos.slice(0, limit)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  return (
    <section className="py-32 md:py-40" style={{ background: 'var(--bg-elevated)' }} id="estrutura">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Estrutura própria
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            Frota e garagem<br />
            <span className="text-gradient-gold">em Brasília.</span>
          </h2>
          <p className="text-lg font-light leading-relaxed mt-6" style={{ color: 'var(--text-muted)' }}>
            Veículos próprios, identificados com a marca da empresa e mantidos em garagem própria.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {photos.map((p, i) => (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'}`}
              aria-label={`Ampliar: ${p.caption}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={i === 0 ? p.src : p.srcSm}
                alt={p.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-90" />
              <span className="absolute left-3 bottom-3 right-3 text-left text-xs md:text-sm font-medium" style={{ color: '#fff' }}>
                {p.caption}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[open].src}
              alt={photos[open].alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-sm">{photos[open].caption}</div>
            <button className="absolute top-5 right-5 p-2 text-white/80 hover:text-white" aria-label="Fechar" onClick={() => setOpen(null)}>
              <X size={26} />
            </button>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
              aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + photos.length) % photos.length) }}
            >
              <ChevronLeft size={34} />
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
              aria-label="Próxima"
              onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % photos.length) }}
            >
              <ChevronRight size={34} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
