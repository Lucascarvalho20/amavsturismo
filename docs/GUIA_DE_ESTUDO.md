# Guia de estudo — Amav's Turismo

Este guia explica o sistema por dentro, na ordem em que vale estudar. Cada tópico aponta para o arquivo real do projeto. Abra o arquivo ao lado e leia o código junto.

Marcação de nível:

- **[Jr]** é o que se espera de uma pessoa júnior: saber explicar o que o código faz e por quê.
- **[Pl]** é o que diferencia uma pessoa pleno: trade-offs, o que quebra em escala e como você mudaria.

Não decore as respostas. Em entrevista, o que convence é você abrir o código e explicar com as suas palavras.

---

## 0. O pitch de 60 segundos

Treine falar isto em voz alta até sair natural:

> É o sistema de uma empresa de transporte de Brasília que vive de licitações públicas. Tem um painel interno onde a equipe controla as licitações que disputa (sessões, propostas, resultado), as certidões de habilitação com alerta de vencimento e o portfólio de serviços prestados. E tem o site público, que mostra esse portfólio com os atestados do Exército, do CFC e de ministérios.
>
> A stack é Next.js com TypeScript no back e no front, Postgres no Supabase e deploy na Vercel. A parte de que mais me orgulho é a segurança: encontrei que qualquer pessoa podia criar conta e virar admin, e que o formulário público baixava nome de clientes para o navegador. Corrigi com Row Level Security no banco, permissões por coluna e rotas de API que devolvem só o necessário. Tem testes com Vitest e CI no GitHub Actions.

Depois do pitch, o entrevistador vai puxar um fio. Os capítulos abaixo preparam cada fio.

---

## 1. O caminho de uma requisição [Jr]

Entender por onde uma requisição passa é a base de qualquer conversa de back-end. São três cenários.

### 1.1 Visitante abre `/licitacoes`

1. O navegador pede `GET /licitacoes` para a Vercel.
2. O [`middleware.ts`](../amavs-next/middleware.ts) roda primeiro. Como a rota não começa com `/admin`, ele só repassa.
3. O Next.js executa o **Server Component** [`app/(public)/licitacoes/page.tsx`](../amavs-next/app/(public)/licitacoes/page.tsx) **no servidor**.
4. Ele consulta o Postgres com a chave pública (`anon`). O banco aplica RLS e só devolve itens com `is_published = true`.
5. Em paralelo, conta as licitações ganhas com a chave `service_role` (função `wonBidsCount`). Só o **número** vai para a página, nunca as linhas.
6. O servidor devolve HTML pronto. O navegador recebe a página já com o conteúdo (bom para SEO).

**Perguntas típicas**
- *O que é SSR? Por que usar aqui?* O HTML é gerado no servidor a cada requisição. Para um site que precisa aparecer no Google para "transporte licitação Brasília", o robô recebe o conteúdo pronto.
- *Qual a diferença entre Server Component e Client Component?* O Server roda só no servidor, pode acessar segredos e banco, e não manda JavaScript para o navegador. O Client (`'use client'`) roda no navegador e é necessário para estado e interação (`useState`, `onClick`). Exemplo no projeto: `AtestadosSection.tsx` (server, busca dados) renderiza `AtestadosClient.tsx` (client, animações).

### 1.2 Visitante envia o formulário de orçamento

1. [`OrcamentoForm.tsx`](../amavs-next/app/(public)/orcamento/OrcamentoForm.tsx) faz `fetch('/api/leads', { method: 'POST', body: JSON })`.
2. O Route Handler [`app/api/leads/route.ts`](../amavs-next/app/api/leads/route.ts) executa, nesta ordem:
   - `isSameOrigin`: recusa se vier de outro site (**403**);
   - `hitRateLimit`: no máximo 5 envios por IP a cada 10 minutos (**429**);
   - `leadSchema.safeParse`: valida e normaliza com Zod (**400** se inválido);
   - insere com `service_role` e devolve **201** com o código do pedido.
