import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const admin='00000000-0000-0000-0000-000000000001',normal='00000000-0000-0000-0000-000000000002';
let db;
before(async()=>{
 db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; grant usage on schema storage to authenticated; grant select,insert,delete on storage.objects to authenticated; insert into auth.users values('${admin}'),('${normal}');`);
 for(const file of readdirSync(new URL('../supabase/migrations/',import.meta.url)).filter(name=>name.endsWith('.sql')).sort()) await db.exec(readFileSync(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
 await db.exec(`insert into rj_admin_profiles values('${admin}',true); insert into rj_tracking(id) values('site'); insert into rj_products(id,name,image,status) values('pub','Publicado','/x.png','published'),('draft','Rascunho','/x.png','draft');`);
});
after(async()=>{await db?.close();});
async function as(role,id,sql){
 await db.exec('begin');
 try {await db.exec(`set local role ${role}; select set_config('request.jwt.claim.sub','${id}',true);`);return await db.exec(sql);}
 finally {await db.exec('rollback');}
}
test('anon lê IDs públicos, mas não edita nem exclui rastreamento',async()=>{
 assert.equal((await as('anon','',"select id from rj_tracking"))[0].rows[0].id,'site');
 await assert.rejects(()=>as('anon','',"update rj_tracking set ga4_id='G-ABCD1234'"),/permission denied/);
 await assert.rejects(()=>as('anon','',"delete from rj_tracking"),/permission denied/);
});
test('usuário comum não grava códigos nem se promove',async()=>{
 const result=await as('authenticated',normal,"update rj_tracking set options='{\"google_ads_label\":\"roubo\"}'; select options from rj_tracking");
 assert.equal(result[0].affectedRows,0);assert.deepEqual(result[1].rows[0].options,{});
 await assert.rejects(()=>as('authenticated',normal,`insert into rj_admin_profiles values('${normal}',true)`),/permission denied/);
});
test('admin grava HTML e conversão com controle de versão',async()=>{
 const options={google_ads_label:'AbC_dE',disabled:['gtm_id'],custom_codes:[{id:'code-1',name:'Teste',code:'<script>window.test=1;</script>',category:'marketing',enabled:true}]};
 const result=await as('authenticated',admin,`update rj_tracking set options='${JSON.stringify(options)}' where id='site' and version=1; update rj_tracking set ga4_id='G-ABCD1234' where version=1; select version,options,ga4_id from rj_tracking`);
 assert.equal(result[0].affectedRows,1);assert.equal(result[2].rows[0].version,2);assert.equal(result[2].rows[0].ga4_id,'');assert.deepEqual(result[2].rows[0].options,options);
 await assert.rejects(()=>as('authenticated',admin,'delete from rj_tracking'),/permission denied/);
});
test('banco rejeita opções, tipos, categorias e formatos inválidos',async()=>{
 for(const value of [{custom_codes:[{}]},{disabled:['admin']},{google_ads_label:'AW-123/abc'},{custom_codes:[{id:'x',name:'x',code:'x',category:'necessary',enabled:true}]},{role:'admin'}]) await assert.rejects(()=>as('authenticated',admin,`update rj_tracking set options='${JSON.stringify(value)}'`),/check constraint/);
 await assert.rejects(()=>as('authenticated',admin,"update rj_tracking set ga4_id='<script>'"),/check constraint/);
});
test('revogação de perfil bloqueia gravação e público não recebe rascunhos',async()=>{
 await db.exec(`update rj_admin_profiles set active=false where id='${admin}'`);
 const result=await as('authenticated',admin,"update rj_tracking set ga4_id='G-ABCD1234'");assert.equal(result[0].affectedRows,0);
 const products=await as('anon','','select id from rj_products');assert.deepEqual(products[0].rows,[{id:'pub'}]);
 await db.exec(`update rj_admin_profiles set active=true where id='${admin}'`);
});
