'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Grade de fotos com visualização ampliada (teclado: ← → Esc).

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const n = photos.length

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % n))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + n) % n))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, n])

  if (n === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className={`group relative overflow-hidden rounded-2xl ${i === 0 && n > 2 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'}`}
            aria-label={`Ampliar foto ${i + 1}`}
          >
            <img src={src} alt={`${alt} — foto ${i + 1}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={photos[open]} alt={`${alt} — foto ${open + 1}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-0 right-0 text-center text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {open + 1} / {n}
          </div>
          <button className="absolute top-5 right-5 p-2" style={{ color: '#fff' }} aria-label="Fechar" onClick={() => setOpen(null)}>
            <X size={26} />
          </button>
          {n > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 p-2" style={{ color: '#fff' }} aria-label="Anterior"
                onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + n) % n) }}>
                <ChevronLeft size={34} />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2" style={{ color: '#fff' }} aria-label="Próxima"
                onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % n) }}>
                <ChevronRight size={34} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