3. O formulário abre o WhatsApp **sem esperar** a resposta (`keepalive: true`). Se esperasse, o navegador bloquearia o pop-up, porque `window.open` só é permitido logo após um clique.

### 1.3 Admin entra no painel

1. `POST /api/admin/check-rate-limit`: o e-mail está bloqueado por tentativas?
2. `supabase.auth.signInWithPassword`: o Supabase confere a senha e grava cookies de sessão (JWT).
3. Se o usuário tem 2FA cadastrado, a sessão está em **AAL1** e o login pede o código TOTP (`mfa.challengeAndVerify`). Depois a sessão sobe para **AAL2**.
4. Em toda rota `/admin/*`, o middleware confere: sessão válida (`getUser`), e-mail na lista `ADMIN_EMAILS` e AAL2 se houver fator cadastrado.
5. As telas do painel consultam o banco com o JWT do usuário. O banco confere `is_admin()` em cada consulta.

**Pergunta clássica:** *por que conferir no middleware **e** no banco?* Defesa em profundidade. O middleware impede que a tela abra. O banco impede que o dado saia, mesmo que alguém chame a API REST do Supabase direto, sem passar pelo site. Se uma camada falhar, a outra segura.

---

## 2. HTTP e APIs [Jr]

| Código | Onde aparece no projeto | Significado |
|---|---|---|
| 200 | `GET /api/disponibilidade` | OK |
| 201 | `POST /api/leads` | Recurso criado |
| 307 | `/admin/*` sem login | Redirecionamento temporário para `/admin/login` |
| 400 | corpo inválido no `/api/leads` | Erro do cliente: dados inválidos |
| 403 | `Origin` de outro domínio | Proibido |
| 404 | `/licitacoes/slug-que-nao-existe` | Não encontrado |
| 429 | 6º envio em 10 min | Muitas requisições |
| 503 | banco não configurado | Serviço indisponível |

- **Validação na borda:** todo dado que vem de fora é tratado como hostil. [`lib/validation.ts`](../amavs-next/lib/validation.ts) define o formato aceito: datas `YYYY-MM-DD`, telefone só com dígitos, `vehicle_id` precisa ser UUID, tamanhos máximos e campo honeypot. Um campo `vehicle_id` que não é UUID é rejeitado antes de chegar a qualquer consulta.
- **Honeypot:** campo invisível no formulário. Uma pessoa não vê e deixa vazio; robôs preenchem tudo. Se vier preenchido, a requisição é rejeitada.
- **Cache HTTP:** `/api/disponibilidade` responde com `Cache-Control: s-maxage=60, stale-while-revalidate=300`. A CDN da Vercel guarda a resposta por 60 s, então 1.000 visitantes no mesmo minuto geram 1 consulta ao banco.

**[Pl]** *O rate limit é em memória. Qual o problema?* Na Vercel cada instância serverless tem a própria memória, então o limite vale por instância, não global, e zera quando a instância é reciclada. Para o volume atual serve. Em escala, usaria um contador compartilhado: Redis com `INCR` + `EXPIRE` (janela fixa), um sorted set (janela deslizante) ou uma tabela no Postgres. Saiba explicar a diferença entre **janela fixa** (simples, mas permite rajada na virada da janela) e **janela deslizante** (mais justa, um pouco mais cara).

---

## 3. Banco de dados [Jr → Pl]

Arquivos: [`supabase/schema.sql`](../amavs-next/supabase/schema.sql) e [`supabase/migrations/`](../amavs-next/supabase/migrations).

### 3.1 Básico [Jr]

