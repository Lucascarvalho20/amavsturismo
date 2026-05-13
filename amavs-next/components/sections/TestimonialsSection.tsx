'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { mockTestimonials } from '@/lib/data'

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} className="text-gold fill-gold" />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [featured, ...rest] = mockTestimonials

  return (
    <section className="py-24 bg-[#111]" id="depoimentos">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12 flex-wrap gap-4"
        >
          <div>
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-gold" />
              Depoimentos
            </span>
            <h2 className="font-heading font-black text-4xl text-white tracking-tight">
              O que nossos<br />clientes dizem.
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-[#0d0d0d] border border-white/[0.07] rounded-xl px-5 py-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-gold fill-gold" />
              ))}
            </div>
            <div>
              <div className="text-white font-bold text-sm">5.0</div>
              <div className="text-gray-600 text-[11px]">Google Avaliações</div>
            </div>
          </div>
        </motion.div>

        {/* Magazine layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Featured testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-8 relative overflow-hidden group hover:border-gold/15 transition-colors duration-300"
          >
            {/* Gold accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            {/* Big quote mark */}
            <div className="text-8xl font-serif leading-none text-gold/10 mb-4 -mt-2">"</div>

            <Stars n={featured.rating} />

            <p className="text-gray-200 text-lg leading-relaxed mt-5 mb-6 italic">
              "{featured.text}"
            </p>

            <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold font-bold font-heading text-base">
                {featured.client_name.charAt(0)}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{featured.client_name}</div>
                {featured.company && <div className="text-gray-500 text-xs">{featured.company}</div>}
              </div>
            </div>
          </motion.div>

          {/* Stacked smaller testimonials */}
          <div className="flex flex-col gap-4">
            {rest.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-[#0d0d0d] border border-white/[0.07] rounded-xl p-6 flex flex-col gap-3 group hover:border-white/10 transition-colors"
              >
                <Stars n={t.rating} />
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/15 flex items-center justify-center text-gold font-bold text-xs">
                    {t.client_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{t.client_name}</div>
                    {t.company && <div className="text-gray-600 text-[11px]">{t.company}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
