import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amavsturismo.com'),
  title: {
    default: "Amav's Turismo — Transporte para órgãos públicos em Brasília",
    template: "%s | Amav's Turismo",
  },
  description:
    'Transporte de passageiros para órgãos públicos em Brasília: pregão eletrônico, dispensa e adesão a ata. Atestados de capacidade técnica do Exército, CFC, MPT e Ministério da Saúde. Ônibus, micro-ônibus e vans.',
  keywords: [
    'transporte de passageiros licitação',
    'pregão transporte ônibus DF',
    'locação de ônibus órgão público Brasília',
    'atestado de capacidade técnica transporte',
    'fretamento Brasília',
    'aluguel ônibus Brasília',
    'micro-ônibus Brasília',
    'van fretamento DF',
    'transporte corporativo Brasília',
    'licitação transporte DF',
    'excursão ônibus Brasília',
  ],
  authors: [{ name: "Amav's Turismo" }],
  creator: "Amav's Turismo",
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amavsturismo.com',
    siteName: "Amav's Turismo",
    title: "Amav's Turismo — Transporte para órgãos públicos",
    description: 'Transporte de passageiros para órgãos públicos em Brasília, com atestados de capacidade técnica desde 2010.',
    images: [{ url: '/images/frota/frota-garagem.jpg', width: 1600, height: 1200 }],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#111111' },
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={['dark', 'light']}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--gold-border)',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#D4AF37', secondary: 'var(--bg-card)' } },
              error:   { iconTheme: { primary: '#BB1E1E', secondary: 'var(--bg-card)' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