- **Chave primária** `uuid default gen_random_uuid()`. *Por que UUID e não número sequencial?* Não revela quantos registros existem e não deixa adivinhar o próximo id (`/contratos/124`). O custo é ocupar mais espaço e ter índice menos compacto.
- **Chave estrangeira** `bids.portfolio_id → portfolio_items(id) on delete set null`: se o item do portfólio for apagado, a licitação continua existindo, só perde o vínculo.
- **CHECK** `status in ('prospeccao', …)`: o banco recusa um status inválido mesmo que o front-end tenha bug. Regra importante no banco não depende do código da aplicação.
- **Índices** `bids_session_idx (session_at)`: o painel ordena e filtra por data de sessão. Sem índice, o Postgres leria a tabela inteira.

### 3.2 Row Level Security (RLS) [Jr → Pl]

Este é o conceito mais importante do projeto. O Supabase expõe o banco por uma API REST, e a chave `anon` fica no navegador **de propósito**. Quem decide o que cada um vê são as **policies** no Postgres.

```sql
-- visitante só lê portfólio publicado
create policy portfolio_public_read on public.portfolio_items
  for select using (is_published);

-- admin faz tudo, mas só se estiver na tabela admin_users
create policy bids_admin_all on public.bids
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

- `using` filtra as linhas que a pessoa **lê, altera ou apaga**. `with check` valida as linhas que ela **grava**.
- **O bug original:** as policies eram `using (auth.role() = 'authenticated')`. Com o cadastro aberto, qualquer pessoa criava uma conta e virava "authenticated". Autenticação (quem você é) estava sendo usada como autorização (o que você pode fazer). Essa troca é o erro de segurança mais comum que existe (OWASP A01, *Broken Access Control*).

**[Pl] A função `is_admin()`**

```sql
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;
```

- `security definer`: a função roda com a permissão de quem a criou, então consegue ler `admin_users` mesmo que o usuário comum não tenha acesso a essa tabela.
- `set search_path = public`: sem isso, um usuário mal-intencionado poderia criar um objeto com o mesmo nome em outro schema e sequestrar a função. Toda função `security definer` deve fixar o `search_path`.
- `stable`: avisa o Postgres que o resultado não muda dentro da mesma consulta, o que permite otimizar.

**[Pl] Permissão por coluna**

```sql
revoke select on public.contracts from anon;
grant select (id, code, client, modality, status, start_date, end_date, is_public, contract_type)
  on public.contracts to anon;
