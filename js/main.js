/* =========================================================
   PeakSales V2 - main.js
   Vanilla JS. No framework. No scroll listeners.
   Uses IntersectionObserver for all scroll-driven behaviour.
   ========================================================= */

'use strict';

/* ── Helpers ───────────────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  }
  console.debug('[PeakSales analytics]', name, params);
}

/* ── Header: scrolled state via IntersectionObserver ──────── */
(function () {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('header-sentinel');
  if (!header || !sentinel) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 0 }
  );
  observer.observe(sentinel);
})();

/* ── Mobile menu toggle ────────────────────────────────────── */
(function () {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    // Switch icon between list and X
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'ph ph-x' : 'ph ph-list';
    }
  });

  // Close menu on link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'ph ph-list';
    });
  });
})();

/* ── Lead feed animation ───────────────────────────────────── */
(function () {
  const feeds = document.querySelectorAll('.feed-event');
  if (!feeds.length) return;

  if (prefersReduced) {
    feeds.forEach(f => f.classList.add('visible'));
    return;
  }

  let loopCount = 0;
  const maxLoops = 3;

  function runLoop() {
    if (loopCount >= maxLoops) return;
    loopCount++;

    // Reset
    feeds.forEach(f => f.classList.remove('visible'));

    feeds.forEach((f, i) => {
      setTimeout(() => f.classList.add('visible'), 500 + i * 700);
    });
  }

  // Start on visibility
  const heroFeed = document.querySelector('.lead-feed-card');
  if (!heroFeed) return;

  const feedObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        runLoop();
        // Repeat every 10s
        const interval = setInterval(() => {
          if (loopCount >= maxLoops) { clearInterval(interval); return; }
          runLoop();
        }, 10000);
        feedObserver.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  feedObserver.observe(heroFeed);
})();

/* ── Stepper line animation ────────────────────────────────── */
(function () {
  const stepper = document.getElementById('stepper');
  const line = document.getElementById('stepper-line');
  if (!stepper || !line) return;

  if (prefersReduced) {
    line.classList.add('drawn');
    stepper.querySelectorAll('.step-dot').forEach(d => d.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        line.classList.add('drawn');
        // Activate dots sequentially
        const dots = stepper.querySelectorAll('.step-dot');
        dots.forEach((dot, i) => {
          setTimeout(() => dot.classList.add('active'), 400 + i * 600);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  observer.observe(stepper);
})();

/* ── Service model tabs ────────────────────────────────────── */
(function () {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = tablist.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  function activateTab(tab) {
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    panels.forEach(p => p.hidden = true);

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();

    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (panel) panel.hidden = false;

    // Update URL hash
    if (panel && panel.id) {
      history.replaceState(null, '', '#' + panel.id);
    }

    trackEvent('service_tab_change', { tab: panelId });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
  });

  // Arrow key navigation
  tablist.addEventListener('keydown', e => {
    const tabArr = Array.from(tabs);
    const currentIdx = tabArr.indexOf(document.activeElement);
    let newIdx;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIdx = (currentIdx + 1) % tabArr.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIdx = (currentIdx - 1 + tabArr.length) % tabArr.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIdx = tabArr.length - 1;
    }

    if (newIdx !== undefined) {
      activateTab(tabArr[newIdx]);
    }
  });

  // Hash-based tab opening on page load
  const hash = window.location.hash;
  if (hash) {
    const matchingPanel = document.querySelector(hash + '[role="tabpanel"]');
    if (matchingPanel) {
      const matchingTab = document.querySelector('[aria-controls="' + matchingPanel.id + '"]');
      if (matchingTab) activateTab(matchingTab);
    }
  }
})();

/* ── FAQ tabs ─────────────────────────────────────────────── */
(function () {
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqPanels = document.querySelectorAll('.faq-panel');
  if (!faqTabs.length) return;

  faqTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');
      faqTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      faqPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');

      trackEvent('faq_tab_switch', { tab: target });
    });
  });

  // Track individual FAQ opens
  document.querySelectorAll('details.faq-item').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) trackEvent('faq_open', { question_id: d.id });
    });
  });
})();

/* ── Scroll-depth tracking via IntersectionObserver ────────── */
(function () {
  const footer = document.querySelector('footer');
  if (!footer) return;

  let fired = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        trackEvent('scroll_75', { page: window.location.pathname });
        observer.disconnect();
      }
    },
    { threshold: 0 }
  );
  observer.observe(footer);
})();

/* ── CTA click tracking ───────────────────────────────────── */
(function () {
  const bookBtns = [
    'header-book-btn', 'hero-book-btn', 'mobile-book-btn',
    'sticky-book-btn', 'final-book-btn', 'footer-book-btn',
    'service-fullgrowth-cta', 'service-dedicatedteam-cta', 'service-optimisation-cta',
    'consult-book-btn'
  ];
  bookBtns.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      trackEvent('cta_click', { location: id, type: 'book' });
    });
  });

  const applyBtns = ['hero-careers-link', 'cta-careers-link', 'careers-band-cta', 'mnav-careers'];
  applyBtns.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      trackEvent('cta_click', { location: id, type: 'apply' });
    });
  });
})();

/* ── Smooth scroll for anchor links (respects reduced motion) */
(function () {
  if (prefersReduced) return;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
