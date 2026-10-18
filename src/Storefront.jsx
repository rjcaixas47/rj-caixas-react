import React, { useEffect, useState } from "react";
import { useCatalog } from "./catalog/CatalogContext.jsx";
import ProductCard from "./catalog/ProductCard.jsx";
import { whatsappLink } from "./catalog/model.js";
import { Carousel, BrandIcon } from "./components.jsx";
import { WholesaleSectionHeading, WhatsAppButton, WhatsAppIcon } from "./Wholesale.jsx";

function Announcements({settings}) {
  const messages=[settings.announcement_1,settings.announcement_2,settings.announcement_3].filter(Boolean);
  const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
  useEffect(() => { if(paused || messages.length<2)return; const timer=setInterval(()=>setActive(i=>(i+1)%messages.length),4000); return()=>clearInterval(timer); },[paused,messages.length]);
  return <ul className="sf-announcements__track" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>{messages.map((message,index)=><li key={index} className={`sf-announcements__item${index===active%messages.length?' is-active':''}`} aria-hidden={index!==active%messages.length}>{message}</li>)}</ul>;
}

export default function Storefront({ menuOpen, onClick, onSubmit }) {
  const { products, categories, banners, settings } = useCatalog();
  const whatsapp = whatsappLink(settings);
  return <div onClick={onClick} onSubmit={onSubmit}>
<a className="sf-skip-link" href="#conteudo">Ir para o conteúdo</a>
 <div className="sf-announcements sf-announcements--combined sf-announcements--fade sf-announcements--align-center sf-announcements--layout-rotate" data-announcements="" data-layout="rotate" data-interval="4000" role="region" aria-label="Avisos e atendimento da loja"><div className="sf-container sf-announcements__inner"><div className="sf-announcements__group sf-announcements__group--left"><a className="sf-topbar-item sf-topbar-item--instagram sf-announcements__aux-item" href={settings.instagram} rel="noopener noreferrer" target="_blank"><span className="sf-topbar-item__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"></path>
</svg>
</span>
 <span className="sf-topbar-item__label">Instagram</span>
</a>
 </div>
 <div className="sf-announcements__group sf-announcements__group--center"><Announcements settings={settings}/>
 </div>
 <div className="sf-announcements__group sf-announcements__group--right"><a className="sf-topbar-item sf-topbar-item--telefone sf-announcements__aux-item" href={`tel:${settings.phone}`}><span className="sf-topbar-item__icon" aria-hidden="true"><svg viewBox="3 3.2 18.1 18.1" aria-hidden="true"><path fill="currentColor" d="M6.6 3.2H4.7C3.8 3.2 3 4 3 4.9A16.4 16.4 0 0 0 19.4 21.3c.9 0 1.7-.8 1.7-1.7v-1.9c0-.7-.5-1.3-1.2-1.5l-3-.8c-.6-.2-1.3.1-1.6.6l-.8 1.4a12.6 12.6 0 0 1-6-6l1.4-.8c.6-.3.8-1 .7-1.6l-.8-3c-.2-.7-.8-1.2-1.5-1.2Z"></path>
</svg>
</span>
 <span className="sf-topbar-item__label">{settings.phone_label}</span>
</a>
 </div>
</div>
 </div>
 <header className="sf-header" data-preview-anchor="header" data-header-nav="linha-propria" data-header-menu="dropdown" data-header-nav-width="contido" data-header-nav-corners="padrao" data-header-scroll="encolhe" data-header-scroll-mode="encolhe"><div className="sf-container sf-header__bar"><button className="sf-header__menu-toggle" type="button" data-drawer-toggle="menu" aria-label="Abrir menu" aria-expanded={menuOpen}><span className="sf-icon-burger" aria-hidden="true"></span>
 </button>
 <a className="sf-header__logo" href="/"><img src={settings.logo} alt={settings.brand_name} loading="eager" /> </a>
 <form className="sf-header__search" role="search"><input className="sf-header__search-input" type="search" name="q" defaultValue="" placeholder="Buscar produtos…" aria-label="Buscar produtos" /> <button className="sf-header__search-submit" type="submit" aria-label="Buscar"><BrandIcon name="search" /> </button>
</form>
 <nav className="sf-header__actions" aria-label="WhatsApp e Conta e Carrinho"><a className="sf-header__action sf-header__whatsapp" href={whatsapp} data-wa-apresentacao="texto" target="_blank" rel="noopener noreferrer" aria-label="Falar pelo WhatsApp"><span className="sf-header__whatsapp-icon" aria-hidden="true"><WhatsAppIcon />
 </span>
 <span className="sf-header__whatsapp-label">{settings.header_whatsapp_label}</span>
</a>
 <div className="sf-account-menu" data-clique-desktop="ir" data-clique-celular="ir">  <a className="sf-header__action sf-account-menu__trigger-link" href={whatsapp} aria-label="Falar com a RJ Caixas" target="_blank" rel="noopener noreferrer"><BrandIcon name="chat" /> <span className="sf-account-menu__greeting"> <small>Olá, bem-vindo(a)</small>
 <strong>Fale com a RJ Caixas</strong>
 </span>
</a>
  </div>
 <div className="sf-mini-cart" data-clique-desktop="ir" data-clique-celular="ir">  <a className="sf-header__action sf-mini-cart__trigger-link" href="#orcamento" aria-label="Abrir seleção para orçamento"><BrandIcon name="box" />  </a>
  </div>
</nav>
</div>
 <nav aria-label="Departamentos" data-nav-departments="" className={"sf-container sf-header__nav" + (menuOpen ? " is-open" : "")}><form className="sf-header__nav-search" role="search"><input className="sf-header__search-input" type="search" name="q" defaultValue="" placeholder="Buscar produtos…" aria-label="Buscar produtos" /> <button className="sf-header__search-submit" type="submit" aria-label="Buscar"><BrandIcon name="search" /> </button>
</form>
 <a className="sf-header__nav-account" href={whatsapp} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" width="20" height="20"><circle cx="12" cy="8" r="4"></circle>
<path d="M4 21a8 8 0 0 1 16 0"></path>
 </svg>
 Falar com a RJ Caixas </a>
 <ul className="sf-header__nav-list">{categories.map(category => <li className="sf-header__nav-item" key={category.id}><a href={`#categoria-${category.id}`}>{category.name}</a></li>)}</ul>
</nav>
</header>
 <main id="conteudo" className="sf-main"> <h1 className="sf-visually-hidden">{settings.brand_name}</h1>
 <div className="sf-sec sf-sec--pt-none"><section className="sf-section sf-section--banner sf-section--banner-bleed" aria-label="Destaques"><div className="sf-full"><Carousel className="sf-banner sf-banner--carousel sf-car--arrows-pill sf-car--dots-bars sf-car--pos-overlay sf-banner--bleed sf-banner--capped sf-banner--nat-m" data-carousel="" data-carousel-paged="" id="sf-e-1" data-carousel-fx="zoom" data-carousel-fx-ms="500" data-carousel-autoplay="" data-carousel-interval="9000" data-carousel-loop=""><div className="sf-banner__track" data-carousel-track="">{banners.map((banner, index) => <div className="sf-banner__slide" key={banner.id}>{banner.href ? <a href={banner.href}><picture><source media="(min-width: 768px)" srcSet={banner.image}/><img src={banner.mobile_image || banner.image} alt={banner.name} loading={index ? 'lazy' : 'eager'} fetchPriority={index ? undefined : 'high'}/></picture></a> : <picture><source media="(min-width: 768px)" srcSet={banner.image}/><img src={banner.mobile_image || banner.image} alt={banner.name} loading={index ? 'lazy' : 'eager'} fetchPriority={index ? undefined : 'high'}/></picture>}</div>)}</div>
 <button type="button" className="sf-banner__btn sf-banner__btn--prev" data-carousel-prev="" aria-label="Banner anterior"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path>
</svg>
 </button>
 <button type="button" className="sf-banner__btn sf-banner__btn--next" data-carousel-next="" aria-label="Próximo banner"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path>
</svg>
 </button>
 <div className="sf-banner__dots" data-carousel-dots="" aria-label="Indicadores"></div>
</Carousel>
 </div>
 </section>
 </div>
 <div className="sf-sec sf-sec--pt-none sf-sec--pb-none"><section className="sf-section sf-section--cta-grid" aria-label="Vantagens"><div className="sf-container"><div className="sf-cta-grid sf-grid sf-cta-grid--stack sf-cta-grid--divided sf-cta-grid--align-center sf-cta-grid--default" id="sf-e-2" data-cols-base="3"><div className="sf-cta-grid__item"><span className="sf-cta-grid__icon" aria-hidden="true"><BrandIcon name="box" /></span>
 <span className="sf-cta-grid__body"><span className="sf-cta-grid__title">{settings.benefit_1_title}</span>
 <span className="sf-cta-grid__text">{settings.benefit_1_text}</span>
</span>
</div>
 <div className="sf-cta-grid__item"><span className="sf-cta-grid__icon" aria-hidden="true"><BrandIcon name="pin" /></span>
 <span className="sf-cta-grid__body"><span className="sf-cta-grid__title">{settings.benefit_2_title}</span>
 <span className="sf-cta-grid__text">{settings.benefit_2_text}</span>
</span>
</div>
 <div className="sf-cta-grid__item"><span className="sf-cta-grid__icon" aria-hidden="true"><BrandIcon name="leaf" /></span>
 <span className="sf-cta-grid__body"><span className="sf-cta-grid__title">{settings.benefit_3_title}</span>
 <span className="sf-cta-grid__text">{settings.benefit_3_text}</span>
</span>
</div>
</div>
 </div>
 </section>
 </div>
 <WholesaleSectionHeading id="sf-e-3" title={settings.categories_title} headingId="rj-categorias-title" />
 <div className="sf-sec sf-sec--pt-none sf-sec--pb-none"><section className="sf-section sf-section--department-carousel" aria-label="Departamentos"><div className="sf-container"><Carousel className="sf-pcar sf-taxcar sf-taxcar--large sf-taxcar--flat sf-car--arrows-pill sf-car--dots-bars sf-car--pos-outside" data-carousel="" data-carousel-dot-class="sf-pcar__dot" data-carousel-autoplay="" data-carousel-interval="4000" data-carousel-infinite=""><div className="sf-pcar__track" data-carousel-track="" id="sf-e-4">{categories.map(category => <a className="sf-taxcar__item" key={category.id} href={`#categoria-${category.id}`}><span className="sf-taxcar__media" aria-hidden="true"><img src={category.image} alt="" loading="lazy" decoding="async" width="260" height="260"/></span><span className="sf-taxcar__name">{category.name}</span></a>)}
 
 
 
 
 
</div>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--prev" data-carousel-prev="" aria-label="Anteriores"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path>
</svg>
 </button>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--next" data-carousel-next="" aria-label="Próximos"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path>
</svg>
 </button>
</Carousel>
 </div>
 </section>
 </div>
 <WholesaleSectionHeading title={settings.boxes_title} />
 <section className="sf-section sf-section--products"><div className="sf-container"><Carousel className="sf-pcar sf-car--arrows-pill sf-car--dots-bars sf-car--pos-outside" data-carousel="" data-carousel-dot-class="sf-pcar__dot"><div className="sf-pcar__track" data-carousel-track="" id="sf-e-6">{products.filter(p => p.section === "boxes").map(product => <ProductCard key={product.id} product={product} />)}{!products.some(p => p.section === "boxes") && <p className="rj-empty-products">Em breve, novos produtos por aqui. Fale com a equipe para consultar opções.</p>}
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
</div>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--prev" data-carousel-prev="" aria-label="Anteriores"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path>
</svg>
 </button>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--next" data-carousel-next="" aria-label="Próximos"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path>
</svg>
 </button>
</Carousel>
 </div>
 </section>
 <WholesaleSectionHeading id="sf-e-7" title={settings.envelopes_title} headingId="rj-envelopes-title" />
 <section className="sf-section sf-section--products"><div className="sf-container"><Carousel className="sf-pcar sf-car--arrows-pill sf-car--dots-bars sf-car--pos-outside" data-carousel="" data-carousel-dot-class="sf-pcar__dot"><div className="sf-pcar__track" data-carousel-track="" id="sf-e-8">{products.filter(p => p.section === "envelopes").map(product => <ProductCard key={product.id} product={product} />)}{!products.some(p => p.section === "envelopes") && <p className="rj-empty-products">Em breve, novos produtos por aqui. Fale com a equipe para consultar opções.</p>}
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
</div>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--prev" data-carousel-prev="" aria-label="Anteriores"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path>
</svg>
 </button>
 <button type="button" className="sf-pcar__btn sf-pcar__btn--next" data-carousel-next="" aria-label="Próximos"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path>
</svg>
 </button>
</Carousel>
 </div>
 </section>
</main>
 <footer className="sf-footer sf-footer--colunas" data-preview-anchor="footer"><div className="sf-container sf-footer__brand"><div className="sf-footer__brand-content"><a href="/" className="sf-footer__logo-link"><img className="sf-footer__logo" src={settings.logo} alt={settings.brand_name} loading="lazy" /> <span className="sf-footer__logo-text">{settings.footer_tagline}</span>
</a>
 <p className="sf-footer__description">{settings.footer_description}</p>
</div>
 </div>
 <div className="sf-container sf-footer__cols"><div className="sf-footer__col"><h2 className="sf-footer__title">Institucional</h2>
 <ul className="sf-footer__links"><li><a href="#info-quem-somos">Quem somos</a>
</li>
 <li><a href="#info-termos-de-uso">Termos de uso</a>
</li>
 <li><a href="#info-politica-de-privacidade">Política de privacidade</a>
</li>
 <li><a href="#preferencias-cookies">Preferências de cookies</a>
</li>
</ul>
</div>
 <div className="sf-footer__col"><h2 className="sf-footer__title">Atendimento</h2>
 <ul className="sf-footer__links"><li><a href="#info-institucional/shipping">Frete e entrega</a>
</li>
 <li><a href="#info-trocas-devolucoes-e-reembolso">Trocas e devoluções</a>
</li>
 <li><a href="#info-perguntas-frequentes">Perguntas Frequentes</a>
</li>
</ul>
</div>
 <div className="sf-footer__col"><h2 className="sf-footer__title">Área da loja</h2>
 <ul className="sf-footer__links"><li><a href="/admin">Painel administrativo</a>
</li>
 <li><a href={whatsapp} target="_blank" rel="noopener noreferrer">Falar com a equipe</a>
</li>
 <li><a href={whatsapp} target="_blank" rel="noopener noreferrer">Solicitar orçamento</a>
</li>
</ul>
</div>
 <div className="sf-footer__col"><h2 className="sf-footer__title">Redes sociais</h2>
 <ul className="sf-footer__links sf-footer__social-list sf-footer__social-list--icons"><li><a className="sf-footer__social-link sf-footer__social-link--icons" href={settings.instagram} rel="noopener noreferrer" target="_blank"><span className="sf-footer__social-icon sf-footer__social-icon--square sf-footer__social-icon--size-large" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"></path>
</svg>
 </span>
 <span className="sf-footer__social-label sf-visually-hidden">Instagram</span>
</a>
 </li>
 <li><a className="sf-footer__social-link sf-footer__social-link--icons" href={settings.facebook} rel="noopener noreferrer" target="_blank"><span className="sf-footer__social-icon sf-footer__social-icon--square sf-footer__social-icon--size-large" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path>
</svg>
 </span>
 <span className="sf-footer__social-label sf-visually-hidden">Facebook</span>
</a>
 </li>
</ul>
 <div className="sf-footer__business-hours"><h3>Onde estamos</h3>
 <span>{settings.address}</span>
</div>
 <div className="sf-footer__contact sf-footer__contact--nested"><h2 className="sf-footer__title">Central de Atendimento</h2>
 <ul><li><strong>WhatsApp:</strong>
 <a href={whatsapp} target="_blank" rel="noopener noreferrer">{settings.phone_label}</a>
</li>
 <li><strong>Instagram:</strong>
 <a href={settings.instagram}>{settings.instagram_label}</a>
</li>
</ul>
</div>
</div>
</div>
 <section className="sf-container sf-footer__commerce" aria-label="Formas de pagamento e segurança"><div className="sf-footer__commerce-group"><h2 className="sf-footer__title sf-footer__commerce-title">Formas de pagamento</h2>
 <div className="sf-footer__payment-strip"><img className="sf-footer__payment-methods" src={settings.payment_image} alt="Formas de pagamento aceitas pela loja" width="809" height="124" loading="lazy" decoding="async" /> </div>
</div>
 <div className="sf-footer__commerce-group"><h2 className="sf-footer__title sf-footer__commerce-title">Segurança</h2>
 <ul className="sf-footer__security-list" aria-label="Recursos de segurança"><li className="sf-footer__security-item"><svg className="sf-footer__security-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"></rect>
 <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
</svg>
 <span><strong>Conexão segura</strong>
 <small>Proteção SSL/TLS</small>
</span>
</li>
 <li className="sf-footer__security-item"><svg className="sf-footer__security-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 7v5c0 4.8-3.3 7.8-8 9-4.7-1.2-8-4.2-8-9V7l8-4Z"></path>
 <path d="m9 12 2 2 4-4"></path>
</svg>
 <span><strong>Dados criptografados</strong>
 <small>Proteção durante a compra</small>
</span>
</li>
 <li className="sf-footer__security-item"><svg className="sf-footer__security-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle>
 <path d="m8.5 12 2.2 2.2 4.8-5"></path>
</svg>
 <span><strong>Ambiente protegido</strong>
 <small>Camadas de segurança</small>
</span>
</li>
</ul>
</div>
</section>
 <div className="sf-container sf-footer__legal"><span className="sf-footer__legal-copy"><span>{settings.brand_name}</span>
 <span>© {new Date().getFullYear()} {settings.brand_name}. Todos os direitos reservados.</span>
</span>
 <span className="sf-footer__tech"><span>Uma loja</span>
 <a href={settings.linktree} target="_blank" rel="noopener noreferrer" aria-label="Academia do Ecommerce"><img src={settings.logo} alt={settings.brand_name} width="40" height="40" loading="lazy" decoding="async" /> </a>
</span>
</div>
</footer>
   
</div>;
}
