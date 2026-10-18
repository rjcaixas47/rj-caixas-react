import React,{createContext,useContext,useEffect,useState,useCallback} from 'react';
import seed from './seed.json';
import {configured,publicRepository} from './repository.js';
const Context=createContext(null);
export function CatalogProvider({children}) {
 const [catalog,setCatalog]=useState(configured?null:seed);
 const [error,setError]=useState('');
 const refresh=useCallback(async()=>{
  if(!configured)return;
  try{const data=await publicRepository.load(true);setCatalog(data);setError('');}
  catch{setError('Não foi possível carregar o catálogo. Tente novamente em instantes.');}
 },[]);
 useEffect(()=>{
  let active=true;
  const load=async()=>{if(!configured)return;try{const data=await publicRepository.load(true);if(active){setCatalog(data);setError('');}}catch{if(active)setError('Não foi possível carregar o catálogo. Tente novamente em instantes.');}};
  load(); const focus=()=>{if(document.visibilityState==='visible')load();};
  window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
  return()=>{active=false;window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
 },[]);
 if(!catalog)return <main className="rj-catalog-state"><h1>{error?'Catálogo temporariamente indisponível':'Carregando catálogo…'}</h1>{error&&<><p>{error}</p><button onClick={refresh}>Tentar novamente</button></>}</main>;
 return <Context.Provider value={{...catalog,configured,refresh}}>{error&&<div className="rj-catalog-error" role="alert">{error} <button onClick={refresh}>Tentar novamente</button></div>}{children}</Context.Provider>;
}
export function useCatalog(){return useContext(Context);}
