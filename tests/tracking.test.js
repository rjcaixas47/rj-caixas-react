import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateTracking, trackingError} from '../src/catalog/model.js';
import {createRepository} from '../src/catalog/repository-core.js';
import {tagPlan, trackingCategories, consentMode, readConsent, storeConsent, needsPrompt} from '../src/tracking/tags.js';

const empty={gtm_id:'',ga4_id:'',google_ads_id:'',meta_pixel_id:''};
const all={gtm_id:'GTM-ABC1234',ga4_id:'G-AB12CD34EF',google_ads_id:'AW-123456789',meta_pixel_id:'123456789012345'};

test('TRACK-01 IDs válidos são normalizados e campos vazios são aceitos',()=>{
 assert.deepEqual(validateTracking({}),empty);
 assert.deepEqual(validateTracking(all),all);
 assert.deepEqual(validateTracking({gtm_id:' gtm-abc1234 ',ga4_id:'g-ab12cd34ef',google_ads_id:'aw-123456789',meta_pixel_id:'1234 5678 9012 3456'}),{...all,meta_pixel_id:'1234567890123456'});
 assert.equal(validateTracking({...empty,role:'admin'}).role,undefined);
});
test('TRACK-02 formatos errados, HTML e script são recusados com mensagem do campo',()=>{
 for(const [key,value] of [['gtm_id','GTM-'],['gtm_id','G-AB12CD34EF'],['gtm_id','<script>alert(1)</script>'],['ga4_id','UA-12345-1'],['ga4_id','G-AB12"onload'],['google_ads_id','AW-ABC'],['google_ads_id','123456789'],['meta_pixel_id','12345678901234'],['meta_pixel_id','12345678901234567'],['meta_pixel_id','12345678901234a']]){
  assert.throws(()=>validateTracking({[key]:value}),undefined,`${key}=${value}`);
  assert.ok(trackingError(key,value),`${key}=${value} deveria ter mensagem`);
 }
 assert.match(trackingError('gtm_id','abc'),/Google Tag Manager.*GTM-/);
 assert.match(trackingError('meta_pixel_id','abc'),/15 ou 16 números/);
 assert.throws(()=>validateTracking({ga4_id:42}));
 assert.throws(()=>validateTracking(null));
});

function backend(rows){
 const tables={rj_tracking:structuredClone(rows)};
 return {tables,from(name){let op='select',body,filters=[];const q={
  select(){return q;},eq(k,v){filters.push([k,v]);return q;},maybeSingle(){return q;},update(data){op='update';body=data;return q;},insert(data){op='insert';body=data;return q;},
  then(resolve){if(!tables[name])return Promise.resolve({data:null,error:{code:'PGRST205'}}).then(resolve);
   let found=tables[name].filter(r=>filters.every(([k,v])=>r[k]===v));
   if(op==='update')found.forEach(r=>Object.assign(r,body,{version:r.version+1}));
   if(op==='insert'){if(tables[name].length)return Promise.resolve({error:{code:'23505'}}).then(resolve);const added={...body,version:1};tables[name].push(added);found=[added];}
   return Promise.resolve({data:structuredClone(found[0]||null),error:null}).then(resolve);
  }};return q;}};
}
test('TRACK-03 repositório lê vazio, cria, edita com versão e não sobrescreve versão velha',async()=>{
 const client=backend([]),repo=createRepository(client,{});
 assert.deepEqual(await repo.loadTracking(),{data:empty,version:null});
 const created=await repo.save('tracking',{data:{ga4_id:'g-ab12cd34ef'},version:null});
 assert.equal(created.ga4_id,'G-AB12CD34EF');assert.equal(created.id,'site');assert.equal(created.version,1);
 const updated=await repo.save('tracking',{data:{...all},version:1});assert.equal(updated.version,2);
 await assert.rejects(()=>repo.save('tracking',{data:empty,version:1}),/versão mais recente/);
 assert.equal(client.tables.rj_tracking[0].gtm_id,'GTM-ABC1234');
 await assert.rejects(()=>repo.save('tracking',{data:{gtm_id:'<b>'},version:2}),/GTM-/);
 assert.deepEqual((await repo.loadTracking()).data,all);
});
test('TRACK-04 tabela ausente gera aviso claro, sem quebrar com erro técnico',async()=>{
 const repo=createRepository({from:()=>backend([]).from('rj_inexistente')},{});
 await assert.rejects(()=>repo.loadTracking(),/rastreamento ainda não foi ativado/);
 await assert.rejects(()=>createRepository(null,{}).loadTracking(),/Conecte o Supabase/);
});

test('TRACK-05 nada carrega sem consentimento; cada categoria libera só as suas tags',()=>{
 const none={analytics:false,marketing:false};
 assert.deepEqual(tagPlan(all,none),{gtm:'',gtag:[],pixel:''});
 assert.deepEqual(tagPlan(all,{analytics:true,marketing:false}),{gtm:'GTM-ABC1234',gtag:['G-AB12CD34EF'],pixel:''});
 assert.deepEqual(tagPlan(all,{analytics:false,marketing:true}),{gtm:'GTM-ABC1234',gtag:['AW-123456789'],pixel:'123456789012345'});
 assert.deepEqual(tagPlan(empty,{analytics:true,marketing:true}),{gtm:'',gtag:[],pixel:''});
 assert.deepEqual(trackingCategories(empty),{analytics:false,marketing:false});
 assert.deepEqual(trackingCategories({...empty,meta_pixel_id:'123456789012345'}),{analytics:false,marketing:true});
 assert.deepEqual(trackingCategories({...empty,gtm_id:'GTM-ABC1234'}),{analytics:true,marketing:true});
});
test('TRACK-06 Consent Mode v2 começa negado e a escolha fica guardada com validação',()=>{
 assert.deepEqual(consentMode({analytics:false,marketing:false}),{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 assert.deepEqual(consentMode({analytics:true,marketing:false}),{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 assert.equal(readConsent(storage),null);
 storeConsent({analytics:true,marketing:false},{analytics:true,marketing:false},storage);
 assert.deepEqual(readConsent(storage),{analytics:true,marketing:false,offered:{analytics:true,marketing:false}});
 memory.set('rj-consent','{"v":1,"analytics":"sim"}');assert.equal(readConsent(storage),null);
 memory.set('rj-consent','lixo');assert.equal(readConsent(storage),null);
 const broken={getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}};
 assert.equal(readConsent(broken),null);assert.doesNotThrow(()=>storeConsent({analytics:true,marketing:true},{analytics:true,marketing:true},broken));
});
test('TRACK-08 categoria nova (ex.: Pixel adicionado depois) faz o aviso perguntar de novo',()=>{
 const onlyAnalytics={analytics:true,marketing:false},both={analytics:true,marketing:true};
 assert.equal(needsPrompt(null,onlyAnalytics),true);
 assert.equal(needsPrompt({analytics:true,marketing:false,offered:onlyAnalytics},onlyAnalytics),false);
 assert.equal(needsPrompt({analytics:true,marketing:false,offered:onlyAnalytics},both),true);
 assert.equal(needsPrompt({analytics:false,marketing:false,offered:both},onlyAnalytics),false);
 assert.equal(needsPrompt({analytics:true,marketing:true,offered:{}},both),true);
});
