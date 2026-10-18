import { createClient } from '@supabase/supabase-js';
import {createRepository} from './repository-core.js';
import seed from './seed.json';
const env=import.meta.env||{};
const url=env.VITE_SUPABASE_URL;
const key=env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured=Boolean(url&&key);
function checkedKey(value) {
 if(value.startsWith('sb_secret_'))throw Error('Use somente a chave publicável do Supabase.');
 if(value.startsWith('eyJ')) {try {if(JSON.parse(atob(value.split('.')[1])).role!=='anon')throw Error();}catch {throw Error('A chave Supabase deve ser publicável (anon).');}}
 return value;
}
export const adminClient=configured?createClient(url,checkedKey(key),{auth:{storage:typeof window!=='undefined'?window.sessionStorage:undefined,storageKey:'rj-admin-session',persistSession:true,detectSessionInUrl:false}}):null;
const publicClient=configured?createClient(url,key,{auth:{storageKey:'rj-public',persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;
export const adminRepository=createRepository(adminClient,seed);
export const publicRepository=createRepository(publicClient,seed);
