'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import Section, { SectionHeader } from '@/components/ui/Section'
import { mockTestimonials } from '@/lib/data'

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? mockTestimonials.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === mockTestimonials.length - 1 ? 0 : c + 1))

  const testimonial = mockTestimonials[current]

  return (
    <Section className="py-20 bg-navy-200" id="depoimentos">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Depoimentos"
          title="O que Nossos Clientes Dizem"
          subtitle="Avaliações reais de quem já utilizou nossos serviços."
        />

        <div className="max-w-3xl mx-auto">
          <div className="glass-gold rounded-3xl p-8 md:p-12 relative">
            {/* Quote icon */}
            <div className="absolute top-6 right-8 opacity-10">
              <Quote size={64} className="text-gold" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={18} className="text-gold fill-gold" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-8 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center font-heading font-bold text-gold text-lg">
                    {testimonial.client_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold font-heading">{testimonial.client_name}</div>
                    {testimonial.company && (
                      <div className="text-gray-400 text-sm">{testimonial.company}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {mockTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 h-2.5 bg-gold' : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ir para depoimento ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
              aria-label="Próximo depoimento"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </Section>
  )
}
