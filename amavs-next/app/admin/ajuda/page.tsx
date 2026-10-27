import Link from 'next/link'
import {
  Bus, Camera, CalendarX, QrCode, Images, Palette, Landmark, ScrollText, ShieldCheck, FileText, ArrowRight, Trophy, FolderCheck,
} from 'lucide-react'

export const metadata = { title: "Ajuda — Admin Amav's Turismo" }

interface Step {
  text: React.ReactNode
}

interface Topic {
  id: string
  icon: typeof Bus
  title: string
  where: { href: string; label: string }
  intro: string
  steps: Step[]
  tips?: string[]
}

const topics: Topic[] = [
  {
    id: 'licitacoes',
    icon: Landmark,
    title: 'Controlar as licitações que estamos disputando',
    where: { href: '/admin/licitacoes', label: 'Licitações' },
    intro: 'Cada edital que a empresa vai disputar vira um cartão. Só a equipe vê esta tela.',
    steps: [
      { text: <>Achou um edital interessante? Clique em <b>Nova licitação</b> e preencha órgão, objeto e, se já souber, número do pregão, plataforma e <b>data e hora da sessão</b>.</> },
      { text: <>Conforme avança, mude a <b>etapa</b> direto na lista: Analisando edital → Proposta enviada → Aguardando resultado → Ganha ou Perdida.</> },
      { text: <>Sessões em até 3 dias ficam com <b>borda vermelha</b>. O Dashboard também mostra as sessões dos próximos 14 dias.</> },
      { text: <>Registre o <b>nosso lance</b> e, quando ganhar, o <b>valor homologado</b>. Isso alimenta a taxa de sucesso e o valor ganho no ano.</> },
      { text: <>Ganhou? Clique em <b>Publicar no site</b>: o sistema cria um rascunho no Portfólio para você completar com fotos.</> },
    ],
    tips: ['Use o campo Anotações para registrar por que perdeu (preço, documento, concorrente). Com o tempo isso vira aprendizado.'],
  },
  {
    id: 'documentos',
    icon: FolderCheck,
    title: 'Certidões e documentos de habilitação',
    where: { href: '/admin/documentos', label: 'Documentos' },
    intro: 'Certidão vencida no dia da sessão tira a empresa da disputa. Aqui ficam todas, com aviso de vencimento.',
    steps: [
      { text: <>Clique em <b>Novo documento</b>, escolha da lista (CND Federal, FGTS, CNDT, GDF, SICAF…) e informe <b>Válido até</b>.</> },
      { text: <>Anexe o PDF. O arquivo fica <b>privado</b>: só abre para administradores logados, por um link que expira em 60 segundos.</> },
      { text: <>15 dias antes de vencer, o documento fica <b>amarelo</b> aqui e no Dashboard. Vencido fica <b>vermelho</b>.</> },
      { text: <>Ao emitir a certidão nova, clique no lápis, troque a data e anexe o arquivo novo. O antigo é substituído.</> },
    ],
  },
  {
    id: 'portfolio',
    icon: Trophy,
    title: 'Mostrar no site um serviço prestado (com fotos)',
    where: { href: '/admin/portfolio', label: 'Portfólio' },
    intro: 'É o que aparece em “Setor público” e na página inicial. Os 10 atestados antigos já estão cadastrados; falta colocar fotos.',
    steps: [
      { text: <>Clique em <b>Editar e fotos</b> no serviço (ou em <b>Novo serviço</b>).</> },
      { text: <>Em <b>Fotos da operação</b>, envie as fotos do evento ou contrato. A primeira é a <b>capa</b>; troque com “Usar como capa”.</> },
      { text: <>Preencha o <b>resumo</b> (aparece no card) e, se quiser, a <b>descrição completa</b> (aparece na página do serviço).</> },
      { text: <><b>Número em destaque</b> é opcional, mas chama atenção: “40 veículos em operação”, “12 dias de evento”.</> },
      { text: <>Marque <b>Publicar no site</b> e salve. Para tirar do ar sem apagar, use o ícone de olho.</> },
    ],
    tips: ['Só publique o que pode ser divulgado. Na dúvida, pergunte ao órgão contratante.'],
  },
  {
    id: 'foto-onibus',
    icon: Camera,
    title: 'Trocar ou adicionar fotos de um ônibus',
    where: { href: '/admin/frota', label: 'Frota' },
    intro: 'Cada veículo pode ter várias fotos. A marcada como “Principal” aparece nos cards da frota, na página do veículo e no topo da home.',
    steps: [
      { text: <>Abra <b>Frota</b> e clique no ícone de <b>lápis (Editar)</b> na linha do veículo.</> },
      { text: <>Em <b>Fotos do Veículo</b>, clique na área tracejada e escolha uma ou mais fotos do computador ou celular.</> },
      { text: <>Para trocar a foto principal, passe o mouse sobre outra foto e clique em <b>Tornar principal</b>.</> },
      { text: <>Para tirar uma foto, clique no <b>X</b> no canto dela.</> },
      { text: <>Clique em <b>Salvar</b>. Sem salvar, nada muda no site.</> },
    ],
    tips: [
      'Formatos aceitos: JPG, PNG ou WEBP, até 5 MB cada.',
      'Prefira fotos na horizontal, com o veículo inteiro, em dia claro. Uma de fora e uma do interior já fazem diferença.',
      'Enquanto um veículo não tiver foto, o site mostra uma foto real da frota com a etiqueta “Foto ilustrativa”.',
    ],
  },
  {
    id: 'dados-onibus',
    icon: Bus,
    title: 'Alterar os dados de um ônibus',
    where: { href: '/admin/frota', label: 'Frota' },
    intro: 'Tudo que aparece sobre o veículo no site vem deste cadastro.',
    steps: [
      { text: <><b>Nome</b>: como o veículo aparece no site (ex.: “Ônibus Executivo 46 lugares”).</> },
      { text: <><b>Modelo</b> e <b>Ano</b>: aparecem abaixo do nome.</> },
      { text: <><b>Categoria</b>: Ônibus, Micro-ônibus ou Van. Define em qual filtro da frota ele aparece.</> },
      { text: <><b>Capacidade</b>: número de passageiros. Usado pela sugestão automática do formulário de orçamento.</> },
      { text: <><b>Placa</b> e <b>KM</b>: uso interno e QR Code. A placa não aparece no site.</> },
      { text: <><b>Preço/km</b> e <b>Diária</b>: se ficarem em 0, o site não mostra preço. Para licitações, recomendamos deixar em 0.</> },
      { text: <><b>Status</b>: “Em manutenção” faz o veículo aparecer como indisponível no orçamento.</> },
      { text: <><b>Diferenciais</b>: separe por vírgula (Ar-condicionado, Wi-Fi, Banheiro…). Cada um vira uma etiqueta.</> },
      { text: <><b>Descrição</b>: texto livre da página do veículo.</> },
    ],
    tips: ['Para remover um veículo do site, use a lixeira. Isso apaga o cadastro e as fotos deixam de aparecer.'],
  },
  {
    id: 'agenda',
    icon: CalendarX,
    title: 'Bloquear datas (reserva, contrato, manutenção)',
    where: { href: '/admin/frota', label: 'Frota → ícone de calendário' },
    intro: 'Os bloqueios impedem que o site sugira o veículo para aquelas datas.',
    steps: [
      { text: <>Em <b>Frota</b>, clique no ícone de <b>calendário</b> do veículo.</> },
      { text: <>Escolha o tipo (reserva, contrato, manutenção, outro), o período e um título.</> },
      { text: <>No site o visitante vê apenas “Indisponível”. <b>Título e observações ficam só no painel</b>, então pode escrever o nome do cliente sem problema.</> },
    ],
  },
  {
    id: 'qrcode',
    icon: QrCode,
    title: 'QR Code para colar no ônibus',
    where: { href: '/admin/frota', label: 'Frota → ícone verde' },
    intro: 'Cada veículo tem um endereço fixo que não muda, mesmo se o banco ou a hospedagem mudarem.',
    steps: [
      { text: <>Clique no ícone verde de QR Code e baixe em PNG (impressão) ou SVG (gráfica).</> },
      { text: <>Só imprima depois que o domínio oficial (www.amavsturismo.com) estiver apontando para o site novo.</> },
    ],
  },
  {
    id: 'galeria',
    icon: Images,
    title: 'Galeria de viagens (fotos e vídeos)',
    where: { href: '/admin/galeria', label: 'Galeria' },
    intro: 'É a seção “Nossas viagens” da página inicial. Mostra viagens e eventos realizados, não os veículos.',
    steps: [
      { text: <>Clique em <b>Adicionar item</b> e escolha <b>Foto</b> (envia do computador) ou <b>Vídeo</b> (cole o link do YouTube ou Instagram).</> },
      { text: <>Preencha a legenda, o destino e a data, se quiser. Tudo é opcional.</> },
      { text: <><b>Ordem de exibição</b>: números menores aparecem primeiro.</> },
      { text: <>Para tirar do site sem apagar, use o ícone de <b>olho</b> (Ocultar do site). A lixeira apaga de vez.</> },
    ],
    tips: ['Evite fotos com rostos de passageiros sem autorização (LGPD).'],
  },
  {
    id: 'personalizar',
    icon: Palette,
    title: 'Números, clientes e imagens da página inicial',
    where: { href: '/admin/personalizar', label: 'Personalizar' },
    intro: 'Três abas controlam partes da página inicial.',
    steps: [
      { text: <><b>Números do site</b>: escolha quais indicadores aparecem. Eles são calculados sozinhos, mas você pode fixar um valor manual.</> },
      { text: <><b>Clientes em destaque</b>: nome, sigla e logo dos órgãos e empresas atendidos.</> },
      { text: <><b>Imagens do hero</b>: fotos grandes do topo da home. Se ficar vazio, o site usa as fotos principais dos veículos e, na falta delas, as fotos reais da frota.</> },
    ],
  },
  {
    id: 'contratos',
    icon: ScrollText,
    title: 'Contratos em vigência no site',
    where: { href: '/admin/contratos', label: 'Contratos' },
    intro: 'Contratos assinados (com valor, documento e veículos). A tabela “Contratos em vigência” do site mostra só os que têm “Mostrar no site público” ligado.',
    steps: [
      { text: <>Ao cadastrar, deixe <b>Mostrar no site público</b> desligado até ter certeza de que pode divulgar.</> },
      { text: <>Valor, observações e documento do contrato <b>nunca</b> aparecem no site, mesmo para contratos públicos.</> },
    ],
  },
  {
    id: 'orcamentos',
    icon: FileText,
    title: 'Orçamentos de fretamento particular',
    where: { href: '/admin/orcamentos', label: 'Orçamentos' },
    intro: 'Pedidos do formulário /orcamento. O cliente também é levado ao WhatsApp com a mensagem pronta.',
    steps: [{ text: <>Ao aprovar, você pode bloquear o veículo no calendário automaticamente.</> }],
  },
  {
    id: 'seguranca',
    icon: ShieldCheck,
    title: 'Segurança da conta',
    where: { href: '/admin/perfil', label: 'Perfil' },
    intro: 'O painel dá acesso a dados de clientes. Algumas regras simples evitam problemas.',
    steps: [
      { text: <>Ative a <b>verificação em duas etapas (2FA)</b> em Perfil. Depois disso, o login pede o código do app autenticador.</> },
      { text: <>Cada pessoa usa a própria conta. Não compartilhe senha.</> },
      { text: <>Após 30 minutos sem uso, a sessão é encerrada sozinha.</> },
      { text: <>Só e-mails autorizados pelo responsável técnico entram no painel. Criar uma conta nova não dá acesso.</> },
    ],
  },
]

