import React, {useEffect, useRef, useState} from 'react';
import {configured, publicRepository} from '../catalog/repository.js';
import {applyConsent, hasLoadedTags, needsPrompt, readConsent, storeConsent, trackingCategories, trackWhatsApp} from './tags.js';
import {applyVerification} from './custom.js';
import './cookie-consent.css';

const none = {analytics: false, marketing: false};
const options = [
  ['analytics', 'Análise', 'Contam visitas e páginas vistas, de forma agregada, para melhorarmos a loja.'],
  ['marketing', 'Marketing', 'Medem o resultado dos anúncios e permitem mostrar ofertas da loja a quem já visitou o site (Google e Meta).'],
];

// Aviso de cookies da vitrine. Só aparece quando o painel tem algum ID de rastreamento.
export default function CookieConsent() {
  const [ids, setIds] = useState(null);
  const [open, setOpen] = useState(false), [custom, setCustom] = useState(false);
  const [choice, setChoice] = useState(none);
  const heading = useRef(null), focusOnOpen = useRef(false);
  const consentRef = useRef(none);
  useEffect(() => {
    if (!configured) return;
    let alive = true;
    publicRepository.loadTracking().then(({data}) => {
      if (!alive) return;
      applyVerification(data.options?.verification);
      setIds(data);
      const categories = trackingCategories(data);
      if (!categories.analytics && !categories.marketing) return;
      const saved = readConsent();
      if (saved) { setChoice(saved); consentRef.current = saved; applyConsent(data, saved); }
      if (needsPrompt(saved, categories)) setOpen(true);
    }).catch(() => { /* Sem rastreamento configurado, a loja funciona sem tags. */ });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const contact = event => {
      const anchor = event.target.closest?.('a[href]');
      if (!ids || !anchor || event.defaultPrevented) return;
      const url = new URL(anchor.href);
      if (!['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname)) return;
      trackWhatsApp(ids, consentRef.current);
    };
    document.addEventListener('click', contact);
    return () => document.removeEventListener('click', contact);
  }, [ids]);
  useEffect(() => {
    const reopen = event => {
      if (!event.target.closest?.('a[href="#preferencias-cookies"]')) return;
      event.preventDefault(); focusOnOpen.current = true;
      setChoice(readConsent() || none); setCustom(true); setOpen(true);
    };
    document.addEventListener('click', reopen);
    return () => document.removeEventListener('click', reopen);
  }, []);
  useEffect(() => { if (open && focusOnOpen.current) { focusOnOpen.current = false; heading.current?.focus(); } }, [open]);
  function decide(next) {
    const previous = consentRef.current;
    consentRef.current = next;
    storeConsent(next, ids ? trackingCategories(ids) : none); setChoice(next); setOpen(false); setCustom(false);
    // Scripts já carregados não podem ser removidos: ao retirar uma permissão, a página recarrega sem eles.
    if (previous && hasLoadedTags() && ((previous.analytics && !next.analytics) || (previous.marketing && !next.marketing))) { window.location.reload(); return; }
    if (ids) applyConsent(ids, next);
  }
  function openPrivacy() { document.querySelector('a[href="#info-politica-de-privacidade"]')?.click(); }
  if (!open) return null;
  const categories = ids ? trackingCategories(ids) : none;
  const available = options.filter(([key]) => categories[key]);
  const all = Object.fromEntries(options.map(([key]) => [key, categories[key]]));
  return <section className="rj-cookie" aria-labelledby="rj-cookie-title">
    <h2 id="rj-cookie-title" ref={heading} tabIndex={-1}>Cookies e privacidade</h2>
    {available.length ? <p>Usamos cookies opcionais para medir as visitas e o resultado dos nossos anúncios. Eles só são ativados se você permitir. Você pode mudar sua escolha quando quiser em “Preferências de cookies”, no rodapé.</p>
      : <p>No momento, a loja não usa cookies de análise nem de marketing. Usamos apenas o armazenamento necessário para guardar sua seleção de orçamento neste navegador.</p>}
    {custom && available.length > 0 && <fieldset className="rj-cookie__options"><legend>Escolha o que permitir</legend>
      <label className="rj-cookie__option"><input type="checkbox" checked disabled/><span><strong>Necessários</strong><small>Sempre ativos. Guardam sua seleção de orçamento e esta escolha.</small></span></label>
      {available.map(([key, label, text]) => <label className="rj-cookie__option" key={key}><input type="checkbox" checked={choice[key]} onChange={event => setChoice(old => ({...old, [key]: event.target.checked}))}/><span><strong>{label}</strong><small>{text}</small></span></label>)}
    </fieldset>}
    <div className="rj-cookie__actions">
      {available.length ? <>
        <button type="button" className="rj-cookie__button" onClick={() => decide(none)}>Rejeitar</button>
        {custom ? <button type="button" className="rj-cookie__button" onClick={() => decide(choice)}>Salvar escolhas</button> : <button type="button" className="rj-cookie__button" onClick={() => { setChoice(readConsent() || none); setCustom(true); }}>Personalizar</button>}
        <button type="button" className="rj-cookie__button" onClick={() => decide(all)}>Aceitar todos</button>
      </> : <button type="button" className="rj-cookie__button" onClick={() => setOpen(false)}>Fechar</button>}
    </div>
    <button type="button" className="rj-cookie__link" onClick={openPrivacy}>Política de privacidade</button>
  </section>;
}