```

RLS filtra **linhas**; `GRANT` por coluna filtra **colunas**. Juntos, o visitante vê só contratos públicos e, deles, nunca o valor ou as observações.

**[Pl] Migration idempotente:** a migration de segurança apaga **todas** as policies das tabelas e recria do zero (`for r in select … from pg_policies loop drop policy …`). Assim o resultado é o mesmo não importa o estado anterior do banco, e dá para rodar duas vezes sem erro.

**Como testar RLS (resposta de pleno):** subir um Postgres em container no CI, rodar as migrations e executar consultas trocando o papel com `set local role anon` / `set local request.jwt.claims = '{"sub": "…"}'`, verificando que o anônimo recebe zero linhas e o admin recebe todas. Isso ainda não existe no projeto e é um bom próximo passo.

---

## 4. Autenticação e autorização [Jr → Pl]

| Conceito | No projeto |
|---|---|
| Autenticação (quem é você) | Supabase Auth, e-mail e senha |
| Sessão | JWT em cookie, gerenciado e renovado pelo `@supabase/ssr` |
| Autorização (o que pode fazer) | `ADMIN_EMAILS` no middleware + `is_admin()` no banco |
| 2º fator | TOTP (Google Authenticator), níveis AAL1/AAL2 |
| Expiração por inatividade | `SessionGuard` faz logout após 30 min |

- **Cookie de sessão** [Pl]: o `@supabase/ssr` não marca o cookie como `httpOnly`, porque o cliente do navegador também precisa ler a sessão. Consequência: um XSS conseguiria roubar o token. Por isso o CSP e o escape automático do React importam tanto aqui. Trade-off que vale saber explicar.
- **JWT** [Jr]: token assinado com três partes (header, payload, assinatura). O servidor confia no conteúdo porque confere a assinatura. *Ele é criptografado?* Não, só assinado: qualquer um lê o payload (base64), mas ninguém consegue alterá-lo sem invalidar a assinatura.
- **`getUser()` vs `getSession()`** [Pl]: `getSession` lê o cookie local e não confirma nada com o servidor; `getUser` valida o token no Supabase. O middleware usa `getUser` porque é a barreira de segurança.
- **AAL** [Pl]: *Authenticator Assurance Level*. AAL1 = provou um fator (senha). AAL2 = provou dois. O bug original: o 2FA podia ser cadastrado, mas como ninguém conferia o AAL, a senha sozinha bastava.
- **Bloqueio de força bruta** [Pl]: o bloqueio era só por e-mail, e a rota que registra falhas era pública. Um script mandando 5 falhas a cada 15 minutos deixava o dono trancado para sempre: o mecanismo de defesa virou ataque (negação de serviço). A correção conta por **e-mail + IP** (5 falhas) e tem um teto global por e-mail (20), para pegar ataque distribuído. Ver [`check-rate-limit/route.ts`](../amavs-next/app/api/admin/check-rate-limit/route.ts).
- **Log de auditoria confiável** [Pl]: a rota `log-attempt` só grava "login com sucesso" se a própria requisição trouxer uma sessão válida do mesmo e-mail. Senão, qualquer um forjaria entradas no log.

---

## 5. Segurança: os achados como histórias de entrevista [Jr → Pl]

Use o formato **Situação → Problema → Ação → Resultado**. Cada achado abaixo dá uma resposta para "conte um problema difícil que você resolveu".

| # | Situação | Ação | Categoria OWASP |
|---|---|---|---|
| 1 | Cadastro aberto + policies por `authenticated` = qualquer um vira admin | `admin_users` + `is_admin()` + `ADMIN_EMAILS` + cadastro desligado | A01 Broken Access Control |
| 2 | Formulário baixava `reservations` inteira (nome e telefone de clientes) | `/api/disponibilidade` devolve só datas; tabela fechada para `anon` | A01 / exposição de dado pessoal (LGPD) |
| 3 | Valor e observações de contratos legíveis pela API REST | `GRANT` por coluna + policy `is_public` | A01 |
| 4 | 2FA cadastrável mas não exigido | Checagem de AAL no login e no middleware | A07 Identification and Authentication Failures |
| 5 | Bloqueio de login usável como ataque | Bloqueio por e-mail + IP com teto global | A07 |
| 6 | `/auth/callback?next=//site-malicioso.com` | `safeRedirectPath` aceita só caminho interno | Open Redirect (usado em phishing) |
| 7 | Fotos com coordenadas GPS no EXIF | Metadados removidos antes de publicar | Exposição de informação |

**Outros conceitos que podem cair:**
- **XSS e CSP** [Jr]: o React escapa texto automaticamente. O CSP em [`next.config.mjs`](../amavs-next/next.config.mjs) limita de onde scripts, imagens e iframes podem vir. *Por que `unsafe-inline` ainda está lá?* O Next.js injeta scripts inline; para tirar, é preciso CSP com *nonce* gerado no middleware. É um trade-off conhecido, e um bom "o que eu faria a seguir".
- **CSRF** [Jr]: cookies `SameSite=Lax` já barram a maior parte, e as rotas que escrevem conferem o cabeçalho `Origin`.
- **Segredos** [Jr]: `SUPABASE_SERVICE_ROLE_KEY` não tem prefixo `NEXT_PUBLIC_`, então o Next.js nunca a coloca no bundle do navegador. [`lib/supabase-admin.ts`](../amavs-next/lib/supabase-admin.ts) ainda lança erro se for importado no navegador.
- **Menor privilégio** [Pl]: cada caminho usa a credencial mais fraca que resolve. Visitante usa `anon`; admin usa o próprio JWT; `service_role` só no servidor, e só para o que precisa.

---

