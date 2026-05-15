-- ============================================================
-- Amav's Turismo — Schema Supabase
-- Execute no SQL Editor: supabase.com → seu projeto → SQL Editor
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- VEÍCULOS
-- ============================================================
create table if not exists public.vehicles (
  id           uuid default uuid_generate_v4() primary key,
  name         text not null,
  model        text not null,
  category     text not null check (category in ('onibus','micro','van')),
  capacity     int  not null check (capacity > 0),
  year         int  not null,
  plate        text not null unique,
  km           int  default 0,
  price_km     numeric(8,2) default 0,
  price_day    numeric(8,2) default 0,
  status       text default 'disponivel' check (status in ('disponivel','em_uso','manutencao')),
  next_service date,
  features     text[] default '{}',
  images       text[] default '{}',  -- múltiplas fotos do veículo
  description  text default '',
  photo_url    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- CONTRATOS
-- ============================================================
create table if not exists public.contracts (
  id           uuid default uuid_generate_v4() primary key,
  code         text not null unique,
  client       text not null,
  modality     text not null check (modality in ('pregao_eletronico','tomada_precos','concorrencia','dispensa','inexigibilidade')),
  start_date   date not null,
  end_date     date not null,
  value        numeric(12,2) not null default 0,
  status       text default 'ativo' check (status in ('ativo','encerrado','em_licitacao','suspenso')),
  vehicle_ids  uuid[] default '{}',
  document_url text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- LEADS (Orçamentos)
-- ============================================================
create table if not exists public.leads (
  id               uuid default uuid_generate_v4() primary key,
  code             text not null unique,
  name             text not null,
  phone            text not null,
  email            text,
  origin           text not null,
  destination      text not null,
  travel_date      date not null,
  return_date      date,
  passengers       int  not null default 1 check (passengers > 0),
  vehicle_category text check (vehicle_category in ('onibus','micro','van')),
  vehicle_id       uuid references public.vehicles(id) on delete set null,
  message          text,
  status           text default 'pendente' check (status in ('pendente','em_contato','aprovado','recusado','convertido')),
  source           text default 'site' check (source in ('whatsapp','site','instagram','indicacao','outro')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- RESERVAS (Calendário de disponibilidade)
-- ============================================================
create table if not exists public.reservations (
  id          uuid default uuid_generate_v4() primary key,
  vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  start_date  date not null,
  end_date    date not null,
  origin      text not null,
  destination text not null,
  passengers  int  not null default 1,
  total_value numeric(10,2) default 0,
  notes       text,
  status      text default 'confirmada' check (status in ('confirmada','pendente','cancelada')),
  created_at  timestamptz default now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table if not exists public.audit_log (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  action      text not null,
  resource    text,
  resource_id text,
  details     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz default now()
);

-- ============================================================
-- LOGIN ATTEMPTS (Rate limiting)
-- ============================================================
create table if not exists public.login_attempts (
  id          uuid default uuid_generate_v4() primary key,
  email       text not null,
  ip_address  inet,
  success     boolean default false,
  created_at  timestamptz default now()
);

create index if not exists login_attempts_email_idx on public.login_attempts (email, created_at desc);
create index if not exists login_attempts_ip_idx    on public.login_attempts (ip_address, created_at desc);
create index if not exists audit_log_created_idx    on public.audit_log (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Vehicles: public read, authenticated write
alter table public.vehicles    enable row level security;
alter table public.contracts   enable row level security;
alter table public.leads       enable row level security;
alter table public.reservations enable row level security;
alter table public.audit_log   enable row level security;
alter table public.login_attempts enable row level security;

-- Public can read vehicles and active contracts
create policy "vehicles_public_read"    on public.vehicles    for select using (true);
create policy "contracts_public_read"   on public.contracts   for select using (status = 'ativo');
create policy "reservations_public_read" on public.reservations for select using (true);

-- Public can insert leads (form submissions)
create policy "leads_public_insert"     on public.leads       for insert with check (true);

-- Authenticated users (admin) have full access
create policy "vehicles_auth_all"    on public.vehicles    for all using (auth.role() = 'authenticated');
create policy "contracts_auth_all"   on public.contracts   for all using (auth.role() = 'authenticated');
create policy "leads_auth_all"       on public.leads       for all using (auth.role() = 'authenticated');
create policy "reservations_auth_all" on public.reservations for all using (auth.role() = 'authenticated');
create policy "audit_log_auth_read"  on public.audit_log   for select using (auth.role() = 'authenticated');
create policy "audit_log_insert"     on public.audit_log   for insert with check (true);
create policy "login_attempts_insert" on public.login_attempts for insert with check (true);
create policy "login_attempts_auth_read" on public.login_attempts for select using (auth.role() = 'authenticated');

-- ============================================================
-- SUPABASE STORAGE
-- Execute no SQL Editor DEPOIS de criar as tabelas
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('vehicles', 'vehicles', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('contracts', 'contracts', false, 20971520, array['application/pdf'])
  on conflict (id) do nothing;

-- Storage policies
create policy "vehicles_public_read"    on storage.objects for select using (bucket_id = 'vehicles');
create policy "vehicles_auth_upload"    on storage.objects for insert with check (bucket_id = 'vehicles' and auth.role() = 'authenticated');
create policy "vehicles_auth_delete"    on storage.objects for delete using (bucket_id = 'vehicles' and auth.role() = 'authenticated');
create policy "contracts_auth_all"      on storage.objects for all using (bucket_id = 'contracts' and auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — dados iniciais
-- ============================================================
insert into public.vehicles (name, model, category, capacity, year, plate, km, price_km, price_day, status, features, description) values
('Ônibus Executivo Gold', 'Mercedes-Benz O-500 RS', 'onibus', 46, 2022, 'JKL-1A23', 95000, 4.50, 1800.00, 'disponivel',
 array['Ar condicionado','Wi-Fi','Tomadas USB','Poltronas reclináveis','TV','Frigobar','Banheiro'],
 'Ônibus executivo de alto padrão ideal para viagens longas, grupos corporativos e excursões premium.'),
('Ônibus Governo Federal', 'Scania K-360', 'onibus', 50, 2021, 'MNO-2B34', 140000, 4.20, 1600.00, 'em_uso',
 array['Ar condicionado','Poltronas reclináveis','Banheiro','Porta-malas amplo','GPS rastreador'],
 'Ônibus homologado para contratos governamentais. Documentação completa.'),
('Micro-ônibus Premium', 'Volare W9', 'micro', 28, 2023, 'PQR-3C45', 42000, 3.80, 1200.00, 'disponivel',
 array['Ar condicionado','Wi-Fi','Tomadas USB','Poltronas reclináveis','Janelas panorâmicas'],
 'Micro-ônibus ideal para grupos médios, eventos corporativos e traslados.'),
('Micro-ônibus Escolar', 'Neobus Thunder', 'micro', 25, 2020, 'STU-4D56', 78000, 3.20, 980.00, 'disponivel',
 array['Ar condicionado','Cinto de segurança','Câmeras internas','GPS rastreador'],
 'Adaptado para transporte escolar e excursões estudantis.'),
('Van Executiva', 'Mercedes-Benz Sprinter 416', 'van', 16, 2023, 'VWX-5E67', 28000, 2.80, 800.00, 'disponivel',
 array['Ar condicionado','Wi-Fi','Tomadas USB','Poltronas em couro','Teto alto'],
 'Van executiva de última geração para pequenos grupos e traslados VIP.'),
('Van Governo', 'Renault Master 2.3', 'van', 15, 2022, 'YZA-6F78', 55000, 2.50, 720.00, 'manutencao',
 array['Ar condicionado','GPS rastreador','Câmera de ré','Porta lateral deslizante'],
 'Van homologada para contratos com órgãos públicos.')
on conflict (plate) do nothing;

insert into public.contracts (code, client, modality, start_date, end_date, value, status, notes) values
('CT-2024-001', 'Ministério da Educação',   'pregao_eletronico', '2024-01-02', '2024-12-31', 384000, 'ativo',    'Transporte de servidores entre ministérios na Esplanada.'),
('CT-2024-002', 'SESI-DF',                  'tomada_precos',     '2024-03-01', '2025-02-28', 96000,  'ativo',    'Transporte de funcionários para eventos e confraternizações.'),
('CT-2023-008', 'Tribunal de Justiça do DF','pregao_eletronico', '2023-07-01', '2024-06-30', 156000, 'encerrado','Transporte de magistrados e servidores para diligências externas.'),
('CT-2024-003', 'SENAC-DF',                 'dispensa',          '2024-05-01', '2024-10-31', 48000,  'ativo',    'Transporte de alunos para atividades práticas externas.')
on conflict (code) do nothing;

-- ============================================================
-- VEHICLE BLOCKS (Availability calendar)
-- ============================================================
create table if not exists public.vehicle_blocks (
  id          uuid default uuid_generate_v4() primary key,
  vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
  title       text not null,
  block_type  text not null check (block_type in ('reserva','contrato_privado','manutencao','outro')),
  start_date  date not null,
  end_date    date,
  is_indefinite boolean default false,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.vehicle_blocks enable row level security;
create policy "blocks_public_read" on public.vehicle_blocks for select using (true);
create policy "blocks_auth_all"    on public.vehicle_blocks for all using (auth.role() = 'authenticated');
create index if not exists vehicle_blocks_vehicle_idx on public.vehicle_blocks (vehicle_id, start_date);

-- Contracts: add contract_type and is_public columns
alter table public.contracts add column if not exists contract_type text default 'licitacao' check (contract_type in ('licitacao','particular','pessoa_juridica','fretamento','aluguel','outro'));
alter table public.contracts add column if not exists is_public boolean default true;

-- ============================================================
-- VEHICLE MAINTENANCE (Histórico de manutenções)
-- ============================================================
create table if not exists public.vehicle_maintenance (
  id               uuid default uuid_generate_v4() primary key,
  vehicle_id       uuid not null references public.vehicles(id) on delete cascade,
  maintenance_date date not null,
  type             text not null check (type in ('preventiva','corretiva','revisao','troca_pecas','vistoria','outro')),
  description      text not null,
  cost             numeric(10,2),
  km_at_service    int,
  document_url     text,
  notes            text,
  created_at       timestamptz default now()
);
alter table public.vehicle_maintenance enable row level security;
create policy "maintenance_auth_all" on public.vehicle_maintenance for all using (auth.role() = 'authenticated');
create index if not exists vehicle_maintenance_vehicle_idx on public.vehicle_maintenance (vehicle_id, maintenance_date desc);

-- Storage bucket for maintenance documents (if not exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('maintenance', 'maintenance', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp'])
  on conflict (id) do nothing;
create policy "maintenance_auth_all" on storage.objects for all using (bucket_id = 'maintenance' and auth.role() = 'authenticated');

-- ============================================================
-- SITE STATS — números editáveis exibidos na landing
-- Auto-calc do banco + override manual (value_override).
-- ============================================================
create table if not exists public.site_stats (
  id             uuid default uuid_generate_v4() primary key,
  key            text not null unique check (key in (
    'fleet_size','trips_year','trips_month','active_contracts','total_capacity','years_experience','vehicles_available'
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
create policy "site_stats_public_read" on public.site_stats for select using (is_active);
create policy "site_stats_auth_all"    on public.site_stats for all using (auth.role() = 'authenticated');

insert into public.site_stats (key, label, sub, display_order, format) values
  ('fleet_size',         'Veículos na frota',     'Ônibus · Micro · Vans',         1, 'number'),
  ('total_capacity',     'Lugares disponíveis',   'Capacidade total da frota',     2, 'number'),
  ('active_contracts',   'Contratos ativos',      'Pública e privada',             3, 'number'),
  ('trips_year',         'Viagens este ano',      'Atualizadas em tempo real',     4, 'number')
on conflict (key) do nothing;

-- ============================================================
-- FEATURED CLIENTS — clientes em destaque na landing
-- ============================================================
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
create policy "featured_clients_public_read" on public.featured_clients for select using (is_active);
create policy "featured_clients_auth_all"    on public.featured_clients for all using (auth.role() = 'authenticated');

-- ============================================================
-- HERO IMAGES — imagens do carrossel hero (manual + opcional)
-- Quando vazio, o site cai pra fotos da tabela vehicles.
-- ============================================================
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
create policy "hero_images_public_read" on public.hero_images for select using (is_active);
create policy "hero_images_auth_all"    on public.hero_images for all using (auth.role() = 'authenticated');

-- Storage bucket for site assets (hero photos, client logos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
  on conflict (id) do nothing;
create policy "site_assets_public_read" on storage.objects for select using (bucket_id = 'site-assets');
create policy "site_assets_auth_write"  on storage.objects for all using (bucket_id = 'site-assets' and auth.role() = 'authenticated');

-- ============================================================
-- OFFICE COMPUTERS — controle interno dos PCs da empresa
-- ============================================================
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
create policy "office_computers_auth_all" on public.office_computers for all using (auth.role() = 'authenticated');

create table if not exists public.office_computer_parts (
  id           uuid default uuid_generate_v4() primary key,
  computer_id  uuid not null references public.office_computers(id) on delete cascade,
  part_type    text not null,
  description  text not null,
  installed_at date,
  cost         numeric(10,2),
  warranty_until date,
  notes        text,
  created_at   timestamptz default now()
);
alter table public.office_computer_parts enable row level security;
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
create policy "office_maint_auth_all" on public.office_computer_maintenance for all using (auth.role() = 'authenticated');

create index if not exists office_parts_computer_idx on public.office_computer_parts (computer_id);
create index if not exists office_maint_computer_idx on public.office_computer_maintenance (computer_id, service_date desc);
