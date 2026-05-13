import { Suspense } from 'react'
import OrcamentoForm from './OrcamentoForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Solicitar Orçamento — Amav\'s Turismo',
  description: 'Solicite um orçamento gratuito para fretamento de ônibus, micro-ônibus e van em Brasília. Resposta rápida pelo WhatsApp.',
}

export default function OrcamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-200 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <OrcamentoForm />
    </Suspense>
  )
}
