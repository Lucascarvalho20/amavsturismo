-- ============================================================
-- Migration: Personalizar Site + PC Tracking
-- Data: 2026-05-13
-- ============================================================
-- Crie estas tabelas no Supabase pra a aba `/admin/personalizar`
-- funcionar. É 100% aditivo (não apaga nada existente).
-- ============================================================

-- Extensão (caso não tenha sido criada antes)
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- SITE STATS — números editáveis exibidos na landing
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_stats (
  id             uuid default uuid_generate_v4() primary key,
  key            text not null unique check (key in (
    'fleet_size','trips_year','trips_month','active_contracts',
    'total_capacity','years_experience','vehicles_available'
  )),
  label          text not null,
  sub            text default '',
  value_override numeric,
  display_order  int  default 0,
  is_active      boolean default true,
  format         text default 'number' check (format in ('number','currency','percent')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table public.site_stats enable row level security;
drop policy if exists "site_stats_public_read" on public.site_stats;
drop policy if exists "site_stats_auth_all"    on public.site_stats;
create policy "site_stats_public_read" on public.site_stats for select using (is_active);
create policy "site_stats_auth_all"    on public.site_stats for all using (auth.role() = 'authenticated');

-- Dados iniciais
insert into public.site_stats (key, label, sub, display_order, format) values
  ('fleet_size',       'Veículos na frota',   'Ônibus · Micro · Vans',     1, 'number'),
  ('total_capacity',   'Lugares disponíveis', 'Capacidade total da frota', 2, 'number'),
  ('active_contracts', 'Contratos ativos',    'Pública e privada',         3, 'number'),
  ('trips_year',       'Viagens este ano',    'Atualizadas em tempo real', 4, 'number')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────
-- FEATURED CLIENTS — clientes em destaque na landing
-- ─────────────────────────────────────────────────────────────
create table if not exists public.featured_clients (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  acronym       text,
  logo_url      text,
  display_order int  default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.featured_clients enable row level security;
drop policy if exists "featured_clients_public_read" on public.featured_clients;
drop policy if exists "featured_clients_auth_all"    on public.featured_clients;
create policy "featured_clients_public_read" on public.featured_clients for select using (is_active);
create policy "featured_clients_auth_all"    on public.featured_clients for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- HERO IMAGES — fotos do carrossel do hero
-- ─────────────────────────────────────────────────────────────
create table if not exists public.hero_images (
  id            uuid default uuid_generate_v4() primary key,
  image_url     text not null,
  title         text,
  subtitle      text,
  display_order int  default 0,
  is_active     boolean default true,
  created_at    timestamptz default now()
);
alter table public.hero_images enable row level security;
drop policy if exists "hero_images_public_read" on public.hero_images;
drop policy if exists "hero_images_auth_all"    on public.hero_images;
create policy "hero_images_public_read" on public.hero_images for select using (is_active);
create policy "hero_images_auth_all"    on public.hero_images for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET — para upload de logos e fotos do hero
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('site-assets', 'site-assets', true, 5242880,
          array['image/jpeg','image/png','image/webp','image/svg+xml'])
  on conflict (id) do nothing;

drop policy if exists "site_assets_public_read" on storage.objects;
drop policy if exists "site_assets_auth_write"  on storage.objects;
create policy "site_assets_public_read"
  on storage.objects for select using (bucket_id = 'site-assets');
create policy "site_assets_auth_write"
  on storage.objects for all using (bucket_id = 'site-assets' and auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- OFFICE COMPUTERS — controle interno dos PCs da empresa
-- (próxima fase do projeto; tabela já criada pra evitar migração futura)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.office_computers (
  id             uuid default uuid_generate_v4() primary key,
  name           text not null,
  user_assigned  text,
  purchase_date  date,
  purchase_value numeric(10,2),
  invoice_url    text,
  cpu            text,
  ram            text,
  storage        text,
  gpu            text,
  monitor        text,
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table public.office_computers enable row level security;
drop policy if exists "office_computers_auth_all" on public.office_computers;
create policy "office_computers_auth_all" on public.office_computers for all using (auth.role() = 'authenticated');

create table if not exists public.office_computer_parts (
  id             uuid default uuid_generate_v4() primary key,
  computer_id    uuid not null references public.office_computers(id) on delete cascade,
  part_type      text not null,
  description    text not null,
  installed_at   date,
  cost           numeric(10,2),
  warranty_until date,
  notes          text,
  created_at     timestamptz default now()
);
alter table public.office_computer_parts enable row level security;
drop policy if exists "office_parts_auth_all" on public.office_computer_parts;
create policy "office_parts_auth_all" on public.office_computer_parts for all using (auth.role() = 'authenticated');

create table if not exists public.office_computer_maintenance (
  id           uuid default uuid_generate_v4() primary key,
  computer_id  uuid not null references public.office_computers(id) on delete cascade,
  service_date date not null,
  type         text not null check (type in ('formatacao','limpeza','troca_peca','reinstalacao','reparo','outro')),
  description  text not null,
  cost         numeric(10,2),
  performed_by text,
  notes        text,
  created_at   timestamptz default now()
);
alter table public.office_computer_maintenance enable row level security;
drop policy if exists "office_maint_auth_all" on public.office_computer_maintenance;
create policy "office_maint_auth_all" on public.office_computer_maintenance for all using (auth.role() = 'authenticated');

create index if not exists office_parts_computer_idx on public.office_computer_parts (computer_id);
create index if not exists office_maint_computer_idx on public.office_computer_maintenance (computer_id, service_date desc);

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
-- Se rodou sem erros, abra /admin/personalizar no site e teste.
-- ============================================================
