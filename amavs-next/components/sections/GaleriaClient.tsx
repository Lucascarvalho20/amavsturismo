'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, MapPin, Calendar, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TripGallery } from '@/lib/types'

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getVideoThumbnail(item: TripGallery): string {
  if (item.thumbnail_url) return item.thumbnail_url
  const ytId = getYouTubeId(item.url)
  return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''
}

function MediaCard({ item, index, onClick }: { item: TripGallery; index: number; onClick: () => void }) {
  const isWide = index === 0
  const thumb = item.media_type === 'video' ? getVideoThumbnail(item) : item.url

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className={cn(
        'relative group overflow-hidden rounded-2xl cursor-pointer',
        isWide ? 'col-span-2' : 'col-span-1',
        'aspect-[4/3]'
      )}
      onClick={onClick}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={item.caption ?? 'Viagem Amavs Turismo'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <Images size={28} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {item.media_type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
        </div>
      )}

      {(item.caption || item.location) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {item.caption && (
            <p className="text-white text-sm font-medium leading-snug mb-1">{item.caption}</p>
          )}
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: '#D4AF37' }} className="flex-shrink-0" />
              <span className="text-white/70 text-xs">{item.location}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function GaleriaClient({ items }: { items: TripGallery[] }) {
  const [lightbox, setLightbox] = useState<TripGallery | null>(null)

  if (items.length === 0) return null

  const ytId = lightbox?.media_type === 'video' ? getYouTubeId(lightbox.url) : null

  return (
    <section className="py-32 md:py-40 surface" id="galeria">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16 md:mb-20"
        >
          <div className="text-xs font-medium tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--text-dim)' }}>
            Nossas Viagens
          </div>
          <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
            Momentos que<br />
            <span className="text-gradient-gold">ficam na memória.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {items.map((item, i) => (
            <MediaCard
              key={item.id}
              item={item}
              index={i}
              onClick={() => setLightbox(item)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setLightbox(null)}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.media_type === 'photo' ? (
                <img
                  src={lightbox.url}
                  alt={lightbox.caption ?? ''}
                  className="w-full max-h-[80vh] object-contain rounded-2xl"
                />
              ) : ytId ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                    title={lightbox.caption ?? 'Vídeo da viagem'}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center gap-4 bg-navy-100">
                  <p className="text-gray-400 text-sm">Ver vídeo no Instagram:</p>
                  <a
                    href={lightbox.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-navy-200"
                    style={{ background: '#D4AF37' }}
                  >
                    Abrir no Instagram
                  </a>
                </div>
              )}

              {(lightbox.caption || lightbox.location || lightbox.trip_date) && (
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  {lightbox.caption && (
                    <p className="text-white/90 text-sm font-medium flex-1 min-w-0">{lightbox.caption}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/50 shrink-0">
                    {lightbox.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: '#D4AF37' }} />
                        {lightbox.location}
                      </span>
                    )}
                    {lightbox.trip_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color: '#D4AF37' }} />
                        {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
                          new Date(lightbox.trip_date + 'T12:00:00')
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
