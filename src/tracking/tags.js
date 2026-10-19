// Tags de rastreamento (GTM, Google tag para GA4/Ads e Pixel da Meta).
// Nada carrega antes do consentimento (RGPD/LGPD). Consent Mode v2 começa negado e é
// atualizado com a escolha do visitante. Os scripts são criados por este módulo, sem
// HTML ou script inline vindo do banco, para manter a CSP do vercel.json.
import {applyCustomCodes, hasCustomCodes} from './custom.js';
const CONSENT_KEY = 'rj-consent';
const CONSENT_VERSION = 1;

export function readConsent(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(CONSENT_KEY) || 'null');
    if (saved?.v !== CONSENT_VERSION || typeof saved.analytics !== 'boolean' || typeof saved.marketing !== 'boolean') return null;
    return {analytics: saved.analytics, marketing: saved.marketing, offered: {analytics: saved.offered?.analytics === true, marketing: saved.offered?.marketing === true}};
  } catch { return null; }
}
// `offered` guarda as categorias que existiam quando a pessoa escolheu.
export function storeConsent({analytics, marketing}, offered, storage = globalThis.localStorage) {
  try { storage.setItem(CONSENT_KEY, JSON.stringify({v: CONSENT_VERSION, analytics, marketing, offered, at: new Date().toISOString()})); }
  catch { /* Sem armazenamento, a escolha vale só nesta visita. */ }
}
// Pergunta de novo quando surge uma categoria que a pessoa ainda não viu (ex.: Pixel adicionado depois).
export function needsPrompt(saved, categories) {
  return !saved || ['analytics', 'marketing'].some(key => categories[key] && !saved.offered?.[key]);
}
export function trackingCategories(ids) {
  const active = activeTracking(ids);
  const codes = ids.options?.custom_codes || [];
  return {analytics: Boolean(active.gtm_id || active.ga4_id || codes.some(c => c.enabled && c.category === 'analytics')), marketing: Boolean(active.gtm_id || active.google_ads_id || active.meta_pixel_id || codes.some(c => c.enabled && c.category === 'marketing'))};
}
export function activeTracking(ids) {
 return Object.fromEntries(Object.entries(ids).map(([key,value]) => [key, ids.options?.disabled?.includes(key) ? '' : value]));
}
// O GTM carrega com qualquer categoria aceita; dentro dele, as tags do Google respeitam o Consent Mode.
export function tagPlan(ids, consent) {
  ids = activeTracking(ids);
  return {
    gtm: ids.gtm_id && (consent.analytics || consent.marketing) ? ids.gtm_id : '',
    gtag: [consent.analytics && ids.ga4_id, consent.marketing && ids.google_ads_id].filter(Boolean),
    pixel: (consent.marketing && ids.meta_pixel_id) || '',
  };
}
export function consentMode({analytics, marketing}) {
  const ads = marketing ? 'granted' : 'denied';
  return {analytics_storage: analytics ? 'granted' : 'denied', ad_storage: ads, ad_user_data: ads, ad_personalization: ads};
}

const loaded = {consent: false, gtm: false, gtag: false, configured: new Set(), pixel: false};
export const hasLoadedTags = () => loaded.gtm || loaded.gtag || loaded.pixel || hasCustomCodes();

function addScript(src) {
  const script = document.createElement('script');
  script.async = true; script.src = src;
  document.head.appendChild(script);
}
function loadPixel(id) {
  if (!window.fbq) {
    // Equivalente ao snippet oficial da Meta, sem script inline.
    const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    Object.assign(fbq, {push: fbq, loaded: true, version: '2.0', queue: []});
    window.fbq = fbq; window._fbq ||= fbq;
    addScript('https://connect.facebook.net/en_US/fbevents.js');
  }
  window.fbq('consent', 'grant');
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

export function applyConsent(ids, consent) {
  window.dataLayer ||= [];
  window.gtag ||= function gtag() { window.dataLayer.push(arguments); };
  if (!loaded.consent) {
    loaded.consent = true;
    window.gtag('consent', 'default', {...consentMode({analytics: false, marketing: false}), wait_for_update: 500});
  }
  window.gtag('consent', 'update', consentMode(consent));
  window.dataLayer.push({event: 'rj_consent_update', rj_consent_analytics: consent.analytics, rj_consent_marketing: consent.marketing});
  const plan = tagPlan(ids, consent);
  if (plan.gtm && !loaded.gtm) {
    loaded.gtm = true;
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(plan.gtm)}`);
  }
  if (plan.gtag.length && !loaded.gtag) {
    loaded.gtag = true;
    window.gtag('js', new Date());
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(plan.gtag[0])}`);
  }
  for (const id of plan.gtag) if (!loaded.configured.has(id)) { loaded.configured.add(id); window.gtag('config', id); }
  if (plan.pixel && !loaded.pixel) { loaded.pixel = true; loadPixel(plan.pixel); }
  else if (window.fbq) window.fbq('consent', consent.marketing ? 'grant' : 'revoke');
  applyCustomCodes(ids.options?.custom_codes, consent);
  window.dispatchEvent(new CustomEvent('rj-tracking-status', {detail:{plan, consent}}));
}

// Um clique de contato não é uma venda nem um lead confirmado.
export function trackWhatsApp(ids, consent) {
 const active = activeTracking(ids);
 if (active.gtm_id && (consent.analytics || consent.marketing)) window.dataLayer?.push({event:'whatsapp_click'});
 if (consent.analytics && active.ga4_id) window.gtag?.('event', 'whatsapp_click', {send_to:active.ga4_id, transport_type:'beacon'});
 if (consent.marketing && active.google_ads_id && ids.options?.google_ads_label) window.gtag?.('event', 'conversion', {send_to:`${active.google_ads_id}/${ids.options.google_ads_label}`, transport_type:'beacon'});
 if (consent.marketing && active.meta_pixel_id) window.fbq?.('track', 'Contact');
}
