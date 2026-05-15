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
      <div className="min-h-screen surface flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }}
        />
      </div>
    }>
      <OrcamentoForm />
    </Suspense>
  )
}
