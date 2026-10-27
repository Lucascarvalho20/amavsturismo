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
ADMIN_EMAILS=seu-email@exemplo.com
REQUIRE_ADMIN_MFA=false
```

---

### Passo 4 — Criar o usuário administrador

1. No Supabase, vá em **Authentication → Users → Add user** e crie o usuário com SEU e-mail e uma senha forte
2. Abra `supabase/migrations/2026-10-27_security_hardening.sql`, troque `seu-email@exemplo.com` pelo seu e-mail e rode no **SQL Editor**
3. Em **Authentication → Sign In / Providers**, **desligue "Allow new users to sign up"**
4. Coloque o mesmo e-mail em `ADMIN_EMAILS` (no `.env.local` e nas variáveis da Vercel)
5. Depois do primeiro login, ative o 2FA em **/admin/perfil**

> Sem os passos 2 e 3, qualquer pessoa que criar uma conta no Supabase teria acesso aos dados do painel.

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
| Banco (RLS) | Só usuários em `admin_users` leem/alteram dados do painel (`is_admin()`) |
| Middleware | Toda rota `/admin/*` exige sessão, e-mail em `ADMIN_EMAILS` e 2FA validado (se cadastrado) |
| APIs públicas | Formulários gravam via servidor com validação Zod, rate limit e honeypot; disponibilidade devolve só datas |
| Rate Limiting | Bloqueio de 15 min após 5 erros do mesmo IP no mesmo e-mail (20 no total por e-mail) |
| Audit Log | Registra logins; só o servidor grava |
| Session Timeout | Logout automático após 30 min sem uso |
| 2FA | Cadastre em `/admin/perfil`; com `REQUIRE_ADMIN_MFA=true` vira obrigatório |
| HTTP Headers | CSP, HSTS, X-Frame-Options, noindex no painel |

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

## Fotos dos ônibus e uso do painel

O passo a passo completo (fotos, dados de cada veículo, agenda, galeria, licitações) está dentro do próprio painel em **/admin/ajuda**.

Enquanto um veículo não tem foto cadastrada, o site usa fotos reais da frota (em `public/images/frota/`, recuperadas do site antigo e sem metadados de GPS) com a etiqueta "Foto ilustrativa".

## Testes

```bash
npm test
npm run typecheck
```
