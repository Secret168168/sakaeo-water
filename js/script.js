/* รถน้ำสระแก้ว-นะชาลีติ — script.js */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ----- Navbar scroll + mobile menu ----- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { menu.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const o = menu.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o));
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));

  /* ----- Image fallback: placeholder shows through when file is missing ----- */
  $$('.ph-box img').forEach(img => {
    const hide = () => { img.style.display = 'none'; img.dataset.failed = '1'; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ----- Counters ----- */
  function counters(root) {
    $$('[data-count]', root).forEach(el => {
      const end = +el.dataset.count; let n = 0; const step = Math.max(1, Math.ceil(end / 40));
      const t = setInterval(() => { n = Math.min(end, n + step); el.textContent = n; if (n >= end) clearInterval(t); }, 40);
    });
  }

  /* ----- Scroll reveal ----- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); counters(e.target); } });
  }, { threshold: .12 }) : null;
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    if (io) io.observe(el); else { el.classList.add('in'); counters(el); }
  });

  /* ----- Button ripple ----- */
  $$('.btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 600);
  }));

  /* ----- Gallery: show all ----- */
  const gal = $('#gal'), moreBtn = $('#moreBtn');
  moreBtn.addEventListener('click', () => {
    const all = gal.classList.toggle('all');
    moreBtn.textContent = all ? 'ย่อภาพ' : 'ดูภาพทั้งหมด';
    if (all) $$('.gi.more', gal).forEach(g => g.classList.add('in'));
  });

  /* ----- Gallery: fill hover caption + descriptive labels from data-t ----- */
  $$('.gi', gal).forEach(g => {
    const t = g.dataset.t; if (!t) return;
    const b = $('.ov b', g); if (b) b.textContent = t;
    const img = $('img', g); if (img) img.alt = t;
    g.setAttribute('aria-label', 'ดูภาพขยาย: ' + t);
  });

  /* ----- Lightbox (with focus management) ----- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbPh = $('#lbPh'), lbCap = $('#lbCap');
  const lbX = $('#lbX'), lbP = $('#lbP'), lbN = $('#lbN');
  let idx = 0, lastFocus = null;
  const items = () => $$('.gi', gal).filter(g => getComputedStyle(g).display !== 'none');
  function show(i) {
    const list = items(); idx = (i + list.length) % list.length;
    const g = list[idx], img = $('img', g);
    lbCap.textContent = g.dataset.t;
    if (img && !img.dataset.failed) { lbImg.src = img.src; lbImg.alt = g.dataset.t; lbImg.style.display = 'block'; lbPh.style.display = 'none'; }
    else { lbImg.style.display = 'none'; lbPh.style.display = 'grid'; lbPh.textContent = g.dataset.ph; }
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    lbX.focus();
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }
  $$('.gi', gal).forEach(g => g.addEventListener('click', () => open(items().indexOf(g))));
  lbX.addEventListener('click', close);
  lbP.addEventListener('click', () => show(idx - 1));
  lbN.addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'Tab') { /* trap focus inside the lightbox */
      const f = [lbX, lbP, lbN], i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();