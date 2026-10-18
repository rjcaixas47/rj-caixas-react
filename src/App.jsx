import React, { useEffect, useRef, useState } from 'react';
import Storefront from './Storefront.jsx';
import { BrandIcon } from './components.jsx';
import {useCatalog} from './catalog/CatalogContext.jsx';
import {formatPrice,whatsappLink} from './catalog/model.js';
import { WhatsAppButton } from './Wholesale.jsx';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function savedSelection(products) {
  try {
    const saved = JSON.parse(localStorage.getItem('rj-selection') || '{}');
    return Object.fromEntries(products.filter(product => Number.isInteger(saved?.[product.id]) && saved[product.id] > 0 && saved[product.id] <= 999).map(product => [product.id, saved[product.id]]));
  } catch { return {}; }
}

export default function App() {
  const {products, settings, configured} = useCatalog();
  const whatsapp = whatsappLink(settings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [selection, setSelection] = useState(() => savedSelection(products));
  const dialog = useRef(null);
  const menuButton = useRef(null);
  const [notice, setNotice] = useState('');
  const currentProduct = modal?.type === 'product' ? products.find(p => p.id === modal.productId) : null;
  useEffect(() => { if (modal?.type === 'product' && !currentProduct) setModal(null); }, [modal, currentProduct]);
  const selected = products.filter(product => selection[product.id]);
  useEffect(() => { try { localStorage.setItem('rj-selection', JSON.stringify(selection)); } catch { /* Selection remains available in memory. */ } }, [selection]);
  useEffect(() => {
    const element = dialog.current;
    if (modal && !element.open) element.showModal();
    else if (!modal && element.open) element.close();
    document.body.style.overflow = modal || menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modal, menuOpen]);
  useEffect(() => {
    const close = event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const add = product => {
    setSelection(current => ({ ...current, [product.id]: Math.min((current[product.id] || 0) + 1, 999) }));
    setNotice('Produto adicionado à seleção.');
  };
  const open = next => { setNotice(''); setMenuOpen(false); setModal(next); };
  function handleClick(event) {
    const toggle = event.target.closest('[data-drawer-toggle]');
    if (toggle) { menuButton.current = toggle; setMenuOpen(value => !value); return; }
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (anchor.dataset.productId) {
      event.preventDefault(); open({ type: 'product', productId: anchor.dataset.productId });
    } else if (href === '#orcamento') { event.preventDefault(); open({ type: 'selection' }); }
    else if (href?.startsWith('#categoria-')) {
      event.preventDefault(); const label = anchor.textContent.trim();
      const categoryId = href.slice('#categoria-'.length);
      open({ type: 'results', title: label || 'Produtos', query: '', categoryId });
    } else if (href?.startsWith('#info-') || href?.startsWith('#categoria-politicas')) {
      event.preventDefault(); const key = {'#info-quem-somos':'about','#info-termos-de-uso':'terms','#info-politica-de-privacidade':'privacy','#info-institucional/shipping':'shipping','#info-trocas-devolucoes-e-reembolso':'returns','#info-perguntas-frequentes':'faq'}[href];
      open({ type: 'info', title: anchor.textContent.trim(), content: settings[key] });
    }
  }
  function handleSearch(event) {
    event.preventDefault(); const query = String(new FormData(event.target).get('q') || '').trim();
    open({ type: 'results', title: query ? `Resultados para “${query}”` : 'Todos os produtos', query });
  }
  const results = modal?.type === 'results' ? products.filter(product => modal.categoryId ? product.category_id === modal.categoryId : normalize(product.name+' '+product.description).includes(normalize(modal.query))) : [];
  return <>
    <Storefront menuOpen={menuOpen} onClick={handleClick} onSubmit={handleSearch} />
    {!modal && !menuOpen && <WhatsAppButton floating />}
    {menuOpen && <button type="button" className="rj-menu-backdrop" aria-label="Fechar menu" onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }} />}
    <dialog className="rj-dialog" ref={dialog} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null); }} aria-labelledby="rj-dialog-title">
      <div className="rj-dialog__header"><h2 id="rj-dialog-title">{modal?.type === 'product' ? 'Detalhes do produto' : modal?.type === 'selection' ? 'Sua seleção para orçamento' : modal?.title}</h2><button className="rj-icon-button" type="button" aria-label="Fechar" onClick={() => setModal(null)}><BrandIcon name="close" /></button></div>
      {modal?.type === 'product' && currentProduct && <div className="rj-product"><img src={currentProduct.image} alt={currentProduct.name} /><div><h3>{currentProduct.name}</h3><p>{currentProduct.description}</p><strong className="rj-product__price">{formatPrice(currentProduct.price_cents)}</strong><p>{currentProduct.pack}</p><p className="rj-note">{configured ? "Confirme disponibilidade, medidas e condições de atacado com a equipe." : "Produto e valor da referência visual. Confirme opções, medidas e preço com a RJ Caixas."}</p><button className="sf-btn sf-btn--primary" onClick={() => add(currentProduct)}>Selecionar para orçamento</button><p role="status">{notice}</p><WhatsAppButton productName={currentProduct.name}>Orçar atacado no WhatsApp</WhatsAppButton></div></div>}
      {modal?.type === 'results' && <><p>{results.length} produto(s) encontrado(s).</p><div className="rj-results">{results.map(product => <button className="rj-result" key={product.id} onClick={() => open({ type: 'product', productId: product.id })}><img src={product.image} alt=""/><span>{product.name}<strong>{formatPrice(product.price_cents)}</strong></span></button>)}</div>{!results.length && <p>Para outras opções e medidas, <a href={whatsapp} target="_blank" rel="noopener noreferrer">fale com a RJ Caixas</a>.</p>}</>}
      {modal?.type === 'selection' && <>{selected.length ? <><ul className="rj-selection">{selected.map(product => <li key={product.id}><img src={product.image} alt=""/><span>{product.name}<small>Quantidade de pacotes: {selection[product.id]}</small></span><button className="rj-icon-button" aria-label={`Remover ${product.name}`} onClick={() => setSelection(current => { const next = { ...current }; delete next[product.id]; return next; })}><BrandIcon name="close"/></button></li>)}</ul><p className="rj-note">Esta seleção fica salva neste navegador. Envie as referências à equipe para confirmar disponibilidade, medidas e valores.</p></> : <p>Sua seleção está vazia. Abra um produto para adicioná-lo ao orçamento.</p>}<a className="sf-btn sf-btn--primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Solicitar orçamento no WhatsApp</a></>}
      {modal?.type === 'info' && <><p style={{whiteSpace:"pre-wrap"}}>{modal.content || `A equipe da ${settings.brand_name} pode orientar você sobre ${modal.title.toLowerCase()}.`}</p><p>{settings.address}</p><a className="sf-btn sf-btn--primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Falar com a RJ Caixas</a></>}
    </dialog>
  </>;
}
