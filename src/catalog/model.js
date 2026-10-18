export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export function parsePrice(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (!/^\d+(?:,\d{1,2})?$/.test(text) && !/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) throw Error('Informe o preço em reais, por exemplo 31,50.');
  const [whole, decimal=''] = text.replaceAll('.', '').split(',');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2,'0'));
  if (!Number.isSafeInteger(cents) || cents > 2147483647) throw Error('Preço fora do limite permitido.');
  return cents;
}
export const formatPrice = cents => cents === null || cents === undefined ? 'Sob consulta' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const priceInput = cents => cents == null ? '' : (cents/100).toFixed(2).replace('.',',');
function text(value, label, max=200, required=false) {
  if (value != null && typeof value !== 'string') throw Error(`${label}: texto inválido.`);
  const result=(value??'').trim();
  if ((required&&!result) || result.length>max) throw Error(`${label}: informe ${required?'1 a ': 'até '}${max} caracteres.`);
  return result;
}
export function safeUrl(value, {empty=true, whatsapp=false}={}) {
  const result=text(value,'Link',2000,!empty);
  if (!result) return '';
  if (!whatsapp && /^\/(?!\/)[A-Za-z0-9/_.,@%+~=-]+$/.test(result)) return result;
  if (!whatsapp && /^#[A-Za-z0-9_-]+$/.test(result)) return result;
  let url; try { url=new URL(result); } catch { throw Error('Use um link HTTPS ou um caminho /assets/.'); }
  if (url.protocol!=='https:' || url.username || url.password) throw Error('Use um link HTTPS seguro.');
  if (whatsapp && !((url.hostname==='wa.me' && /^\/(?:\d{8,15}|message\/[A-Za-z0-9]+)$/.test(url.pathname)) || (url.hostname==='api.whatsapp.com' && url.pathname==='/send' && /^\d{8,15}$/.test(url.searchParams.get('phone')||'')))) throw Error('Informe um link de contato wa.me ou api.whatsapp.com.');
  return result;
}
function integer(value,label,fallback=0) { const n=value??fallback; if (!Number.isInteger(n)||n<0||n>2147483647) throw Error(`${label}: número inteiro inválido.`); return n; }
function choice(value,allowed,label) {if(!allowed.includes(value))throw Error(`${label} inválido.`);return value;}
function boolean(value,fallback) {if(value===undefined)return fallback;if(typeof value!=='boolean')throw Error('Valor de ativação inválido.');return value;}
export const settingsFields = {
 brand_name:'Nome da empresa', logo:'Logo', whatsapp_url:'Link do WhatsApp', whatsapp_label:'Texto do botão WhatsApp', header_whatsapp_label:'WhatsApp no cabeçalho', whatsapp_message:'Mensagem padrão', phone:'Telefone com DDI', phone_label:'Telefone exibido', instagram:'Link do Instagram', instagram_label:'Perfil exibido', facebook:'Link do Facebook', linktree:'Link da empresa', address:'Endereço', footer_tagline:'Frase junto ao logo', footer_description:'Descrição da empresa', announcement_1:'Aviso superior 1', announcement_2:'Aviso superior 2', announcement_3:'Aviso superior 3', categories_title:'Título das categorias', boxes_title:'Título das caixas', envelopes_title:'Título dos envelopes', benefit_1_title:'Vantagem 1: título', benefit_1_text:'Vantagem 1: texto', benefit_2_title:'Vantagem 2: título', benefit_2_text:'Vantagem 2: texto', benefit_3_title:'Vantagem 3: título', benefit_3_text:'Vantagem 3: texto', payment_image:'Imagem das formas de pagamento', about:'Quem somos', terms:'Termos de uso', privacy:'Política de privacidade', shipping:'Frete e entrega', returns:'Trocas e devoluções', faq:'Perguntas frequentes'
};
export function validateRecord(kind,input) {
 if (!input || typeof input!=='object'||Array.isArray(input))throw Error('Dados inválidos.');
 if(kind==='settings') return Object.fromEntries(Object.entries(settingsFields).map(([key,label])=>{
  const value=input[key];
  if(['logo','instagram','facebook','linktree','payment_image'].includes(key)) return [key,safeUrl(value)];
  if(key==='whatsapp_url')return [key,safeUrl(value,{whatsapp:true,empty:false})];
  if(key==='phone' && value && !/^\+?\d{8,15}$/.test(value))throw Error('Telefone deve conter DDI e apenas números.');
  return [key,text(value,label,['about','terms','privacy','shipping','returns','faq','footer_description'].includes(key)?6000:300,key==='brand_name')];
 }));
 if(!['products','categories','banners'].includes(kind))throw Error('Tipo de conteúdo inválido.');
 const row={id:text(input.id,'Identificador',100,true),name:text(input.name,'Nome',200,true),image:safeUrl(input.image,{empty:false}),sort_order:integer(input.sort_order,'Ordem')};
 if(!/^[A-Za-z0-9_-]+$/.test(row.id))throw Error('Identificador inválido.');
 if(kind==='products')Object.assign(row,{description:text(input.description,'Descrição',6000),price_cents:input.price_cents==null?null:integer(input.price_cents,'Preço'),compare_at_cents:input.compare_at_cents==null?null:integer(input.compare_at_cents,'Preço anterior'),pack:text(input.pack,'Pacote',200),unit_label:text(input.unit_label,'Preço por unidade',200),payment_note:text(input.payment_note,'Condição comercial',300),badge:text(input.badge,'Selo',80),category_id:input.category_id||null,section:choice(input.section,['boxes','envelopes'],'Vitrine'),status:choice(input.status,['draft','published'],'Status'),available:boolean(input.available,true)});
 if(kind==='categories')Object.assign(row,{description:text(input.description,'Descrição',6000),active:boolean(input.active,true)});
 if(kind==='banners')Object.assign(row,{mobile_image:safeUrl(input.mobile_image),href:safeUrl(input.href),active:boolean(input.active,true)});
 return row;
}
// IDs públicos de rastreamento. Só formatos fixos: o site monta as tags, nunca HTML vindo do banco.
export const trackingFields = {
 gtm_id:{label:'Google Tag Manager', example:'GTM-ABC1234', pattern:/^GTM-[A-Z0-9]{4,12}$/},
 ga4_id:{label:'Google Analytics 4', example:'G-AB12CD34EF', pattern:/^G-[A-Z0-9]{4,16}$/},
 google_ads_id:{label:'Google Ads', example:'AW-123456789', pattern:/^AW-\d{6,15}$/},
 meta_pixel_id:{label:'Pixel da Meta', example:'123456789012345', pattern:/^\d{15,16}$/},
};
function trackingValue(key,value) {
 if (value != null && typeof value !== 'string') throw Error(`${trackingFields[key].label}: texto inválido.`);
 const result=(value??'').replace(/\s+/g,'');
 return key==='meta_pixel_id' ? result : result.toUpperCase();
}
export function trackingError(key,value) {
 const {label,example,pattern}=trackingFields[key];
 let result; try { result=trackingValue(key,value); } catch (error) { return error.message; }
 if (!result || pattern.test(result)) return '';
 return key==='meta_pixel_id' ? `${label}: use só os 15 ou 16 números do Pixel, sem letras.` : `${label}: use o formato ${example}.`;
}
export function validateTracking(input) {
 if (!input || typeof input!=='object'||Array.isArray(input))throw Error('Dados inválidos.');
 return Object.fromEntries(Object.keys(trackingFields).map(key=>{
  const message=trackingError(key,input[key]);
  if(message)throw Error(message);
  return [key,trackingValue(key,input[key])];
 }));
}
export function whatsappLink(settings,productName) {
 const raw=settings.whatsapp_url;const url=new URL(raw);
 if(url.pathname.startsWith('/message/'))return raw;
 const message=[settings.whatsapp_message,productName?`Produto: ${productName}`:''].filter(Boolean).join('\n');
 if(message)url.searchParams.set('text',message);
 return url.href;
}
export async function validateImageFile(file) {
 if(!file || file.size<1 || file.size>MAX_IMAGE_BYTES)throw Error('Escolha uma imagem de até 5 MB.');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const png=bytes.length>=8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const extension=file.type==='image/png'&&png?'png':file.type==='image/jpeg'&&jpg?'jpg':file.type==='image/webp'&&webp?'webp':null;
 if(!extension)throw Error('Use uma imagem PNG, JPEG ou WebP válida.');
 return extension;
}