## 6. Regras de negócio [Jr → Pl]

### 6.1 Disponibilidade da frota — [`lib/availability.ts`](../amavs-next/lib/availability.ts)

Dois intervalos `[aS, aE]` e `[bS, bE]` se sobrepõem quando:

```
aS <= bE  &&  aE >= bS
```

Desenhe numa folha os 4 casos (b antes, b depois, b dentro, b cruzando) e confira. É pergunta clássica.

O ranking dá uma pontuação: +1000 se indisponível, +500 se pequeno demais, + o número de lugares sobrando. Menor pontuação ganha. **[Pl]** *Por que essa regra roda no navegador?* Para a resposta ser instantânea enquanto a pessoa digita. Os dados que ela usa, porém, chegam já filtrados pela API (só datas, sem nomes).

### 6.2 Indicadores de licitação — [`lib/licitacoes.ts`](../amavs-next/lib/licitacoes.ts)

`bidStats` é uma **função pura**: recebe uma lista e uma data "agora" e devolve números, sem acessar banco nem relógio. Por isso é fácil de testar. Passar `now` como parâmetro em vez de usar `new Date()` lá dentro é **injeção de dependência** na forma mais simples.

### 6.3 Validade de certidões — [`lib/documents.ts`](../amavs-next/lib/documents.ts)

Compara só **datas de calendário** (`Date.UTC(ano, mês, dia)`), não horários, para "vence hoje" não virar "vencido" às 21h por causa de fuso.

### 6.4 O bug de fuso horário [Pl]

`new Date('2016-10-24')` é interpretado como meia-noite **UTC**. Exibido em Brasília (UTC-3), vira 23/10. Toda data pura do sistema aparecia um dia antes. A correção em [`lib/utils.ts`](../amavs-next/lib/utils.ts) (`parseDbDate`) trata `YYYY-MM-DD` como data local. O teste roda com `TZ=America/Sao_Paulo` fixo no [`vitest.config.mts`](../amavs-next/vitest.config.mts), porque no CI (UTC) o bug simplesmente não aparece. Esse é o tipo de detalhe que mostra maturidade: o teste precisa reproduzir o ambiente onde o bug acontece.

### 6.5 QR Code permanente

Os QR Codes colados nos ônibus apontam para `/frota/{slug}`, e não para o UUID. O slug é gerado uma vez e não muda, então o adesivo continua funcionando mesmo se o banco for migrado. **Pergunta [Pl]:** *por que não usar o id?* Porque o id é detalhe de implementação do banco, e o QR é um contrato público de longa duração com o mundo físico.

---

## 7. Testes e CI [Jr → Pl]

```bash
cd amavs-next
npm test            # 37 testes, Vitest
npm run typecheck   # tsc --noEmit
```

| Arquivo | O que cobre |
|---|---|
| `availability.test.ts` | sobreposição de datas, bloqueio indefinido, reserva cancelada, ranking |
| `licitacoes.test.ts` | indicadores, validade de certidões, slugs |
| `validation.test.ts` | Zod, redirect seguro, rate limit, data em fuso de Brasília |

- **Pirâmide de testes** [Jr]: muitos testes unitários (rápidos, lógica pura), alguns de integração (rota + banco) e poucos end-to-end (navegador). O projeto hoje tem a base unitária.
- **CI** [Jr]: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) roda `npm ci`, typecheck, testes e build a cada push e Pull Request. `npm ci` (e não `npm install`) instala exatamente o que está no `package-lock.json`.
- **[Pl] O que falta e como faria:** testes de integração das rotas `/api/*` (chamar o handler com um `Request` montado à mão) e das policies RLS (Postgres em container), e um teste E2E de login com Playwright.

---

## 8. Git e trabalho em equipe [Jr]

