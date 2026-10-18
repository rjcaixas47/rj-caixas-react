import {validateRecord, validateImageFile, validateTracking, trackingFields} from './model.js';
export function readableError(error) {
 if(error?.code==='23503')return 'Esta categoria está vinculada a produtos. Reatribua os produtos antes de excluí-la.';
 if(error?.code==='23505')return 'Este registro já existe. Atualize a lista antes de tentar novamente.';
 if(error?.code==='42501')return 'Sem permissão para salvar. Entre novamente com um administrador ativo.';
 if(error?.code==='23514')return 'Confira os campos: algum valor não é permitido pelo banco.';
 if(['PGRST205','42P01'].includes(error?.code))return 'O banco ainda não está configurado para o catálogo RJ.';
 return error?.message||'Não foi possível concluir. Tente novamente.';
}
function check(result){if(result.error)throw Error(readableError(result.error));return result.data;}
const conflict=()=>Error('Este conteúdo mudou ou seu acesso expirou. Atualize a lista e abra a versão mais recente. Suas alterações continuam no formulário.');
export function createRepository(client, seed) {
 function requireClient(){if(!client)throw Error('Conecte o Supabase da RJ para salvar os dados.');}
 async function rows(kind,publicOnly){
  const all=[];
  for(let from=0;;from+=1000){
   let q=client.from(`rj_${kind}`).select('*').order('sort_order').order('id').range(from,from+999);
   if(publicOnly)q=q.eq(kind==='products'?'status':'active',kind==='products'?'published':true);
   const page=check(await q);all.push(...page);if(page.length<1000)return all;
  }
 }
 return {
  async load(publicOnly=false){
   requireClient();
   const [products,categories,banners,record]=await Promise.all([rows('products',publicOnly),rows('categories',publicOnly),rows('banners',publicOnly),client.from('rj_settings').select('*').eq('id','site').maybeSingle().then(check)]);
   return {products,categories,banners,settings:{...seed.settings,...record?.data},settingsVersion:record?.version??null};
  },
  async save(kind,record){
   requireClient();
   const data=kind==='settings'?{id:'site',data:validateRecord('settings',record.data)}:kind==='tracking'?{id:'site',...validateTracking(record.data)}:validateRecord(kind,record);
   if(kind==='products')data.image_srcset=record.image_srcset||'';
   const table=client.from(`rj_${kind}`);
   const q=record.version?table.update(data).eq('id',data.id).eq('version',record.version):table.insert(data);
   const saved=check(await q.select('*').maybeSingle());if(!saved)throw conflict();return saved;
  },
  async loadTracking(){
   requireClient();
   const keys=Object.keys(trackingFields);
   const result=await client.from('rj_tracking').select([...keys,'version'].join(',')).eq('id','site').maybeSingle();
   if(['PGRST205','42P01'].includes(result.error?.code))throw Error('O rastreamento ainda não foi ativado no banco. Peça à equipe responsável pelo site para aplicar a atualização.');
   const record=check(result);
   return {data:Object.fromEntries(keys.map(key=>[key,record?.[key]||''])),version:record?.version??null};
  },
  async remove(kind,record){
   requireClient();if(!['products','categories','banners'].includes(kind))throw Error('Exclusão não permitida.');
   const deleted=check(await client.from(`rj_${kind}`).delete().eq('id',record.id).eq('version',record.version).select('id').maybeSingle());if(!deleted)throw conflict();
  },
  async upload(file){
   requireClient();const extension=await validateImageFile(file);const name=`${crypto.randomUUID()}.${extension}`;
   check(await client.storage.from('rj-media').upload(name,file,{contentType:file.type,cacheControl:'31536000',upsert:false}));
   return client.storage.from('rj-media').getPublicUrl(name).data.publicUrl;
  },
  async importInitial(){
   requireClient();
   // Etapas idempotentes: uma falha pode ser retomada sem sobrescrever registros existentes.
   for(const kind of ['categories','products','banners']){
    const records=seed[kind].map(item=>kind==='products'?{...validateRecord(kind,item),image_srcset:item.image_srcset}:validateRecord(kind,item));
    check(await client.from(`rj_${kind}`).upsert(records,{onConflict:'id',ignoreDuplicates:true}));
   }
   check(await client.from('rj_settings').upsert({id:'site',data:validateRecord('settings',seed.settings)},{onConflict:'id',ignoreDuplicates:true}));
  }
 };
}
