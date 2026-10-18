import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

export function BrandIcon({ name, ...props }) {
  const paths = {
    box: <><path d="m3 7 9-5 9 5v10l-9 5-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5v4"/></>,
    leaf: <><path d="M20 3C8 2 3 6 4 13c1 5 7 7 11 3 3-3 4-8 5-13Z"/><path d="M3 22c1-7 5-11 11-14"/></>,
    pin: <><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    chat: <><path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z"/><path d="M7 9h9M7 13h6"/></>,
    search: <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.box}</svg>;
}

export function Carousel({ children, className, ...props }) {
  const banner = className.includes('sf-banner');
  const trackRef = useRef(null);
  const touch = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const items = Children.toArray(children);
  const track = items.find(child => isValidElement(child) && Object.hasOwn(child.props, 'data-carousel-track'));
  const slides = track ? Children.toArray(track.props.children).filter(isValidElement) : [];
  const move = direction => {
    if (banner && slides.length) setActive(current => (current + direction + slides.length) % slides.length);
    else trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  useEffect(() => { setActive(0); }, [slides.length]);
  useEffect(() => {
    if (!banner || paused || slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive(current => (current + 1) % slides.length), 9000);
    return () => clearInterval(timer);
  }, [banner, paused, slides.length]);
  useEffect(() => {
    if (banner || !trackRef.current) return;
    const element = trackRef.current;
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(element); element.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [banner, slides.length]);
  return <div {...props} className={className} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { if (banner && touch.current !== null && Math.abs(touch.current - event.changedTouches[0].clientX) > 40) move(touch.current > event.changedTouches[0].clientX ? 1 : -1); touch.current = null; }}>
    {items.map(child => {
      if (!isValidElement(child)) return child;
      if (Object.hasOwn(child.props, 'data-carousel-track')) return cloneElement(child, { ref: trackRef, className: child.props.className + (banner ? ' is-stacked' : ''), 'data-fx': banner ? 'zoom' : undefined }, banner ? slides.map((slide, index) => cloneElement(slide, { key: index, className: slide.props.className + (index === active ? ' is-active' : ''), 'aria-hidden': index !== active })) : child.props.children);
      if (Object.hasOwn(child.props, 'data-carousel-prev') || Object.hasOwn(child.props, 'data-carousel-next')) {
        const prev = Object.hasOwn(child.props, 'data-carousel-prev');
        return cloneElement(child, { onClick: event => { event.stopPropagation(); move(prev ? -1 : 1); }, disabled: !banner && (prev ? edges.start : edges.end) });
      }
      if (Object.hasOwn(child.props, 'data-carousel-dots')) return cloneElement(child, {}, slides.map((_, index) => <button key={index} type="button" className={'sf-banner__dot' + (index === active ? ' is-active' : '')} aria-label={`Ver banner ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />));
      return child;
    })}
  </div>;
}
