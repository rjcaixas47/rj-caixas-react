// O header CSP sandbox protege também o acesso direto a este documento.
// Não adicionar allow-same-origin, popups, forms nem navegação superior.
let received = false;
window.addEventListener('message', async event => {
 if (received || window.parent === window || event.source !== window.parent || event.data?.type !== 'rj-custom-code' || typeof event.data.code !== 'string' || event.data.code.length > 12000) return;
 received = true;
 const template = document.createElement('template');
 template.innerHTML = event.data.code;
 // Scripts criados por innerHTML são inertes; substituí-los preservando a ordem.
 const scripts = [...template.content.querySelectorAll('script')];
 const pairs = scripts.map(original => {
  const placeholder = document.createComment('script'); original.replaceWith(placeholder);
  return {original, placeholder};
 });
 document.body.appendChild(template.content);
 for (const {original, placeholder} of pairs) {
  const script = document.createElement('script');
  for (const name of ['src','type','async','defer','integrity','crossorigin']) if (original.hasAttribute(name)) script.setAttribute(name, original.getAttribute(name));
  if (script.src && !script.src.startsWith('https://')) {placeholder.remove();continue;}
  script.textContent = original.textContent;
  const pending = script.src && !script.async ? new Promise(resolve => {script.onload = resolve; script.onerror = resolve;}) : null;
  placeholder.replaceWith(script);
  if (pending) await pending;
 }
});
