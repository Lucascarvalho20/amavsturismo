import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "Amav's Turismo — Fretamento em Brasília",
    template: "%s | Amav's Turismo",
  },
  description:
    'Fretamento de ônibus, micro-ônibus e vans em Brasília. Especialistas em contratos governamentais, eventos corporativos e excursões. Frota moderna e motoristas habilitados.',
  keywords: [
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
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://amavsturismo.com.br',
    siteName: "Amav's Turismo",
    title: "Amav's Turismo — Fretamento em Brasília",
    description: 'Fretamento de ônibus, micro-ônibus e vans em Brasília. Especialistas em contratos governamentais.',
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
          defaultTheme="dark"
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
