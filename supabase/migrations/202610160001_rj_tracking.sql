begin;
-- IDs de rastreamento da vitrine (aba Rastreamento do painel). Requer 202609050001_rj_catalog.sql.
-- Só identificadores com formato fixo, nunca HTML ou script: o site monta as tags a partir deles.
-- Leitura pública (os IDs ficam visíveis no navegador de qualquer forma); escrita só para admin ativo.
create table public.rj_tracking (
 id text primary key default 'site' check(id='site'),
 gtm_id text not null default '' check(gtm_id ~ '^(GTM-[A-Z0-9]{4,12})?$'),
 ga4_id text not null default '' check(ga4_id ~ '^(G-[A-Z0-9]{4,16})?$'),
 google_ads_id text not null default '' check(google_ads_id ~ '^(AW-[0-9]{6,15})?$'),
 meta_pixel_id text not null default '' check(meta_pixel_id ~ '^([0-9]{15,16})?$'),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create trigger rj_tracking_version before update on public.rj_tracking for each row execute function public.rj_bump_version();

alter table public.rj_tracking enable row level security;
revoke all on public.rj_tracking from anon,authenticated;
grant select on public.rj_tracking to anon,authenticated;
grant insert,update on public.rj_tracking to authenticated;
create policy rj_tracking_read on public.rj_tracking for select to anon,authenticated using(true);
create policy rj_tracking_insert on public.rj_tracking for insert to authenticated with check((select public.rj_is_admin()));
create policy rj_tracking_update on public.rj_tracking for update to authenticated using((select public.rj_is_admin())) with check((select public.rj_is_admin()));
commit;
