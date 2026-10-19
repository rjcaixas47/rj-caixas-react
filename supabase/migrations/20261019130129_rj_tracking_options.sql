begin;
-- Sem alteração nas políticas ou nas tabelas de outros projetos.
create function public.rj_valid_tracking_options(value jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb; key text; ids text[] := '{}';
begin
 if jsonb_typeof(value) <> 'object' or octet_length(value::text)>600000 then return false; end if;
 for key in select jsonb_object_keys(value) loop
  if key not in ('disabled','google_ads_label','custom_codes','verification') then return false; end if;
 end loop;
 if value ? 'google_ads_label' and (jsonb_typeof(value->'google_ads_label')<>'string' or (value->>'google_ads_label') !~ '^[A-Za-z0-9_-]{0,100}$') then return false; end if;
 if value ? 'disabled' then
  if jsonb_typeof(value->'disabled')<>'array' or jsonb_array_length(value->'disabled')>4 then return false; end if;
  for item in select * from jsonb_array_elements(value->'disabled') loop
   if jsonb_typeof(item)<>'string' or item #>> '{}' not in ('gtm_id','ga4_id','google_ads_id','meta_pixel_id') then return false; end if;
  end loop;
 end if;
 if value ? 'verification' then
  if jsonb_typeof(value->'verification')<>'object' then return false; end if;
  for key,item in select * from jsonb_each(value->'verification') loop
   if key not in ('google','meta') or jsonb_typeof(item)<>'string' or item #>> '{}' !~ '^[A-Za-z0-9_-]{0,200}$' then return false; end if;
  end loop;
 end if;
 if value ? 'custom_codes' then
  if jsonb_typeof(value->'custom_codes')<>'array' or jsonb_array_length(value->'custom_codes')>10 then return false; end if;
  for item in select * from jsonb_array_elements(value->'custom_codes') loop
   if jsonb_typeof(item)<>'object' or not (item ?& array['id','name','code','category','enabled']) then return false; end if;
   for key in select jsonb_object_keys(item) loop
    if key not in ('id','name','code','category','enabled') then return false; end if;
   end loop;
   if jsonb_typeof(item->'id')<>'string' or item->>'id' !~ '^[A-Za-z0-9_-]{1,100}$' or item->>'id'=any(ids) then return false; end if;
   ids := array_append(ids,item->>'id');
   if jsonb_typeof(item->'name')<>'string' or length(trim(item->>'name')) not between 1 and 100 then return false; end if;
   if jsonb_typeof(item->'code')<>'string' or length(trim(item->>'code')) not between 1 and 12000 then return false; end if;
   if jsonb_typeof(item->'category')<>'string' or item->>'category' not in ('analytics','marketing') then return false; end if;
   if jsonb_typeof(item->'enabled')<>'boolean' then return false; end if;
  end loop;
 end if;
 return true;
end $$;
revoke all on function public.rj_valid_tracking_options(jsonb) from public;
grant execute on function public.rj_valid_tracking_options(jsonb) to anon, authenticated;
alter table public.rj_tracking add column options jsonb not null default '{}'::jsonb
 check(public.rj_valid_tracking_options(options));
comment on column public.rj_tracking.options is 'Configuração pública. Nunca armazenar segredos. HTML só executa no sandbox da vitrine.';
commit;
