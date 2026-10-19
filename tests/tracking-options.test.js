import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateTrackingOptions,validateTracking} from '../src/catalog/model.js';
import {extractTrackingSnippet} from '../src/tracking/snippets.js';
import {tagPlan,trackingCategories,trackWhatsApp} from '../src/tracking/tags.js';
const code={id:'test',name:'Teste',code:'<script>window.example=1;</script>',category:'marketing',enabled:true};
test('HTML tem limites, categoria obrigatória, IDs únicos e não aceita chaves de privilégio',()=>{
 assert.equal(validateTrackingOptions({custom_codes:[code]}).custom_codes[0].code,code.code);
 for (const patch of [{name:''},{code:'x'.repeat(12001)},{category:'necessary'},{enabled:'sim'}]) assert.throws(()=>validateTrackingOptions({custom_codes:[{...code,...patch}]}));
 assert.throws(()=>validateTrackingOptions({custom_codes:[code,code]}));
 assert.throws(()=>validateTrackingOptions({disabled:['admin']}));
 assert.throws(()=>validateTrackingOptions({google_ads_label:'AW-123/label'}));
 assert.equal(validateTracking({options:{role:'admin'}}).options.role,undefined);
});
test('importa snippets sem executar seu JavaScript e recusa IDs ambíguos',()=>{
 assert.deepEqual(extractTrackingSnippet(`<script>gtag('config','G-AB12CD34EF');fbq('init', '123456789012345');gtag('event','conversion',{send_to:'AW-123456789/AbC_dE'});window.stolen=true;</script>`),{ga4_id:'G-AB12CD34EF',meta_pixel_id:'123456789012345',google_ads_id:'AW-123456789',google_ads_label:'AbC_dE'});
 assert.deepEqual(extractTrackingSnippet('GTM-ABC1234 GTM-ABC1234'),{gtm_id:'GTM-ABC1234'});
 assert.throws(()=>extractTrackingSnippet('G-ABC1234 G-XYZ1234'),/mais de um ID/);
 assert.throws(()=>extractTrackingSnippet('<script>alert(1)</script>'),/Não encontramos/);
});
test('integrações pausadas e códigos personalizados respeitam a categoria',()=>{
 const ids={ga4_id:'G-ABCD1234',meta_pixel_id:'123456789012345',options:{disabled:['ga4_id','meta_pixel_id'],custom_codes:[code]}};
 assert.deepEqual(tagPlan(ids,{analytics:true,marketing:true}),{gtm:'',gtag:[],pixel:''});
 assert.deepEqual(trackingCategories(ids),{analytics:false,marketing:true});
 assert.deepEqual(trackingCategories({...ids,options:{...ids.options,custom_codes:[{...code,enabled:false}]}}),{analytics:false,marketing:false});
});
test('conversões só disparam com consentimento e Ads requer rótulo',()=>{
 const calls=[];globalThis.window={gtag:(...args)=>calls.push(args),fbq:(...args)=>calls.push(args),dataLayer:[]};
 const ids={ga4_id:'G-ABCD1234',google_ads_id:'AW-123456789',meta_pixel_id:'123456789012345',gtm_id:'GTM-ABC1234',options:{google_ads_label:'AbC_dE'}};
 trackWhatsApp(ids,{analytics:false,marketing:false});assert.equal(calls.length,0);
 trackWhatsApp(ids,{analytics:true,marketing:false});assert.equal(calls[0][1],'whatsapp_click');assert.equal(calls.length,1);
 calls.length=0;trackWhatsApp(ids,{analytics:false,marketing:true});assert.equal(calls[0][2].send_to,'AW-123456789/AbC_dE');assert.deepEqual(calls[1],['track','Contact']);
 calls.length=0;trackWhatsApp({...ids,options:{}},{analytics:false,marketing:true});assert.deepEqual(calls,[['track','Contact']]);
 delete globalThis.window;
});
test('sandbox libera scripts apenas na origem isolada e conserva CSP estrita no painel',()=>{
 const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 const csp=source=>config.headers.find(rule=>rule.source===source).headers.find(h=>h.key==='Content-Security-Policy').value;
 assert.doesNotMatch(csp('/(.*)'),/script-src[^;]*unsafe-inline/);
 assert.match(csp('/tracking-sandbox.html'),/sandbox allow-scripts;/);
 assert.doesNotMatch(csp('/tracking-sandbox.html'),/allow-same-origin|allow-top-navigation|allow-popups/);
});
