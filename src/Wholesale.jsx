import React, { useEffect, useRef, useState } from 'react';
import { siWhatsapp } from 'simple-icons';
import {useCatalog} from './catalog/CatalogContext.jsx';
import {whatsappLink} from './catalog/model.js';

export const WHATSAPP_URL = 'https://wa.me/message/6AHUVBGYX2XHM1';

export function WhatsAppIcon() {
  return <svg data-icon-library="simple-icons" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><path d={siWhatsapp.path} /></svg>;
}

export function WhatsAppButton({ children, className = '', productName, floating = false }) {
  const {settings} = useCatalog();
  return <a className={`rj-whatsapp-button ${floating ? 'rj-whatsapp-floating' : ''} ${className}`} href={whatsappLink(settings,productName)} target="_blank" rel="noopener noreferrer" aria-label={productName ? `Solicitar orçamento de atacado: ${productName}, pelo WhatsApp` : undefined}>
    <WhatsAppIcon />
    {floating ? <span><small>ATENDIMENTO ATACADO</small><strong>Fale com a {settings.brand_name}</strong></span> : <span>{children || settings.whatsapp_label}</span>}
  </a>;
}

function OpeningBox() {
  return <svg className="rj-opening-box" viewBox="4 8 92 78" aria-hidden="true" fill="none" stroke="#005b34" strokeWidth="1.5" strokeLinejoin="round">
    <ellipse className="rj-box-shadow" cx="50" cy="81" rx="27" ry="3" fill="#005b34" opacity=".08" stroke="none" />
    <path d="m26 38 24-12 24 12-24 13Z" fill="#264e32" />
    <g className="rj-box-flap rj-box-flap-back"><path d="m26 38 24-12-12-12-24 12Z" fill="#e7d4a0"/><path d="m50 26 24 12 12-12-24-12Z" fill="#f0dfb8"/></g>
    <g className="rj-box-sprout" strokeWidth="2"><path d="M50 44V26"/><path d="M50 31c-10 0-13-6-13-11 10 0 13 6 13 11Z" fill="#78b54d"/><path d="M50 27c0-9 6-12 13-12 0 8-5 12-13 12Z" fill="#abd57f"/></g>
    <path d="m26 38 24 13v27L26 64Z" fill="#dcc28a"/><path d="m50 51 24-13v26L50 78Z" fill="#b99b63"/>
    <path d="m59 57 9-5v7l-9 5Z" fill="#005b34" stroke="none"/>
    <g className="rj-box-flap rj-box-flap-left"><path d="m26 38 24 13-16 9-24-15Z" fill="#f0dfb8"/></g>
    <g className="rj-box-flap rj-box-flap-right"><path d="m50 51 24-13 16 7-24 15Z" fill="#e7d4a0"/></g>
    <path d="m32 57 11 6m-11-1 7 4" opacity=".4" />
  </svg>;
}

export function WholesaleSectionHeading({ id = "sf-e-5", title = "Caixas de Papelão", headingId = "rj-caixas-title" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { threshold: .5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section className="sf-section sf-section--banner" aria-labelledby={headingId}><div className="sf-container">
    <div ref={ref} id={id} className={`rj-section-heading${visible ? ' is-open' : ''}`}>
      <div className="rj-section-heading__identity"><OpeningBox/><h2 id={headingId}>{title}</h2><span className="rj-wholesale-label">ATACADO</span></div>
      <WhatsAppButton className="rj-section-heading__cta">Pedir orçamento</WhatsAppButton>
    </div>
  </div></section>;
}
