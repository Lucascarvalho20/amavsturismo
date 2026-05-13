import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Amav\'s Turismo conforme a Lei Geral de Proteção de Dados (LGPD).',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-2">
            Política de Privacidade
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 mt-2">Última atualização: Janeiro de 2024</p>
        </div>

        <div className="glass-dark rounded-2xl p-8 prose prose-invert max-w-none">
          <div className="space-y-8 text-gray-400 leading-relaxed text-sm">
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">1. Introdução</h2>
              <p>
                A Amav's Turismo ("nós", "nosso", "empresa") está comprometida com a proteção da
                sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos,
                armazenamos e protegemos suas informações pessoais, em conformidade com a Lei
                Geral de Proteção de Dados (LGPD) — Lei nº 13.709/2018.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">2. Dados Coletados</h2>
              <p>Coletamos os seguintes tipos de dados pessoais:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Nome completo</li>
                <li>Número de telefone / WhatsApp</li>
                <li>Endereço de e-mail (quando fornecido voluntariamente)</li>
                <li>Informações sobre a viagem solicitada (origem, destino, data, número de passageiros)</li>
                <li>Dados de navegação (cookies técnicos e de desempenho)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">3. Finalidade do Tratamento</h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Elaborar e enviar orçamentos de fretamento</li>
                <li>Entrar em contato para negociação e confirmação de reservas</li>
                <li>Cumprir obrigações legais e contratuais</li>
                <li>Melhorar nossos serviços e experiência do usuário no site</li>
                <li>Envio de informações sobre nossos serviços (mediante consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">4. Base Legal</h2>
              <p>
                O tratamento de dados é realizado com base no consentimento do titular (art. 7º,
                I, LGPD), na execução de contrato (art. 7º, V) e no cumprimento de obrigação
                legal (art. 7º, II).
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">5. Compartilhamento</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins
                comerciais. Podemos compartilhar dados com:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Motoristas e operadores da empresa (estritamente necessário para prestação do serviço)</li>
                <li>Autoridades públicas, quando exigido por lei</li>
                <li>Prestadores de serviços tecnológicos (hospedagem, banco de dados) com cláusulas de confidencialidade</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">6. Retenção de Dados</h2>
              <p>
                Mantemos seus dados pelo tempo necessário para a prestação do serviço e
                cumprimento de obrigações legais. Dados de contato são retidos por até 5 anos
                após o último contato ou término do contrato.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">7. Seus Direitos (LGPD)</h2>
              <p>Como titular de dados, você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Confirmação da existência de tratamento</li>
                <li>Acesso aos dados</li>
                <li>Correção de dados incompletos ou incorretos</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados</li>
                <li>Revogação do consentimento</li>
                <li>Informação sobre compartilhamento</li>
              </ul>
              <p className="mt-3">
                Para exercer seus direitos, entre em contato pelo e-mail:{' '}
                <a href="mailto:privacidade@amavsturismo.com.br" className="text-gold hover:underline">
                  privacidade@amavsturismo.com.br
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">8. Segurança</h2>
              <p>
                Adotamos medidas técnicas e administrativas para proteger seus dados contra
                acesso não autorizado, destruição, perda, alteração ou divulgação indevida.
                Nosso site utiliza HTTPS e os dados são armazenados em servidores seguros.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">9. Cookies</h2>
              <p>
                Utilizamos apenas cookies técnicos essenciais para o funcionamento do site.
                Não utilizamos cookies de rastreamento de terceiros para publicidade.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">10. Contato</h2>
              <p>
                Dúvidas sobre esta política? Entre em contato com nosso Encarregado de Proteção
                de Dados (DPO):
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>E-mail: privacidade@amavsturismo.com.br</li>
                <li>WhatsApp: (61) 98422-2205</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
