import Link from 'next/link'
import { Instagram, MessageCircle, Phone, MapPin, Mail, Clock } from 'lucide-react'
import Logo from '@/components/Logo'

const footerLinks = {
  empresa: [
    { href: '/sobre', label: 'Sobre Nós' },
    { href: '/frota', label: 'Nossa Frota' },
    { href: '/licitacoes', label: 'Licitações' },
    { href: '/contato', label: 'Contato' },
  ],
  servicos: [
    { href: '/orcamento', label: 'Solicitar Orçamento' },
    { href: '/frota?categoria=onibus', label: 'Fretamento de Ônibus' },
    { href: '/frota?categoria=micro', label: 'Micro-ônibus' },
    { href: '/frota?categoria=van', label: 'Vans Executivas' },
    { href: '/licitacoes', label: 'Contratos Governamentais' },
  ],
  legal: [
    { href: '/privacidade', label: 'Política de Privacidade' },
    { href: '/termos', label: 'Termos de Uso' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-100 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo size="md" className="mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Especialistas em fretamento de ônibus, micro-ônibus e vans em Brasília. Atendemos
              órgãos públicos, empresas e grupos desde 2009.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/amavsturismo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/5561984222205"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Serviços
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.servicos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Phone size={16} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <a href="tel:+5561984222205" className="hover:text-gold transition-colors block">
                    (61) 98422-2205
                  </a>
                  <a href="tel:+5561984064241" className="hover:text-gold transition-colors block">
                    (61) 98406-4241
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MessageCircle size={16} className="text-gold shrink-0 mt-0.5" />
                <a
                  href="https://wa.me/5561984222205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: (61) 98422-2205
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Mail size={16} className="text-gold shrink-0 mt-0.5" />
                <a
                  href="mailto:contato@amavsturismo.com.br"
                  className="hover:text-gold transition-colors"
                >
                  contato@amavsturismo.com.br
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                <span>Brasília, Distrito Federal</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Clock size={16} className="text-gold shrink-0 mt-0.5" />
                <span>Seg–Sex 8h–18h | Sáb 8h–12h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-5">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {currentYear} Amav's Turismo. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
