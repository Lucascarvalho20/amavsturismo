import Link from 'next/link'
import { Instagram, MessageCircle, Phone, MapPin, Mail, Clock } from 'lucide-react'
import Logo from '@/components/Logo'
import { companyInfo } from '@/lib/atestados'

const footerLinks = {
  empresa: [
    { href: '/sobre', label: 'Sobre Nós' },
    { href: '/frota', label: 'Nossa Frota' },
    { href: '/licitacoes', label: 'Licitações' },
    { href: '/contato', label: 'Contato' },
  ],
  servicos: [
    { href: '/licitacoes#proposta', label: 'Proposta para licitação' },
    { href: '/orcamento', label: 'Orçamento particular' },
    { href: '/frota?categoria=onibus', label: 'Fretamento de Ônibus' },
    { href: '/frota?categoria=micro', label: 'Micro-ônibus' },
    { href: '/frota?categoria=van', label: 'Vans Executivas' },
  ],
  legal: [
    { href: '/privacidade', label: 'Política de Privacidade' },
    { href: '/termos', label: 'Termos de Uso' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
      <div className="container mx-auto px-6 md:px-10 max-w-7xl py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Logo size="md" className="mb-5" />
            <p className="text-sm leading-relaxed mb-6 font-light max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Transporte de passageiros para órgãos públicos e empresas, com base em
              Brasília. Ônibus, micro-ônibus e vans.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/amavsturismo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://wa.me/5561984222205"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-5 tracking-tight" style={{ color: 'var(--text)' }}>
              Empresa
            </h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-5 tracking-tight" style={{ color: 'var(--text)' }}>
              Serviços
            </h4>
            <ul className="space-y-3">
              {footerLinks.servicos.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-5 tracking-tight" style={{ color: 'var(--text)' }}>
              Contato
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-strong)' }} />
                <div className="space-y-1">
                  <a href="tel:+5561984222205" className="block transition-opacity hover:opacity-70">(61) 98422-2205</a>
                  <a href="tel:+5561984064241" className="block transition-opacity hover:opacity-70">(61) 98406-4241</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-strong)' }} />
                <a href="https://wa.me/5561984222205" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                  WhatsApp: (61) 98422-2205
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-strong)' }} />
                <a href="mailto:contato@amavsturismo.com.br" className="transition-opacity hover:opacity-70 break-all">
                  contato@amavsturismo.com.br
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-strong)' }} />
                <a
                  href="https://maps.google.com/?q=SH+Ponte+de+Terra+Pte+Alta+Norte+Gama+Brasilia+DF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                >
                  SH Ponte de Terra — Ponte Alta Norte<br />
                  Gama · Brasília-DF · 72427-010
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-strong)' }} />
                <span>Seg–Sex 8h–18h · Sáb 8h–12h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="py-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6 md:px-10 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            © {currentYear} {companyInfo.legalName} · CNPJ {companyInfo.cnpj}
          </p>
          <div className="flex items-center gap-5">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-dim)' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
