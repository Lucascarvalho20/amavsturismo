-- ============================================================
-- Migration: Galeria de Viagens
-- Data: 2026-06-03
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TRIP GALLERY — fotos e vídeos de viagens realizadas
-- ─────────────────────────────────────────────────────────────
create table if not exists public.trip_gallery (
  id            uuid default uuid_generate_v4() primary key,
  media_type    text not null check (media_type in ('photo', 'video')),
  url           text not null,
  thumbnail_url text,
  caption       text,
  location      text,
  trip_date     date,
  display_order int default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.trip_gallery enable row level security;

drop policy if exists "trip_gallery_public_read" on public.trip_gallery;
drop policy if exists "trip_gallery_auth_all"    on public.trip_gallery;

create policy "trip_gallery_public_read" on public.trip_gallery
  for select using (is_active = true);

create policy "trip_gallery_auth_all" on public.trip_gallery
  for all using (auth.role() = 'authenticated');

create index if not exists trip_gallery_order_idx
  on public.trip_gallery (display_order asc, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET — fotos das viagens
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('trip-media', 'trip-media', true, 10485760,
          array['image/jpeg','image/png','image/webp'])
  on conflict (id) do nothing;

drop policy if exists "trip_media_public_read" on storage.objects;
drop policy if exists "trip_media_auth_write"  on storage.objects;

create policy "trip_media_public_read"
  on storage.objects for select using (bucket_id = 'trip-media');

create policy "trip_media_auth_write"
  on storage.objects for all
  using (bucket_id = 'trip-media' and auth.role() = 'authenticated');

-- ============================================================
-- FIM DA MIGRATION
-- Rode no SQL Editor do Supabase e depois acesse /admin/galeria
-- ============================================================
