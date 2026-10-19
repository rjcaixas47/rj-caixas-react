// Código livre roda em uma origem opaca: não enxerga a página nem a sessão do painel.
const frames = new Map();
export function applyCustomCodes(codes = [], consent) {
 for (const item of codes) {
  if (!item.enabled || !consent[item.category] || frames.has(item.id)) continue;
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.title = `Código de rastreamento: ${item.name}`;
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.referrerPolicy = 'no-referrer';
  frame.src = '/tracking-sandbox.html';
  // A origem de destino é opaca. A mensagem contém apenas conteúdo público, nunca credenciais.
  frame.addEventListener('load', () => frame.contentWindow?.postMessage({type:'rj-custom-code', code:item.code}, '*'), {once:true});
  frames.set(item.id, frame);
  document.body.appendChild(frame);
 }
}
export const hasCustomCodes = () => frames.size > 0;
export function applyVerification(verification = {}) {
 for (const [key, name] of [['google','google-site-verification'],['meta','facebook-domain-verification']]) {
  const value = verification[key];
  if (!value || !/^[A-Za-z0-9_-]{1,200}$/.test(value)) continue;
  const meta = document.createElement('meta');
  meta.name = name; meta.content = value;
  document.head.appendChild(meta);
 }
}
