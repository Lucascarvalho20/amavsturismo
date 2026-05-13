# AMAVS Turismo — Site v2

## Estrutura
```
amavs-v2/
├── index.html         ← Página inicial
├── frota.html         ← Lista da frota completa
├── veiculo.html       ← Detalhe de veículo (dinâmico via JS)
├── orcamento.html     ← Formulário de orçamento (3 etapas)
├── licitacoes.html    ← Contratos públicos
├── sobre.html         ← Sobre a empresa
├── contato.html       ← Canais de contato
├── privacidade.html   ← LGPD
├── termos.html        ← Termos de uso
├── onibus.html        ← Categoria Ônibus
├── micro-onibus.html  ← Categoria Micro-ônibus
├── vans.html          ← Categoria Vans
├── css/style.css      ← Design system completo
├── js/main.js         ← JS: frota, chatbot IA, formulários
├── assets/            ← Imagens e favicon
├── admin/             ← Painel administrativo
│   ├── login.html     ← Login (admin/admin123 | operador/op2024)
│   ├── index.html     ← Dashboard
│   ├── orcamentos.html
│   ├── veiculos.html
│   ├── contratos.html ← Gerencia licitações + imagens
│   ├── usuarios.html
│   ├── perfil.html
│   └── relatorios.html
├── backend/           ← PHP para produção (configure DB)
│   ├── config.php     ← Conexão MySQL — EDITE AS CREDENCIAIS
│   ├── orcamento.php  ← Salva orçamentos no banco
│   └── auth.php       ← Autenticação real (produção)
└── db/schema.sql      ← Execute no Hostinger phpMyAdmin
```

## Deploy no Hostinger
1. Suba todos os arquivos via FTP ou Gerenciador de Arquivos
2. No phpMyAdmin: execute `db/schema.sql`
3. Edite `backend/config.php` com as credenciais do banco
4. Ative SSL/HTTPS no painel Hostinger
5. Descomente o redirect HTTPS no `.htaccess`

## Chatbot IA
O chatbot usa a API Anthropic diretamente do frontend (sem backend).
A API key deve ser configurada no servidor ou limitada por domínio.
Para produção, mova a chamada para um proxy PHP no backend.

## WhatsApp
Número configurado: 61984222205 (variável WPP em js/main.js)

## Acesso Admin (demo)
- Administrador: `admin` / `admin123`
- Operador: `operador` / `op2024`
