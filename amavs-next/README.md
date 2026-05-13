# Amav's Turismo — Site Oficial

> Next.js 14 · TypeScript · Tailwind CSS · Supabase · Framer Motion

---

## Como rodar o projeto (passo a passo)

### Passo 1 — Instalar o Node.js

1. Acesse **[nodejs.org](https://nodejs.org/pt)**
2. Clique no botão verde **"LTS"** (versão recomendada)
3. Baixe e instale com as opções padrão
4. Após instalar, **feche e abra o terminal novamente**
5. Verifique: abra o Prompt de Comando e digite:
   ```
   node --version
   ```
   Deve aparecer algo como `v20.x.x`

---

### Passo 2 — Criar projeto no Supabase

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita
2. Clique em **"New project"**
3. Dê um nome (ex: `amavs-turismo`), escolha uma senha forte, região **South America (São Paulo)**
4. Aguarde criar (1-2 minutos)
5. Vá em **SQL Editor** → cole todo o conteúdo do arquivo `supabase/schema.sql` → clique em **RUN**

---

### Passo 3 — Configurar variáveis de ambiente

1. Dentro da pasta `amavs-next`, copie o arquivo `.env.example` e renomeie para `.env.local`
2. No Supabase, vá em **Settings → API** e copie:
   - **Project URL** → cole em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (atenção: mantenha SECRETA) → cole em `SUPABASE_SERVICE_ROLE_KEY`

Seu `.env.local` deve ficar assim:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5561984222205
NEXT_PUBLIC_WHATSAPP_NUMBER_2=5561984064241
```

---

### Passo 4 — Criar o usuário administrador

1. No Supabase, vá em **Authentication → Users**
2. Clique em **"Invite a user"** ou **"Add user"**
3. Insira SEU e-mail e uma senha forte
4. Guarde essas credenciais — são usadas no `/admin/login`

---

### Passo 5 — Instalar dependências e rodar

Abra o Prompt de Comando **dentro da pasta `amavs-next`**:
```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

Para acessar o painel admin: **http://localhost:3000/admin/login**

---

## Estrutura do projeto

```
amavs-next/
├── app/
│   ├── (public)/          # Site público (landing, frota, orçamento...)
│   ├── admin/             # Painel administrativo (protegido)
│   └── api/admin/         # APIs de segurança (rate limiting, audit)
├── components/
│   ├── layout/            # Navbar, Footer, WhatsApp FAB
│   ├── sections/          # Seções da landing page
│   ├── ui/                # Button, Badge, Input, Section
│   └── admin/             # Sidebar, SessionGuard
├── lib/
│   ├── types.ts           # Tipos TypeScript
│   ├── utils.ts           # Formatação, WhatsApp URL
│   ├── supabase-server.ts # Cliente server-side (seguro)
│   ├── supabase-browser.ts# Cliente browser
│   ├── audit.ts           # Registro de ações
│   └── data.ts            # Dados mock (antes do Supabase)
├── middleware.ts           # Proteção das rotas /admin/*
├── supabase/
│   └── schema.sql         # Banco de dados completo
└── public/
    └── images/            # Placeholders — substitua pelas fotos reais
```

---

## Segurança implementada

| Proteção | Como funciona |
|----------|--------------|
| Middleware | Toda rota `/admin/*` verifica sessão antes de carregar |
| Rate Limiting | Bloqueia por 15 min após 5 tentativas erradas |
| Audit Log | Registra todos os logins no banco |
| Session Timeout | Logout automático após 30 min sem uso |
| 2FA (opcional) | Configure em `/admin/perfil` → ativar 2FA |
| HTTP Headers | X-Frame-Options, CSP, HSTS em produção |

---

## Deploy na Vercel

1. Crie conta em [vercel.com](https://vercel.com)
2. Conecte com o GitHub e importe o repositório
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
4. Clique em **Deploy**

### Apontar o domínio `amavsturismo.com`
- Na Vercel: **Settings → Domains → Add Domain → amavsturismo.com**
- No registrador do domínio: siga as instruções da Vercel para apontar os DNS

---

## Substituir fotos dos ônibus

1. Acesse `/admin/login`
2. Vá em **Frota → Editar** em cada veículo
3. Faça upload das fotos reais
4. Elas são salvas no **Supabase Storage** e aparecem no site automaticamente
