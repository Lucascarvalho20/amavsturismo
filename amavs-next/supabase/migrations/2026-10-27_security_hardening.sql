-- ============================================================================
-- 2026-10-27 — Endurecimento de segurança + solicitações de licitação
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
--   * Nova tabela bid_requests (pedidos de proposta de órgãos públicos).
--
-- COMO RODAR (nesta ordem)
--   1. Faça o deploy do código novo (as rotas /api/* precisam existir antes).
--   2. Troque 'SEU-EMAIL@exemplo.com' abaixo pelo(s) e-mail(s) dos administradores.
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
where lower(email) in ('seu-email@exemplo.com')
on conflict (user_id) do nothing;

-- ── 2. Pedidos de proposta (licitações) ─────────────────────────────────────
create table if not exists public.bid_requests (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  organization    text not null,
  contact_name    text not null,
  role            text,
  email           text not null,
  phone           text not null,
  modality        text not null check (modality in ('pregao_eletronico','concorrencia','dispensa','inexigibilidade','ata_srp','cotacao_previa','outro')),
  process_number  text,
  session_date    date,
  service_start   date,
  vehicles_needed text,
  object          text not null check (char_length(object) between 10 and 3000),
  edital_url      text,
  status          text not null default 'nova' check (status in ('nova','em_analise','proposta_enviada','vencida','perdida','descartada')),
  internal_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists bid_requests_created_idx on public.bid_requests (created_at desc);
alter table public.bid_requests enable row level security;

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
      'bid_requests'
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
    'office_computers','office_computer_parts','office_computer_maintenance','bid_requests'
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
  for select using (bucket_id in ('vehicles','site-assets','trip-media'));

-- Upload/edição/remoção (e leitura de contratos e manutenção): só admin
create policy "admin_buckets_write" on storage.objects
  for all to authenticated
  using (bucket_id in ('vehicles','site-assets','trip-media','contracts','maintenance') and public.is_admin())
  with check (bucket_id in ('vehicles','site-assets','trip-media','contracts','maintenance') and public.is_admin());

commit;

-- ── Conferência ─────────────────────────────────────────────────────────────
-- Quem é admin agora (deve listar só vocês):
select a.email, a.created_at from public.admin_users a order by a.created_at;
-- Todas as contas existentes (confira se há alguém desconhecido e remova em Authentication → Users):
select email, created_at, last_sign_in_at from auth.users order by created_at;
