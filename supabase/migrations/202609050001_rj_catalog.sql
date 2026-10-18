begin;
-- Recursos independentes da loja de referência. Nenhuma credencial ou usuário é criado.
create table public.rj_admin_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 active boolean not null default true
);
alter table public.rj_admin_profiles enable row level security;
revoke all on public.rj_admin_profiles from anon, authenticated;
grant select on public.rj_admin_profiles to authenticated;
create policy rj_read_own_profile on public.rj_admin_profiles for select to authenticated using (id=(select auth.uid()) and active);
create function public.rj_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.rj_admin_profiles where id=(select auth.uid()) and active);
$$;
revoke all on function public.rj_is_admin() from public;
grant execute on function public.rj_is_admin() to anon, authenticated;

create function public.rj_safe_url(value text) returns boolean language sql immutable set search_path='' as $$
 select value is not null and length(value)<=2000 and
 (value='' or value ~ '^/[A-Za-z0-9_.,@%+~=-][A-Za-z0-9/_.,@%+~=-]*$' or value ~ '^#[A-Za-z0-9_-]+$' or value ~ '^https://[A-Za-z0-9.-]+(:[0-9]+)?([/?#][^[:space:]]*)?$');
$$;
create function public.rj_valid_settings(value jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text; v jsonb;
begin
 if jsonb_typeof(value) <> 'object' or length(value::text)>65000 then return false; end if;
 if length(coalesce(value->>'brand_name','')) not between 1 and 300 then return false; end if;
 if coalesce(value->>'whatsapp_url','') !~ '^https://(wa[.]me/([0-9]{8,15}|message/[A-Za-z0-9]+)([?][^[:space:]]*)?|api[.]whatsapp[.]com/send[?]([^[:space:]]*&)?phone=[0-9]{8,15}(&[^[:space:]]*)?)$' then return false; end if;
 for k,v in select * from jsonb_each(value) loop
  if k not in ('brand_name','logo','whatsapp_url','whatsapp_label','header_whatsapp_label','whatsapp_message','phone','phone_label','instagram','instagram_label','facebook','linktree','address','footer_tagline','footer_description','announcement_1','announcement_2','announcement_3','categories_title','boxes_title','envelopes_title','benefit_1_title','benefit_1_text','benefit_2_title','benefit_2_text','benefit_3_title','benefit_3_text','payment_image','about','terms','privacy','shipping','returns','faq') or jsonb_typeof(v)<>'string' then return false; end if;
  if length(value->>k)>(case when k in ('about','terms','privacy','shipping','returns','faq','footer_description') then 6000 when k in ('logo','instagram','facebook','linktree','payment_image','whatsapp_url') then 2000 else 300 end) then return false; end if;
  if k in ('logo','instagram','facebook','linktree','payment_image') and not public.rj_safe_url(value->>k) then return false; end if;
  if k='phone' and value->>k<>'' and value->>k !~ '^\+?[0-9]{8,15}$' then return false; end if;
 end loop;
 return true;
end $$;

create table public.rj_categories (
 id text primary key check (id ~ '^[A-Za-z0-9_-]{1,100}$'),
 name text not null check(length(trim(name)) between 1 and 200),
 description text not null default '' check(length(description)<=6000),
 image text not null check(image<>'' and public.rj_safe_url(image)),
 sort_order integer not null default 0 check(sort_order>=0),
 active boolean not null default true,
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create table public.rj_products (
 id text primary key check(id ~ '^[A-Za-z0-9_-]{1,100}$'),
 name text not null check(length(trim(name)) between 1 and 200),
 description text not null default '' check(length(description)<=6000),
 price_cents integer check(price_cents>=0),
 compare_at_cents integer check(compare_at_cents>=0),
 pack text not null default '' check(length(pack)<=200),
 unit_label text not null default '' check(length(unit_label)<=200),
 payment_note text not null default '' check(length(payment_note)<=300),
 badge text not null default '' check(length(badge)<=80),
 category_id text references public.rj_categories(id) on delete restrict,
 section text not null default 'boxes' check(section in ('boxes','envelopes')),
 status text not null default 'draft' check(status in ('draft','published')),
 available boolean not null default true,
 image text not null check(image<>'' and public.rj_safe_url(image)),
 image_srcset text not null default '' check(length(image_srcset)<=3000 and (image_srcset='' or image_srcset ~ '^/assets/[A-Za-z0-9_., /-]+$')),
 sort_order integer not null default 0 check(sort_order>=0),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create index rj_products_category on public.rj_products(category_id);
create index rj_products_public_order on public.rj_products(status,section,sort_order);
create table public.rj_banners (
 id text primary key check(id ~ '^[A-Za-z0-9_-]{1,100}$'),
 name text not null check(length(trim(name)) between 1 and 200),
 image text not null check(image<>'' and public.rj_safe_url(image)),
 mobile_image text not null default '' check(public.rj_safe_url(mobile_image)),
 href text not null default '' check(public.rj_safe_url(href)),
 active boolean not null default true,
 sort_order integer not null default 0 check(sort_order>=0),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create table public.rj_settings (
 id text primary key default 'site' check(id='site'),
 data jsonb not null check(public.rj_valid_settings(data)),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create function public.rj_bump_version() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id then raise exception 'Identificador não pode ser alterado'; end if;
 if new.version<>old.version then raise exception 'Versão divergente' using errcode='40001'; end if;
 new.version=old.version+1; new.updated_at=now(); return new;
end $$;
create trigger rj_products_version before update on public.rj_products for each row execute function public.rj_bump_version();
create trigger rj_categories_version before update on public.rj_categories for each row execute function public.rj_bump_version();
create trigger rj_banners_version before update on public.rj_banners for each row execute function public.rj_bump_version();
create trigger rj_settings_version before update on public.rj_settings for each row execute function public.rj_bump_version();

alter table public.rj_products enable row level security;
alter table public.rj_categories enable row level security;
alter table public.rj_banners enable row level security;
alter table public.rj_settings enable row level security;
revoke all on public.rj_products,public.rj_categories,public.rj_banners,public.rj_settings from anon,authenticated;
grant select on public.rj_products,public.rj_categories,public.rj_banners,public.rj_settings to anon,authenticated;
grant insert,update,delete on public.rj_products,public.rj_categories,public.rj_banners,public.rj_settings to authenticated;
create policy rj_products_read on public.rj_products for select to anon,authenticated using(status='published' or (select public.rj_is_admin()));
create policy rj_categories_read on public.rj_categories for select to anon,authenticated using(active or (select public.rj_is_admin()));
create policy rj_banners_read on public.rj_banners for select to anon,authenticated using(active or (select public.rj_is_admin()));
create policy rj_settings_read on public.rj_settings for select to anon,authenticated using(true);
create policy rj_products_write on public.rj_products for all to authenticated using((select public.rj_is_admin())) with check((select public.rj_is_admin()));
create policy rj_categories_write on public.rj_categories for all to authenticated using((select public.rj_is_admin())) with check((select public.rj_is_admin()));
create policy rj_banners_write on public.rj_banners for all to authenticated using((select public.rj_is_admin())) with check((select public.rj_is_admin()));
create policy rj_settings_write on public.rj_settings for all to authenticated using((select public.rj_is_admin())) with check((select public.rj_is_admin()));

-- Bucket destinado somente a imagens públicas da vitrine; nunca a documentos privados.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('rj-media','rj-media',true,5242880,array['image/png','image/jpeg','image/webp']);
create policy rj_media_insert on storage.objects for insert to authenticated with check(bucket_id='rj-media' and (select public.rj_is_admin()) and lower(name) ~ '^[a-z0-9/-]+[.](png|jpg|webp)$');
create policy rj_media_read on storage.objects for select to authenticated using(bucket_id='rj-media' and (select public.rj_is_admin()));
create policy rj_media_delete on storage.objects for delete to authenticated using(bucket_id='rj-media' and (select public.rj_is_admin()));
commit;
