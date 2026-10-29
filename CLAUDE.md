# Amav's Turismo — contexto para o Claude Code

Sistema de uma empresa de transporte de passageiros de Brasília que vive de **licitações**: a empresa disputa pregões e dispensas do governo e presta o serviço. Fretamento particular é secundário.

O dono do repositório (Lucas) usa o projeto também como portfólio para vagas de back-end (Node/JS, AWS). Mantenha o código e a documentação com qualidade de portfólio.

## Estrutura

- `amavs-next/` — aplicação atual (Next.js 14 App Router, TypeScript, Supabase/Postgres, Tailwind). **Todo trabalho novo é aqui.**
- `amavs-v2/` — versão antiga em PHP, só histórico. Não alterar.
- `docs/GUIA_DE_ESTUDO.md` — guia técnico do sistema; atualize quando mudar arquitetura, segurança ou regras de negócio.
- `docs/NOVA_MAQUINA.md` — como rodar em outro computador.

## Comandos (dentro de `amavs-next/`)

```bash
npm run dev        # localhost:3000
npm test           # Vitest (fuso fixo America/Sao_Paulo)
npm run typecheck
npm run build
```

O CI (`.github/workflows/ci.yml`) roda typecheck, testes e build. Push na `main` = deploy em produção na Vercel.

## Regras do projeto

- **Autorização mora no banco (RLS).** Toda tabela nova precisa de `enable row level security` e policy com `public.is_admin()` para escrita. Leitura pública só com policy explícita (ex.: `is_published`).
- `SUPABASE_SERVICE_ROLE_KEY` só no servidor, via `lib/supabase-admin.ts`. Nunca em `'use client'`. Ao usar, devolva ao navegador apenas dados filtrados ou agregados.
- Formulário público grava por Route Handler com Zod (`lib/validation.ts`), rate limit e checagem de origem. Nunca insert direto do navegador.
- Datas `YYYY-MM-DD` do banco: formatar com `formatDate`/`parseDbDate` de `lib/utils.ts` (evita voltar um dia em UTC-3).
- Regras de negócio como funções puras em `lib/` com testes em `lib/__tests__/`.
- Mudança de banco = novo arquivo em `amavs-next/supabase/migrations/` (idempotente). O usuário roda no SQL Editor do Supabase; não há acesso direto ao banco por CLI.
- Textos do site em português do Brasil, tom sóbrio e institucional (público: pregoeiros e fiscais de contrato). Nunca inventar números, órgãos ou contratos: dados de atestados vêm de `lib/atestados.ts`, extraídos dos documentos originais.

## Domínio

- `bids` — licitações que a empresa disputa (só painel). Etapas em `lib/licitacoes.ts`.
- `portfolio_items` — serviços prestados exibidos no site (`/licitacoes` e `/licitacoes/[slug]`), com fotos no bucket `portfolio`.
- `company_documents` — certidões com validade; arquivos no bucket **privado** `company-docs` (URL assinada de 60 s).
- `contracts`, `vehicles`, `vehicle_blocks`, `reservations`, `leads`, `trip_gallery` — contratos, frota, agenda, orçamentos e galeria.

## Pendências conhecidas (out/2026)

- `2026-10-27_security_hardening.sql` já rodado no Supabase (conferido em 27/10/2026).
- Rodar `amavs-next/supabase/migrations/2026-10-27_featured_clients_atestados.sql` (troca "Quem confia no nosso trabalho" pelos clientes com atestado; PMDF fica oculta por não ter atestado).
- Cadastro público do Supabase desligado (`disable_signup: true`, conferido em 29/10/2026) e `ADMIN_EMAILS` definido na Vercel (informado pelo Lucas).
- Bug conhecido, deixado como exercício no guia (seção 1.12): `buildWhatsAppMessage` em `lib/utils.ts` usa `filter(Boolean)` e apaga as linhas em branco da mensagem. Não corrigir sem o Lucas pedir.
- Os 6 veículos do banco são dados de demonstração (placas fictícias); a empresa vai cadastrar os reais. Vans ficam sem foto até haver fotos reais.
- Domínio oficial `www.amavsturismo.com` ainda aponta para o WordPress antigo.
- Ideias priorizadas: monitor de editais via API do PNCP (cron), alertas por e-mail de sessões e certidões, testes de integração das policies RLS.
