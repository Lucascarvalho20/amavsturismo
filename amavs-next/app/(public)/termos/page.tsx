import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso do site da Amav\'s Turismo.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-navy-200 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-2">
            Termos de Uso
          </h1>
          <div className="gold-divider-center" />
          <p className="text-gray-400 mt-2">Última atualização: Janeiro de 2024</p>
        </div>

        <div className="glass-dark rounded-2xl p-8">
          <div className="space-y-8 text-gray-400 leading-relaxed text-sm">
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar o site da Amav's Turismo (amavsturismo.com.br), você concorda
                com estes Termos de Uso. Se não concordar com qualquer parte destes termos, solicitamos
                que não utilize o site.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">2. Sobre o Serviço</h2>
              <p>
                A Amav's Turismo é uma empresa de fretamento de veículos (ônibus, micro-ônibus e vans)
                localizada em Brasília, Distrito Federal. O site tem como finalidade apresentar
                informações sobre a empresa e seus serviços, além de facilitar o contato com
                potenciais clientes.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">3. Uso do Site</h2>
              <p>Você concorda em usar este site apenas para fins lícitos e de forma que não:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Viole qualquer lei ou regulamento aplicável</li>
                <li>Interfira no funcionamento do site ou dos servidores</li>
                <li>Colete dados de outros usuários sem autorização</li>
                <li>Transmita conteúdo falso, enganoso ou prejudicial</li>
                <li>Tente acessar áreas restritas sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">4. Orçamentos e Contratação</h2>
              <p>
                As solicitações de orçamento realizadas pelo site são apenas consultas iniciais e
                não constituem contrato de prestação de serviços. O contrato somente se forma após
                confirmação escrita de ambas as partes, incluindo definição de valor, data, trajeto
                e condições de pagamento.
              </p>
              <p className="mt-2">
                Os valores apresentados no site são estimativas e podem variar conforme distância,
                período, disponibilidade e características específicas da viagem.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">5. Responsabilidades</h2>
              <p>
                A Amav's Turismo não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Informações de terceiros eventualmente linkadas no site</li>
                <li>Indisponibilidade temporária do site por manutenção ou falha técnica</li>
                <li>Danos decorrentes do uso inadequado das informações do site</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">6. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do site — incluindo textos, imagens, logotipos, ícones e design —
                é propriedade da Amav's Turismo e protegido pela Lei de Direitos Autorais (Lei
                nº 9.610/98). É vedada a reprodução sem autorização expressa.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">7. Links Externos</h2>
              <p>
                O site pode conter links para sites externos (como WhatsApp e Instagram). Não nos
                responsabilizamos pelo conteúdo ou pelas políticas de privacidade desses sites.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">8. Alterações</h2>
              <p>
                Podemos atualizar estes termos a qualquer momento. A versão mais recente estará
                sempre disponível nesta página, com a data de atualização indicada no topo.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">9. Foro</h2>
              <p>
                Estes termos são regidos pela legislação brasileira. Para quaisquer questões
                decorrentes deste instrumento, fica eleito o Foro da Comarca de Brasília,
                Distrito Federal.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3">10. Contato</h2>
              <p>
                Dúvidas sobre estes termos? Entre em contato:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>E-mail: contato@amavsturismo.com.br</li>
                <li>WhatsApp: (61) 98422-2205</li>
                <li>Endereço: Brasília, Distrito Federal, Brasil</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
