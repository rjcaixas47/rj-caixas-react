import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const bin=process.env.PG_BIN||'/opt/homebrew/opt/postgresql@18/bin';
const temp=mkdtempSync(path.join(os.tmpdir(),'rj-db-test-'));let started=false;
function sql(query){try{return execFileSync(path.join(bin,'psql'),['-h',temp,'-p','55439','-U','rj_test','-d','postgres','-X','-v','ON_ERROR_STOP=1','-At','-c',query],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch(error){throw new Error(error.stderr||error.message);}}
const admin='00000000-0000-0000-0000-000000000001',normal='00000000-0000-0000-0000-000000000002';
const as=(role,id,query)=>sql(`begin; set local role ${role}; select set_config('request.jwt.claim.sub','${id}',true); ${query}; rollback;`);
before(()=>{
 execFileSync(path.join(bin,'initdb'),['-D',path.join(temp,'db'),'-U','rj_test','--auth-local=trust','--auth-host=reject','--no-locale'],{stdio:'pipe'});
 execFileSync(path.join(bin,'pg_ctl'),['-D',path.join(temp,'db'),'-l',path.join(temp,'log'),'-o',`-h '' -k '${temp}' -p 55439 -F`,'-w','start'],{stdio:'pipe'});started=true;
 sql(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; grant usage on schema storage to authenticated; grant select,insert,delete on storage.objects to authenticated; insert into auth.users values('${admin}'),('${normal}');`);
 sql(readFileSync(new URL('../supabase/migrations/202609050001_rj_catalog.sql',import.meta.url),'utf8'));
 sql(readFileSync(new URL('../supabase/migrations/202610160001_rj_tracking.sql',import.meta.url),'utf8'));
 sql(`insert into rj_admin_profiles values('${admin}',true); insert into rj_products(id,name,image,status) values('pub','Publicado','/assets/x.png','published'),('draft','Rascunho','/assets/x.png','draft');`);
});
after(()=>{if(started)execFileSync(path.join(bin,'pg_ctl'),['-D',path.join(temp,'db'),'-m','immediate','-w','stop'],{stdio:'pipe'});rmSync(temp,{recursive:true,force:true});});
test('ADMIN-02/05 público lê só publicados e não escreve',()=>{
 const read=as('anon','','select string_agg(id,\',\') from rj_products');assert.match(read,/\npub\n/);assert.doesNotMatch(read,/draft/);
 assert.throws(()=>as('anon','',"insert into rj_products(id,name,image) values('x','X','/x.png')"));
 assert.throws(()=>as('anon','',"update rj_products set name='X' where id='pub'"));
 assert.throws(()=>as('anon','',"delete from rj_products where id='pub'"));
});
test('ADMIN-02 usuário comum não pode se promover ou gravar',()=>{
 assert.throws(()=>as('authenticated',normal,`insert into rj_admin_profiles values('${normal}',true)`));
 assert.throws(()=>as('authenticated',normal,"insert into rj_products(id,name,image) values('x','X','/x.png')"));
 assert.match(as('authenticated',normal,"update rj_products set name='X' where id='pub'; select name from rj_products where id='pub'"),/Publicado/);
 assert.match(as('authenticated',normal,"delete from rj_products where id='pub'; select count(*) from rj_products"),/\n1\n/);
});
test('ADMIN-03/04/08 admin cria, lê rascunho, edita com versão e exclui',()=>{
 assert.match(as('authenticated',admin,"select count(*) from rj_products"),/\n2\n/);
 const out=as('authenticated',admin,"insert into rj_products(id,name,image,price_cents) values('new','Caixa nova','/assets/n.png',4500); update rj_products set name='Caixa editada',description='Descrição nova',price_cents=5200 where id='new' and version=1; update rj_products set name='Sobrescrita' where id='new' and version=1; select name||'|'||description||'|'||price_cents||'|'||version from rj_products where id='new'; delete from rj_products where id='new' and version=2; select count(*) from rj_products where id='new'");
 assert.match(out,/Caixa editada\|Descrição nova\|5200\|2/);assert.match(out,/UPDATE 0/);assert.match(out,/DELETE 1\n0/);
});
test('ADMIN-06 categorias, banners e configurações têm escrita protegida',()=>{
 for(const [table,fields,values] of [['rj_categories','id,name,image',"'cat','Categoria','/assets/c.png'"],['rj_banners','id,name,image',"'ban','Banner','/assets/b.png'"],['rj_settings','id,data',`'site','{"brand_name":"RJ Teste","whatsapp_url":"https://wa.me/message/ABC"}'`]]){
  assert.throws(()=>as('authenticated',normal,`insert into ${table}(${fields}) values(${values})`));
  assert.match(as('authenticated',admin,`insert into ${table}(${fields}) values(${values}); select count(*) from ${table}`),/INSERT 0 1\n1/);
 }
});
test('ADMIN-07 banco rejeita URL insegura, preço negativo e categoria vinculada',()=>{
 for(const change of ["price_cents=-1","image='javascript:alert(1)'","status='owner'"])assert.throws(()=>as('authenticated',admin,`update rj_products set ${change} where id='pub'`));
 assert.throws(()=>as('authenticated',admin,`insert into rj_settings(data) values('{"brand_name":"RJ","whatsapp_url":"https://evil.test"}')`));
 assert.throws(()=>as('authenticated',admin,"insert into rj_categories(id,name,image) values('cat','Categoria','/c.png'); update rj_products set category_id='cat' where id='pub'; delete from rj_categories where id='cat'"));
});
test('ADMIN-12 somente admin pode enviar mídia RJ',()=>{
 assert.throws(()=>as('authenticated',normal,"insert into storage.objects(bucket_id,name) values('rj-media','abc.png')"));
 assert.throws(()=>as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('other','abc.png')"));
 assert.throws(()=>as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('rj-media','abc.svg')"));
 assert.match(as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('rj-media','abc.png'); select count(*) from storage.objects"),/INSERT 0 1\n1/);
 assert.equal(sql("select file_size_limit from storage.buckets where id='rj-media'"),'5242880');
});
test('ADMIN-02 revogação do perfil bloqueia próxima gravação',()=>{
 sql(`update rj_admin_profiles set active=false where id='${admin}'`);
 assert.throws(()=>as('authenticated',admin,"insert into rj_products(id,name,image) values('x','X','/x.png')"));
 sql(`update rj_admin_profiles set active=true where id='${admin}'`);
});
test('TRACK-07 rastreamento: público lê, só admin grava, banco recusa formato inválido',()=>{
 assert.throws(()=>as('anon','',"insert into rj_tracking(ga4_id) values('G-AB12CD34EF')"));
 assert.throws(()=>as('authenticated',normal,"insert into rj_tracking(ga4_id) values('G-AB12CD34EF')"));
 assert.match(as('authenticated',admin,"insert into rj_tracking(ga4_id) values('G-AB12CD34EF'); select count(*) from rj_tracking"),/INSERT 0 1\n1/);
 sql("insert into rj_tracking(ga4_id) values('G-AB12CD34EF')");
 assert.match(as('anon','',"select ga4_id from rj_tracking"),/\nG-AB12CD34EF\n/);
 assert.match(as('authenticated',normal,"update rj_tracking set ga4_id='' where id='site'; select ga4_id from rj_tracking"),/UPDATE 0\nG-AB12CD34EF/);
 for(const change of ["gtm_id='<script>'","ga4_id='UA-1-1'","google_ads_id='AW-x'","meta_pixel_id='123'","id='outro'"])assert.throws(()=>as('authenticated',admin,`update rj_tracking set ${change} where id='site'`));
 assert.throws(()=>as('authenticated',admin,"delete from rj_tracking where id='site'"));
 assert.match(as('authenticated',admin,"update rj_tracking set gtm_id='GTM-ABC1234' where id='site' and version=1; select gtm_id||'|'||version from rj_tracking"),/GTM-ABC1234\|2/);
 sql("delete from rj_tracking");
});
