-- ============================================================================
-- 2026-10-27 — Segurança + gestão de licitações, portfólio e documentos
--
-- O QUE MUDA
--   * Antes: qualquer usuário "authenticated" era admin. Com o cadastro público
--     do Supabase ligado, qualquer pessoa podia criar conta e ler/alterar tudo.
--     Agora: só quem está em public.admin_users (função public.is_admin()).
--   * Visitantes anônimos deixam de ler reservas, bloqueios de agenda,
--     valores/observações de contratos. O site público lê esses dados pelo
--     servidor (rotas /api/*) e recebe apenas o necessário.
--   * Gravação anônima em audit_log, login_attempts e leads removida — só o
--     servidor (service_role) grava.
--   * Novas tabelas:
--       bids              licitações que a empresa disputa (só admin)
--       portfolio_items   serviços prestados exibidos no site (já com os 10 atestados)
--       company_documents certidões e documentos de habilitação com validade (só admin)
--
-- COMO RODAR (nesta ordem)
--   1. Faça o deploy do código novo (as rotas /api/* precisam existir antes).
--   2. Confira o(s) e-mail(s) de administrador na seção 1 (para incluir outra
--      pessoa depois: crie o usuário em Authentication e rode o mesmo insert).
--   3. Supabase → SQL Editor → cole este arquivo inteiro → Run.
--   4. Supabase → Authentication → Sign In / Providers → desligue "Allow new users to sign up".
-- ============================================================================

begin;

-- ── 1. Administradores ──────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- sem policies: nenhum cliente (anon/authenticated) lê ou altera esta tabela
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- >>> EDITE AQUI: e-mails que podem acessar o painel <<<
insert into public.admin_users (user_id, email)
select id, lower(email) from auth.users
where lower(email) in ('j.lucas.jol45@gmail.com')
on conflict (user_id) do nothing;

-- ── 2. Licitações, portfólio e documentos ──────────────────────────────────
drop table if exists public.bid_requests;

create table if not exists public.bids (
  id               uuid primary key default gen_random_uuid(),
  organization     text not null,
  process_number   text,
  modality         text not null default 'pregao_eletronico'
                   check (modality in ('pregao_eletronico','concorrencia','dispensa','inexigibilidade','ata_srp','cotacao','outro')),
  platform         text,
  object           text not null,
  location         text,
  session_at       timestamptz,
  estimated_value  numeric(14,2),
  proposed_value   numeric(14,2),
  awarded_value    numeric(14,2),
  status           text not null default 'em_analise'
                   check (status in ('prospeccao','em_analise','proposta_enviada','aguardando_resultado','ganha','perdida','desistencia','cancelada')),
  edital_url       text,
  notes            text,
  portfolio_id     uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists bids_session_idx on public.bids (session_at);
create index if not exists bids_status_idx  on public.bids (status);

create table if not exists public.portfolio_items (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  organization     text not null,
  acronym          text,
  parent_org       text,
  kind             text not null default 'orgao_publico' check (kind in ('orgao_publico','entidade','empresa')),
  period_label     text,
  attested_at      date,
  location         text,
  summary          text not null,
  description      text,
  highlight_value  text,
  highlight_label  text,
  reference        text,
  areas            text[] not null default '{}',
  photos           text[] not null default '{}',
  is_published     boolean not null default true,
  display_order    int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists portfolio_order_idx on public.portfolio_items (display_order);

alter table public.bids drop constraint if exists bids_portfolio_fk;
alter table public.bids add constraint bids_portfolio_fk
  foreign key (portfolio_id) references public.portfolio_items(id) on delete set null;

create table if not exists public.company_documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null default 'fiscal' check (category in ('fiscal','trabalhista','juridica','tecnica','economica','veiculos','outro')),
  issuer       text,
  number       text,
  issued_at    date,
  expires_at   date,
  file_path    text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists company_documents_exp_idx on public.company_documents (expires_at);

alter table public.bids              enable row level security;
alter table public.portfolio_items   enable row level security;
alter table public.company_documents enable row level security;

-- Portfólio inicial: atestados de capacidade técnica recuperados do site antigo
insert into public.portfolio_items
  (slug, organization, acronym, parent_org, kind, period_label, attested_at, summary, highlight_value, highlight_label, reference, areas, display_order)
values
  ('colegio-militar-de-brasilia', 'Colégio Militar de Brasília', 'CMB', 'Ministério da Defesa · Exército Brasileiro', 'orgao_publico', '2010 – 2017', '2017-12-19', 'Transporte rodoviário interestadual e urbano com ônibus de turismo, ônibus urbanos, micro-ônibus e vans executivas nos Jogos da Amizade (Brasília 2010, Curitiba 2011 e 2017) e na Parada Militar de 7 de Setembro de 2010 a 2016.', '80+', 'veículos em comboio', null, array['transporte','passagens']::text[], 10),
  ('cfc-congresso-brasileiro-de-contabilidade-2016', 'Conselho Federal de Contabilidade', 'CFC', 'Autarquia federal', 'orgao_publico', 'Set/2016', '2016-10-24', '90 ônibus de turismo, 34 vans e 8 micro-ônibus, além de 102 monitores, 26 recepcionistas e 6 coordenadores, para o 20º Congresso Brasileiro de Contabilidade em Fortaleza-CE.', '132', 'veículos em um único evento', 'Pregão Eletrônico nº 17/2016 · Processo nº 2016/000699', array['transporte','eventos']::text[], 20),
  ('22-batalhao-de-infantaria-eleicoes-2018', '22º Batalhão de Infantaria', '22º BI', 'Ministério da Defesa · Exército Brasileiro', 'orgao_publico', '2018', '2019-02-07', 'Transporte estadual e urbano em Palmas-TO com ônibus, micro-ônibus, veículos e caminhonetes na eleição suplementar para governador do Tocantins e nas eleições gerais de 2018 (1º e 2º turnos).', '30+', 'veículos em operação eleitoral', null, array['transporte']::text[], 30),
  ('estado-maior-do-exercito-2019', 'Estado-Maior do Exército', 'EME', 'Ministério da Defesa · Exército Brasileiro', 'orgao_publico', '2019', '2019-01-22', 'Locação de veículo executivo sedã com motorista para o Estado-Maior do Exército em Brasília-DF.', '65', 'diárias de veículo executivo', 'Nota de Empenho 2018NE800001', array['transporte']::text[], 40),
  ('ministerio-publico-do-trabalho', 'Ministério Público do Trabalho', 'MPT', 'Procuradoria-Geral do Trabalho', 'orgao_publico', '2012 – 2015', '2015-11-16', 'Agenciamento de hospedagem em hotéis de 3 a 5 estrelas em Brasília-DF.', '9.900', 'diárias de hospedagem/ano', 'Contrato nº 29/2012 (3º Termo Aditivo)', array['eventos']::text[], 50),
  ('ministerio-da-saude-unesco-2012', 'Departamento de DST, Aids e Hepatites Virais', 'MS / UNESCO', 'Ministério da Saúde · Projeto 914 BRA 1101', 'orgao_publico', 'Mai/2012', '2012-06-26', 'Vencedora de processo licitatório para hospedagem, alimentação, salas e equipamentos de evento internacional em Manágua (Nicarágua).', null, null, 'Processo nº 069/2012 · Contrato UNESCO ED00649/2012', array['eventos']::text[], 60),
  ('ifsuldeminas-passagens-aereas', 'Instituto Federal do Sul de Minas Gerais', 'IFSULDEMINAS', 'Ministério da Educação', 'orgao_publico', '2014', null, 'Agenciamento de viagens: cotação, reserva, emissão, remarcação e cancelamento de passagens aéreas nacionais e internacionais.', null, null, 'Contrato nº 01/2014', array['passagens']::text[], 70),
  ('fenapef-2012', 'Federação Nacional dos Policiais Federais', 'FENAPEF', null, 'entidade', '2012', '2012-02-02', 'Receptivo aeroporto/hotel em vans executivas (15 lugares) e micro-ônibus executivo (26 lugares), hospedagem, salas, áudio e vídeo e passagens aéreas.', null, null, null, array['transporte','eventos','passagens']::text[], 80),
  ('ibrad-2012', 'Instituto Brasileiro de Administração para o Desenvolvimento', 'IBRAD', null, 'entidade', '2012', '2012-02-02', 'Receptivo aeroporto/hotel em vans executivas e micro-ônibus executivo, hospedagem, coffee-break, salas e equipamentos de áudio e vídeo.', null, null, null, array['transporte','eventos','passagens']::text[], 90),
  ('grande-oriente-do-brasil-2013', 'Grande Oriente do Brasil', 'GOB', null, 'entidade', '2013', '2013-07-15', 'Tradução simultânea (inglês, espanhol, francês e Libras), recepcionistas e locação de áudio e vídeo.', null, null, null, array['eventos']::text[], 100)
on conflict (slug) do nothing;

-- Buckets: fotos do portfólio (públicas) e documentos da empresa (privados)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-docs', 'company-docs', false, 15728640, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ── 3. Recria TODAS as policies das tabelas do sistema ──────────────────────
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in (
      'vehicles','contracts','leads','reservations','audit_log','login_attempts',
      'vehicle_blocks','vehicle_maintenance','site_stats','featured_clients','hero_images',
      'trip_gallery','office_computers','office_computer_parts','office_computer_maintenance',
      'bids','portfolio_items','company_documents'
    )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Catálogo público (somente leitura para visitantes)
create policy vehicles_public_read      on public.vehicles         for select using (true);
create policy site_stats_public_read    on public.site_stats       for select using (is_active);
create policy featured_public_read      on public.featured_clients for select using (is_active);
create policy hero_images_public_read   on public.hero_images      for select using (is_active);
create policy trip_gallery_public_read  on public.trip_gallery     for select using (is_active);
create policy portfolio_public_read     on public.portfolio_items  for select using (is_published);

-- Contratos: visitante vê só os marcados como públicos, e só colunas não sensíveis
create policy contracts_public_read on public.contracts
  for select using (is_public and status in ('ativo','em_licitacao','encerrado'));
revoke select on public.contracts from anon;
grant select (id, code, client, modality, status, start_date, end_date, is_public, contract_type)
  on public.contracts to anon;
alter table public.contracts alter column is_public set default false;

-- Administração: tudo exige is_admin()
do $$
declare t text;
begin
  foreach t in array array[
    'vehicles','contracts','leads','reservations','vehicle_blocks','vehicle_maintenance',
    'site_stats','featured_clients','hero_images','trip_gallery',
    'office_computers','office_computer_parts','office_computer_maintenance',
    'bids','portfolio_items','company_documents'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- Logs: admin só lê; gravação exclusiva do servidor (service_role ignora RLS)
create policy audit_log_admin_read      on public.audit_log      for select to authenticated using (public.is_admin());
create policy login_attempts_admin_read on public.login_attempts for select to authenticated using (public.is_admin());

-- ── 4. Storage ──────────────────────────────────────────────────────────────
drop policy if exists "vehicles_public_read"    on storage.objects;
drop policy if exists "vehicles_auth_upload"    on storage.objects;
drop policy if exists "vehicles_auth_delete"    on storage.objects;
drop policy if exists "contracts_auth_all"      on storage.objects;
drop policy if exists "maintenance_auth_all"    on storage.objects;
drop policy if exists "site_assets_public_read" on storage.objects;
drop policy if exists "site_assets_auth_write"  on storage.objects;
drop policy if exists "trip_media_public_read"  on storage.objects;
drop policy if exists "trip_media_auth_write"   on storage.objects;
drop policy if exists "public_buckets_read"     on storage.objects;
drop policy if exists "admin_buckets_write"     on storage.objects;

-- Fotos públicas: leitura livre
create policy "public_buckets_read" on storage.objects
  for select using (bucket_id in ('vehicles','site-assets','trip-media','portfolio'));

-- Upload/edição/remoção (e leitura de contratos e manutenção): só admin
create policy "admin_buckets_write" on storage.objects
  for all to authenticated
  using (bucket_id in ('vehicles','site-assets','trip-media','portfolio','contracts','maintenance','company-docs') and public.is_admin())
  with check (bucket_id in ('vehicles','site-assets','trip-media','portfolio','contracts','maintenance','company-docs') and public.is_admin());

-- Contratos de demonstração criados junto com o schema inicial não aparecem no site
update public.contracts set is_public = false
where code in ('CT-2024-001','CT-2024-002','CT-2024-003','CT-2023-008');

commit;

-- ── Conferência ─────────────────────────────────────────────────────────────
-- Quem é admin agora (deve listar só vocês):
select a.email, a.created_at from public.admin_users a order by a.created_at;
-- Todas as contas existentes (confira se há alguém desconhecido e remova em Authentication → Users):
select email, created_at, last_sign_in_at from auth.users order by created_at;