export default function AjudaPage() {
  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="font-heading font-black text-3xl text-white mb-1">Como usar o painel</h1>
        <p className="text-gray-400 text-sm">Passo a passo das tarefas mais comuns. Clique no tópico para ir direto.</p>
      </header>

      <nav className="flex flex-wrap gap-2 mb-10">
        {topics.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 bg-white/5 hover:bg-gold/15 hover:text-gold transition-colors">
            {t.title}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {topics.map((t) => {
          const Icon = t.icon
          return (
            <section key={t.id} id={t.id} className="glass-dark rounded-2xl p-6 md:p-7 scroll-mt-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <h2 className="flex items-center gap-3 font-heading font-bold text-lg text-white">
                  <span className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Icon size={18} className="text-gold" />
                  </span>
                  {t.title}
                </h2>
                <Link href={t.where.href} className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                  Abrir {t.where.label} <ArrowRight size={12} />
                </Link>
              </div>
              <p className="text-gray-400 text-sm mb-4">{t.intro}</p>
              <ol className="space-y-2.5">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-200">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 text-gray-300">
                      {i + 1}
                    </span>
                    <span className="[&_b]:text-white [&_b]:font-semibold">{s.text}</span>
                  </li>
                ))}
              </ol>
              {t.tips && (
                <ul className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
                  {t.tips.map((tip) => (
                    <li key={tip} className="text-xs text-gray-500">• {tip}</li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