- **Commit pequeno e com mensagem que explica o porquê.** Veja `git log`: `security: fecha vazamentos de dados e restringe o painel a admins`.
- **Fluxo de empresa:** tarefa no Jira/Issues → `git switch -c feat/minha-tarefa` → commits → `git push` → abrir Pull Request → CI roda → colega revisa → merge na `main` → deploy automático.
- **Quem mudou o quê:** `git log -- caminho/arquivo` e `git blame arquivo`.
- **Segredos nunca no git:** `.env.local` está no `.gitignore`. Se vazar, não basta apagar o arquivo: o segredo continua no histórico e precisa ser **trocado**.

---

## 9. Ponte para vagas com AWS [Pl]

O projeto não usa AWS, e você não deve dizer que usa. Mas saber traduzir cada peça mostra que você entende os conceitos e não só a ferramenta:

| Peça no projeto | Equivalente na AWS | O que dizer |
|---|---|---|
| Vercel (Route Handlers serverless) | Lambda + API Gateway | Mesmo modelo: função sem estado, escala por requisição, cold start |
| Postgres do Supabase | RDS for PostgreSQL / Aurora | RLS é recurso do Postgres, funciona igual no RDS |
| Supabase Auth | Cognito | JWT, MFA TOTP, grupos para papéis de admin |
| Supabase Storage + URL assinada | S3 + presigned URL | O bucket privado `company-docs` com link de 60 s é o mesmo conceito |
| Variáveis da Vercel | Secrets Manager / Parameter Store | Segredo fora do código, com rotação |
| Rate limit em memória | ElastiCache (Redis) ou WAF rate-based rule | Contador compartilhado entre instâncias |
| Cron de alertas (a fazer) | EventBridge Scheduler + Lambda | Job agendado diário |
| Logs | CloudWatch | Logs estruturados + alarmes |

**Exercício que vale ouro:** implementar o monitor de editais do PNCP (seção 11) como uma Lambda agendada pelo EventBridge, gravando no mesmo Postgres. Isso dá uma experiência real de AWS para colocar no currículo.

---

## 10. Perguntas de entrevista

### Júnior

1. **O que é uma API REST?** Interface sobre HTTP em que recursos têm URLs e os verbos dizem a ação (GET lê, POST cria…). Ex.: `POST /api/leads` cria um pedido.
2. **Diferença entre 401 e 403?** 401: não sei quem você é (falta autenticação). 403: sei quem você é, mas você não pode (falta autorização).
3. **Por que validar no servidor se o formulário já valida?** Porque qualquer um pode chamar a API sem o formulário (curl, Postman). Validação no front é conforto; no servidor é segurança.
4. **O que é uma variável de ambiente e por que usar?** Configuração fora do código: segredos e valores que mudam entre local e produção.
5. **SQL injection: o projeto corre risco?** As consultas usam o SDK, que parametriza os valores, e os campos que viram filtro (como `vehicle_id`) são validados como UUID antes.
6. **O que é `async/await`?** Forma de escrever código assíncrono como se fosse sequencial. `Promise.all` roda várias consultas em paralelo, como em `licitacoes/page.tsx`.
7. **Server Component vs Client Component?** Ver seção 1.1.
8. **O que o middleware faz?** Ver seção 1.3.
9. **Por que TypeScript?** Erros de tipo aparecem antes de rodar. Ex.: o `Record<BidStatus, string>` obriga a ter rótulo para cada status; se um status novo for criado, o compilador avisa.
10. **Como você testa uma função que depende da data de hoje?** Recebendo a data como parâmetro (`bidStats(bids, now)`).

### Pleno

