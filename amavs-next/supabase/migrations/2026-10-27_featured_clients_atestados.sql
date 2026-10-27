-- ============================================================================
-- 2026-10-27 — "Quem confia no nosso trabalho" só com clientes comprovados
--
-- A seção da página inicial (tabela featured_clients) passa a listar apenas
-- quem emitiu atestado de capacidade técnica para a Amav's (lib/atestados.ts):
-- primeiro os órgãos públicos, depois as entidades.
--
-- Clientes sem atestado (ex.: PMDF) ficam ocultos (is_active = false), não
-- apagados: se houver comprovação, basta reativar em /admin/personalizar.
-- Depois de rodar, nomes, ordem e logos continuam editáveis pelo painel.
--
-- COMO RODAR: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Pode rodar mais de uma vez sem duplicar nada.
-- ============================================================================

begin;

with comprovados (name, acronym, display_order) as (
  values
    ('Colégio Militar de Brasília',                                 'CMB',          10),
    ('Conselho Federal de Contabilidade',                           'CFC',          20),
    ('22º Batalhão de Infantaria',                                  '22º BI',       30),
    ('Estado-Maior do Exército',                                    'EME',          40),
    ('Ministério Público do Trabalho',                              'MPT',          50),
    ('Ministério da Saúde / UNESCO',                                'MS',           60),
    ('Instituto Federal do Sul de Minas Gerais',                    'IFSULDEMINAS', 70),
    ('Federação Nacional dos Policiais Federais',                   'FENAPEF',      80),
    ('Instituto Brasileiro de Administração para o Desenvolvimento','IBRAD',        90),
    ('Grande Oriente do Brasil',                                    'GOB',         100)
)
insert into public.featured_clients (name, acronym, display_order, is_active)
select c.name, c.acronym, c.display_order, true
from comprovados c
where not exists (
  select 1 from public.featured_clients f where f.acronym = c.acronym
);

-- Oculta quem não tem atestado
update public.featured_clients
set is_active = false, updated_at = now()
where acronym is null
   or acronym <> all (array[
     'CMB','CFC','22º BI','EME','MPT','MS','IFSULDEMINAS','FENAPEF','IBRAD','GOB'
   ]);

commit;

-- ── Conferência ─────────────────────────────────────────────────────────────
select name, acronym, display_order, is_active
from public.featured_clients
order by is_active desc, display_order;
