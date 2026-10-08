/* ==========================================================================
   Wania ♡ — little interactions
   Soft page-load · navbar · mobile menu · scroll reveal · gentle parallax
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------
     1 · Soft page-load: one gentle sequence once fonts/images are ready
     ------------------------------------------------------------------ */
  let started = false;
  const startPage = () => {
    if (started) return;
    started = true;
    root.classList.add('is-loaded');
    const loader = $('.loader');
    if (loader) setTimeout(() => loader.remove(), 1400);
  };
  window.addEventListener('load', () => setTimeout(startPage, reduceMotion ? 0 : 750));
  setTimeout(startPage, 3500); // never leave the veil up if something is slow

  /* ------------------------------------------------------------------
     2 · Navbar: blur + shadow only after scrolling
     ------------------------------------------------------------------ */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ------------------------------------------------------------------
     3 · Mobile menu
     ------------------------------------------------------------------ */
  const burger = $('#burger');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('[data-nav]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ------------------------------------------------------------------
     4 · Active nav link while scrolling
     ------------------------------------------------------------------ */
  const links = $$('[data-nav]');
  const sectionFor = new Map();
  links.forEach((a) => {
    const target = $(a.getAttribute('href'));
    if (target) sectionFor.set(target, a);
  });
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        sectionFor.get(entry.target)?.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionFor.forEach((_, section) => spy.observe(section));
  }

  /* ------------------------------------------------------------------
     5 · Quote: split into words for a soft text reveal
     ------------------------------------------------------------------ */
  $$('[data-words]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach((word, i, all) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = word;
      inner.style.setProperty('--wd', `${0.12 + i * 0.09}s`);
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ------------------------------------------------------------------
     6 · Scroll reveal (+ hand-drawn strokes animating into view)
     ------------------------------------------------------------------ */
  const revealables = $$('[data-reveal], [data-draw]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     7 · Quote particles: a few quiet specks drifting upward
     ------------------------------------------------------------------ */
  const particleBox = $('#particles');
  if (particleBox && !reduceMotion) {
    const colours = ['#CC8F94', '#8E80AE', '#C9A56B', '#F5DAD6'];
    const count = window.innerWidth < 600 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle' + (i % 4 === 0 ? ' particle--star' : '');
      p.style.left = `${4 + Math.random() * 92}%`;
      p.style.top = `${8 + Math.random() * 82}%`;
      p.style.setProperty('--ps', `${2 + Math.random() * 3}px`);
      p.style.setProperty('--pd', `${10 + Math.random() * 10}s`);
      p.style.setProperty('--pl', `${-Math.random() * 12}s`);
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 36}px`);
      p.style.setProperty('--c', colours[i % colours.length]);
      particleBox.appendChild(p);
    }
  }

  /* ------------------------------------------------------------------
     8 · Subtle scroll parallax (translate only, so floats keep working)
     ------------------------------------------------------------------ */
  const parallaxEls = $$('[data-parallax]').map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.06,
    host: el.closest('section') || el.parentElement,
  }));

  let ticking = false;
  const updateParallax = () => {
    ticking = false;
    const vh = window.innerHeight;
    parallaxEls.forEach(({ el, speed, host }) => {
      const r = host.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.setProperty('--py', `${(-offset).toFixed(1)}px`);
    });
  };
  if (!reduceMotion && parallaxEls.length) {
    updateParallax();
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    window.addEventListener('resize', updateParallax);
  }

  /* ------------------------------------------------------------------
     9 · Hero: layers drift a tiny bit with the pointer (desktop only)
     ------------------------------------------------------------------ */
  const heroArt = $('.hero-art');
  if (heroArt) {
    $$('[data-depth]', heroArt).forEach((el) => el.style.setProperty('--depth', el.dataset.depth));

    if (!reduceMotion && finePointer) {
      const hero = $('#home');
      hero.addEventListener('pointermove', (e) => {
        const r = heroArt.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        heroArt.style.setProperty('--mx', (x * 2).toFixed(3));
        heroArt.style.setProperty('--my', (y * 2).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => {
        heroArt.style.setProperty('--mx', 0);
        heroArt.style.setProperty('--my', 0);
      });
    }
  }
})();