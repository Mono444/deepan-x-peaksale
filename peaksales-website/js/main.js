/* =========================================================
   PeakSales – main.js
   Vanilla JS. No framework. No dependencies.
   ========================================================= */

'use strict';

/* ── Header: scroll → ink bg ──────────────────────────────── */
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile menu toggle ────────────────────────────────────── */
(function () {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.innerHTML = isOpen
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── Process ridge animation ─────────────────────────────── */
(function () {
  const svg = document.getElementById('ridge-svg');
  if (!svg) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { svg.classList.add('animate'); return; }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        svg.classList.add('animate');
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(svg);
})();

/* ── FAQ tabs ─────────────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('.faq-tab');
  const panels = document.querySelectorAll('.faq-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(target)?.classList.add('active');
    });
  });
})();

/* ── Analytics event stubs ────────────────────────────────── */
(function () {
  function trackEvent(name, params) {
    // Replace with gtag('event', name, params) once GA4 is installed
    console.debug('[PeakSales analytics]', name, params);
  }

  const ctaIds = [
    'header-book-btn', 'hero-book-btn', 'mobile-book-btn',
    'sticky-book-btn', 'final-book-btn', 'footer-book-btn',
    'service-fullgrowth-cta', 'service-dedicatedteam-cta', 'service-optimisation-cta'
  ];
  ctaIds.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      trackEvent('cta_click', { location: id, type: 'book' });
    });
  });

  ['hero-careers-link', 'cta-careers-link', 'careers-band-cta', 'mnav-careers'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      trackEvent('cta_click', { location: id, type: 'apply' });
    });
  });

  document.querySelectorAll('details.faq-item').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) trackEvent('faq_open', { question_id: d.id });
    });
  });

  let s75Fired = false;
  window.addEventListener('scroll', () => {
    if (s75Fired) return;
    const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (pct >= 0.75) { s75Fired = true; trackEvent('scroll_75', { page: window.location.pathname }); }
  }, { passive: true });
})();
