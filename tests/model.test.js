import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRecord, parsePrice, whatsappLink, validateImageFile} from '../src/catalog/model.js';
const product={id:'test',name:'Caixa kraft',description:'Descrição',price_cents:3150,category_id:null,section:'boxes',status:'draft',available:true,image:'/assets/caixa.webp'};
test('ADMIN-03 preço em reais vira centavos sem arredondar ou aceitar lixo',()=>{
 assert.equal(parsePrice('31,50'),3150); assert.equal(parsePrice('1.250,99'),125099); assert.equal(parsePrice(''),null);
 for(const input of ['-1','12abc','1,234','Infinity','1.2.3']) assert.throws(()=>parsePrice(input));
 const row=validateRecord('products',product); assert.equal(row.price_cents,3150); assert.equal(row.status,'draft');
});
test('ADMIN-07 rejeita dados inválidos e remove chaves de privilégio',()=>{
 for(const patch of [{name:''},{price_cents:-1},{price_cents:1.5},{section:'other'},{status:'admin'},{image:'javascript:alert(1)'},{image:'//host/x'},{sort_order:-1}]) assert.throws(()=>validateRecord('products',{...product,...patch}));
 assert.equal(validateRecord('products',{...product,role:'admin'}).role,undefined);
 assert.throws(()=>validateRecord('settings',{whatsapp_url:'https://evil.test'}));
 assert.throws(()=>validateRecord('banners',{id:'b',name:'Banner',image:'/assets/b.png',href:'javascript:alert(1)'}));
});
test('ADMIN-06 links WhatsApp usam mensagem só quando formato permite',()=>{
 assert.equal(whatsappLink({whatsapp_url:'https://wa.me/message/ABC',whatsapp_message:'oi'},'Caixa'),'https://wa.me/message/ABC');
 const url=new URL(whatsappLink({whatsapp_url:'https://wa.me/554799039545',whatsapp_message:'Olá'},'Caixa A'));
 assert.equal(url.searchParams.get('text'),'Olá\nProduto: Caixa A');
});
test('ADMIN-12 arquivo tem MIME, tamanho e assinatura de imagem permitida',async()=>{
 const bytes=new Uint8Array([137,80,78,71,13,10,26,10]);
 const good={size:8,type:'image/png',slice:()=>new Blob([bytes])};
 assert.equal(await validateImageFile(good),'png');
 await assert.rejects(()=>validateImageFile({...good,size:5*1024*1024+1}));
 await assert.rejects(()=>validateImageFile({...good,type:'image/svg+xml'}));
 await assert.rejects(()=>validateImageFile({...good,slice:()=>new Blob(['not an image'])}));
});
