import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRepository} from '../src/catalog/repository-core.js';
const product={id:'p1',name:'Caixa atual',description:'Descrição atual',price_cents:4500,image:'/assets/caixa.png',category_id:null,section:'boxes',status:'published',available:true,version:2,sort_order:0};
function backend(initial){
 const tables={rj_products:structuredClone(initial),rj_categories:[],rj_banners:[],rj_settings:[]};
 return {tables,from(name){let op='select',body,filters=[],single=false;const q={
  select(){return q;},order(){return q;},range(){return q;},eq(k,v){filters.push([k,v]);return q;},maybeSingle(){single=true;return q;},update(data){op='update';body=data;return q;},insert(data){op='insert';body=data;return q;},delete(){op='delete';return q;},
  then(resolve){let rows=tables[name].filter(r=>filters.every(([k,v])=>r[k]===v));
   if(op==='update'){rows.forEach(r=>Object.assign(r,body,{version:r.version+1}));}
   if(op==='delete')tables[name]=tables[name].filter(r=>!rows.includes(r));
   if(op==='insert'){if(tables[name].some(r=>r.id===body.id))return Promise.resolve({error:{code:'23505'}}).then(resolve);const added={...body,version:1};tables[name].push(added);rows=[added];}
   return Promise.resolve({data:structuredClone(single?(rows[0]||null):rows),error:null}).then(resolve);
  }
 };return q;}};
}
test('ADMIN-08 versão velha não sobrescreve produto nem permite exclusão',async()=>{
 const client=backend([product]),repo=createRepository(client,{});
 await assert.rejects(()=>repo.save('products',{...product,version:1,name:'Nome antigo'}),/versão mais recente/);
 assert.equal(client.tables.rj_products[0].name,'Caixa atual');assert.equal(client.tables.rj_products[0].version,2);
 await assert.rejects(()=>repo.remove('products',{id:'p1',version:1}),/versão mais recente/);
 assert.equal(client.tables.rj_products.length,1);
 const saved=await repo.save('products',{...product,name:'Nome novo',price_cents:9900});
 assert.equal(saved.version,3);assert.equal(client.tables.rj_products[0].price_cents,9900);
 await repo.remove('products',{id:'p1',version:3});assert.equal(client.tables.rj_products.length,0);
});
test('ADMIN-03/05 público recebe só publicados, novo produto mantém dados e não duplica',async()=>{
 const client=backend([product,{...product,id:'draft',status:'draft'}]),repo=createRepository(client,{settings:{brand_name:'RJ'}});
 assert.deepEqual((await repo.load(true)).products.map(p=>p.id),['p1']);
 const saved=await repo.save('products',{...product,id:'new',version:undefined,name:'Nova caixa',price_cents:null});
 assert.equal(saved.name,'Nova caixa');assert.equal(saved.price_cents,null);assert.equal(saved.version,1);
 await assert.rejects(()=>repo.save('products',{...product,id:'new',version:undefined}),/já existe/);
 assert.equal(client.tables.rj_products.filter(p=>p.id==='new').length,1);
});
test('ADMIN-09/10 erro de leitura é comunicado, sem simular catálogo ou gravação',async()=>{
 const repo=createRepository(null,{});await assert.rejects(()=>repo.load(),/Conecte o Supabase/);await assert.rejects(()=>repo.save('products',product),/Conecte o Supabase/);
 const bad={from(){const query={select(){return query;},order(){return query;},range(){return query;},eq(){return query;},maybeSingle(){return query;},then(resolve){return Promise.resolve({error:{message:'Banco indisponível'}}).then(resolve);}};return query;}};
 await assert.rejects(()=>createRepository(bad,{}).load(),/Banco indisponível/);
});
