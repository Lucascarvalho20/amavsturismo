'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface Beat {
  eyebrow: string
  title: string
  body: string
  points: string[]
}

const beats: Beat[] = [
  {
    eyebrow: 'Documentação',
    title: 'Cada viagem, em dia.',
    body:
      'ANTT, RNTRC, SICAF, seguro de passageiros e CNH categoria E para todos os motoristas. Sem improviso.',
    points: ['Cadastro SICAF', 'Certidões em dia', 'Seguro completo'],
  },
  {
    eyebrow: 'Frota',
    title: 'Veículos para cada porte.',
    body:
      'Ônibus executivos para grupos grandes, micro-ônibus para times médios e vans para receptivos VIP — todos com manutenção rastreada.',
    points: ['Manutenção rastreada', 'GPS embarcado', 'Conforto premium'],
  },
  {
    eyebrow: 'Atendimento',
    title: 'Resposta sem fila.',
    body:
      'Orçamento via WhatsApp em minutos, suporte direto com a operação e ajustes feitos por quem decide.',
    points: ['WhatsApp direto', 'Suporte rápido', 'Decisão direta'],
  },
]

function BeatBlock({
  beat,
  index,
  total,
  progress,
}: {
  beat: Beat
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const mid = (index + 0.5) / total
  const end = (index + 1) / total

  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.02), start + 0.02, end - 0.02, Math.min(1, end + 0.02)],
    [0, 1, 1, 0],
  )
  const y = useTransform(progress, [start, mid, end], [30, 0, -30])

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <div
        className="text-xs font-medium tracking-[0.28em] uppercase mb-5"
        style={{ color: 'var(--text-dim)' }}
      >
        {beat.eyebrow}
      </div>
      <h2 className="font-heading font-semibold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,4rem)] mb-6">
        {beat.title}
      </h2>
      <p
        className="text-lg md:text-xl font-light leading-relaxed max-w-xl"
        style={{ color: 'var(--text-muted)' }}
      >
        {beat.body}
      </p>
    </motion.div>
  )
}

function PointsBlock({
  beat,
  index,
  total,
  progress,
}: {
  beat: Beat
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total

  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.02), start + 0.04, end - 0.02, Math.min(1, end + 0.02)],
    [0, 1, 1, 0],
  )
  const x = useTransform(progress, [start, end], [20, -20])

  return (
    <motion.div style={{ opacity, x }} className="absolute inset-0 flex flex-col gap-4 justify-center">
      {beat.points.map((p) => (
        <div
          key={p}
          className="flex items-center gap-3 surface-card rounded-2xl px-5 py-4"
        >
          <CheckCircle2 size={20} strokeWidth={1.5} style={{ color: 'var(--gold-strong)' }} />
          <span className="text-base font-medium" style={{ color: 'var(--text)' }}>
            {p}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const scale = useTransform(
    progress,
    [Math.max(0, start - 0.05), start + 0.05, end - 0.05, Math.min(1, end + 0.05)],
    [0.5, 1.4, 1.4, 0.5],
  )
  const opacity = useTransform(scale, [0.5, 1.4], [0.3, 1])
  return (
    <motion.div
      style={{ scale, opacity, background: 'var(--gold)' }}
      className="w-2 h-2 rounded-full"
    />
  )
}

export default function StorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{
        height: `${beats.length * 55}vh`,
        background: 'var(--bg-elevated)',
      }}
    >
      {/* Decorative side rail — always visible so dark mode never looks "empty" */}
      <div
        className="absolute inset-y-0 left-1/2 w-px pointer-events-none hidden md:block"
        style={{ background: 'var(--border)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 50%, var(--gold-muted) 0%, transparent 70%)',
        }}
      />

      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Persistent eyebrow — always visible so the section is never blank */}
        <div className="container mx-auto px-6 md:px-10 max-w-7xl pt-24 md:pt-32 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tracking-[0.28em] uppercase" style={{ color: 'var(--text-dim)' }}>
              Como atuamos
            </span>
            <span className="w-12 h-px" style={{ background: 'var(--gold)' }} />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_minmax(280px,420px)] gap-12 lg:gap-20 items-center">
              <div className="relative h-[320px] md:h-[380px]">
                {beats.map((beat, i) => (
                  <BeatBlock
                    key={beat.title}
                    beat={beat}
                    index={i}
                    total={beats.length}
                    progress={scrollYProgress}
                  />
                ))}
              </div>
              <div className="relative h-[380px]">
                {beats.map((beat, i) => (
                  <PointsBlock
                    key={`p-${beat.title}`}
                    beat={beat}
                    index={i}
                    total={beats.length}
                    progress={scrollYProgress}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Persistent progress dots */}
        <div className="container mx-auto px-6 md:px-10 max-w-7xl pb-16 md:pb-20">
          <div className="flex items-center gap-3">
            {beats.map((b, i) => (
              <ProgressDot
                key={`dot-${b.title}`}
                index={i}
                total={beats.length}
                progress={scrollYProgress}
              />
            ))}
            <span className="text-xs ml-2 font-light" style={{ color: 'var(--text-dim)' }}>
              {beats.length} pilares
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