1. **Como você garante que um usuário não acesse dados de outro mesmo com bug no front?** Autorização no banco (RLS) e permissão por coluna; o front é só conveniência.
2. **O rate limit funciona com 10 instâncias serverless?** Não de forma global. Explique janela fixa vs deslizante e a solução com Redis.
3. **Como você faria o alerta diário de certidões vencendo?** Cron (Vercel Cron ou EventBridge) chamando uma rota protegida por segredo, que consulta `documentStatus` e envia e-mail. Idempotência: registrar o que já foi avisado para não mandar duas vezes se o job reexecutar.
4. **Como faria deploy de uma migration sem quebrar produção?** Mudanças compatíveis primeiro (adicionar coluna/tabela), deploy do código que funciona com e sem a mudança, depois a parte restritiva. Foi exatamente a ordem usada aqui: o código tem fallback quando a tabela `portfolio_items` ainda não existe.
5. **O que acontece se dois admins editarem a mesma licitação ao mesmo tempo?** Hoje, o último a salvar vence (*last write wins*). Para evitar: controle otimista com `updated_at` na cláusula `WHERE` do update; se zero linhas forem afetadas, alguém salvou antes e a tela avisa.
6. **Como você observaria esse sistema em produção?** Logs estruturados nas rotas, alertas de taxa de erro 5xx, métricas de latência do banco, e o `audit_log` para ações de admin.
7. **Por que a regra de disponibilidade roda no cliente? Riscos?** Velocidade da resposta. Risco: o cliente pode ser manipulado, mas aqui ele só **sugere** um veículo; a decisão final é humana, no painel. Se houvesse reserva automática, a checagem teria de ser repetida no servidor dentro de uma transação.
8. **Como evitar duas reservas sobrepostas para o mesmo ônibus?** Constraint de exclusão no Postgres (precisa da extensão `btree_gist` para comparar o `uuid` com `=`): `EXCLUDE USING gist (vehicle_id WITH =, daterange(start_date, end_date, '[]') WITH &&)`. O banco recusa a sobreposição mesmo com duas requisições simultâneas, coisa que uma checagem no código não garante.
9. **Como migrar para multi-empresa (SaaS)?** Coluna `company_id` em todas as tabelas, policies RLS filtrando por `company_id` do JWT, e índices compostos começando por `company_id`.
10. **O que você mudaria primeiro se tivesse uma semana?** Testes de integração das policies, CSP com nonce e o monitor de editais do PNCP.

---

## 11. Exercícios para fixar (e para contar na entrevista)

Fazer **um** destes sozinho vale mais que ler o guia inteiro duas vezes.

1. **[Jr] Endpoint de saúde.** Crie `GET /api/health` que responde `{ ok: true, db: true/false }`, testando uma consulta simples no banco.
2. **[Jr] Teste novo.** Escreva testes para `checkVehicleAvailability` com uma reserva que começa exatamente no dia em que a viagem termina. Ela deveria conflitar?
3. **[Pl] Rate limit no Postgres.** Troque `lib/rate-limit.ts` por uma tabela `rate_limits (key, window_start, count)` com `insert … on conflict do update`. Compare com a versão em memória.
4. **[Pl] Monitor de editais.** Use a API pública do PNCP (`https://pncp.gov.br/api/consulta`) para buscar contratações de transporte de passageiros no DF e criar licitações em `prospeccao`. Rode como cron. Pense em: paginação, deduplicação pelo número de controle e o que fazer se a API estiver fora.
5. **[Pl] Bloquear sobreposição no banco.** Implemente a constraint `EXCLUDE` da pergunta 8 e escreva um teste que tenta inserir duas reservas conflitantes.

---

## 12. Júnior ou pleno?

Ser pleno não depende do tamanho do projeto, e sim de tempo resolvendo problemas em produção e de autonomia. Este projeto te coloca em boa posição para vagas **júnior** e ajuda a disputar vagas **pleno** de empresas menores, desde que você:

- explique cada decisão das seções 3 a 6 sem olhar o código;
- tenha feito pelo menos um exercício [Pl] da seção 11 sozinho;
- fale com honestidade sobre como o projeto foi feito. Se usou IA como ferramenta, diga isso e mostre que entende e consegue mudar o código. Entrevistador experiente percebe em duas perguntas quando alguém não entende o próprio projeto, e honestidade com domínio técnico pesa mais que parecer ter feito tudo sozinho.
