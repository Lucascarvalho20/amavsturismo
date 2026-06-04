-- ============================================================
-- Migration: Slug permanente para QR Codes dos veículos
-- Data: 2026-06-04
-- INSTRUÇÃO: Execute no SQL Editor do Supabase
-- ============================================================

-- Adiciona a coluna slug (identificador permanente para URLs dos QR Codes)
alter table public.vehicles add column if not exists slug text;

-- Para registros já existentes, gera slug a partir da placa (já é unique)
update public.vehicles
set slug = lower(plate)
where slug is null;

-- Torna a coluna obrigatória
alter table public.vehicles alter column slug set not null;

-- Adiciona constraint unique (protege contra slugs duplicados)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'vehicles_slug_unique' and conrelid = 'public.vehicles'::regclass
  ) then
    alter table public.vehicles add constraint vehicles_slug_unique unique (slug);
  end if;
end $$;

-- Índice para lookup rápido por slug
create index if not exists vehicles_slug_idx on public.vehicles (slug);

-- ============================================================
-- COMO FUNCIONA:
--
-- Cada veículo recebe um slug único e permanente.
-- A URL do QR Code será: https://amavsturismo.com/frota/{slug}
--
-- REGRA DE OURO: após imprimir e colar o QR Code no ônibus,
-- o slug desse veículo NUNCA pode ser alterado.
-- O banco pode ser migrado, o domínio pode mudar — o slug fica.
-- ============================================================
