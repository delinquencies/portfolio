// nav.js
// Navigation, snap logic, active link highlight, to-top
(function () {
  'use strict';
  const btn  = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  const hero = document.querySelector('.hero');
  const nav  = document.querySelector('.nav');
  const body = document.body;
  const root = document.documentElement;
  const toTopBtn = document.querySelector('.to-top');

  const CFG = { scrollEnterPad: 8, scrollExitPad: 24, resizeDebounce: 120 };
  const isDesktop = () => window.matchMedia('(min-width: 800px)').matches;
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setEqualButtonWidths() {
    if (!menu || !isDesktop()) return;
    const items = Array.from(menu.querySelectorAll('li'));
    if (!items.length) return;
    const cs = getComputedStyle(menu);
    const wasHidden = menu.hidden || cs.display === 'none' || cs.visibility === 'hidden';
    if (wasHidden) {
      menu.hidden = false; menu.style.visibility = 'hidden'; menu.style.position = 'absolute'; menu.style.left = '-99999px';
    }
    items.forEach(li => (li.style.width = 'auto'));
    const max = Math.max(...items.map(li => li.offsetWidth || 0));
    root.style.setProperty('--nav-btn-width', `${Math.ceil(max)}px`);
    if (wasHidden) { menu.hidden = true; menu.style.visibility = ''; menu.style.position = ''; menu.style.left = ''; }
  }

  function ease(t){ return t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function fastScrollTo(yTarget, duration=260){
    if (prefersReduced()) { window.scrollTo({ top: yTarget, behavior: 'auto' }); return; }
    const yStart = window.scrollY, dy = yTarget - yStart, t0 = performance.now();
    function step(now){ const t=Math.min(1,(now-t0)/duration); window.scrollTo(0, yStart + dy*ease(t)); if(t<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function smoothScrollTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    const navH = nav ? nav.offsetHeight : 0;
    const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH);
    fastScrollTo(y, 300);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !a.getAttribute('href') || !a.closest('.nav-menu')) return;
    e.preventDefault();
    smoothScrollTo(a.getAttribute('href'));
    if (!isDesktop()) closeMobileMenu();
  });

  let baseThreshold = 0, scrolledState = false;
  function computeThreshold() {
    const heroH = hero ? hero.offsetHeight : 0;
    const navH  = nav  ? nav.offsetHeight  : 0;
    baseThreshold = Math.max(heroH - navH, 0);
    root.style.setProperty('--nav-height', `${navH}px`);
  }
  function clearActive() { if (!menu) return; menu.querySelectorAll('a[aria-current="page"]').forEach(a => a.removeAttribute('aria-current')); }
  function onScroll() {
    const y = window.scrollY;
    const ENTER = baseThreshold + CFG.scrollEnterPad;
    const EXIT  = baseThreshold - CFG.scrollExitPad;
    if (!scrolledState && y >= ENTER) { body.classList.add('scrolled'); scrolledState = true; }
    else if (scrolledState && y <= EXIT) { body.classList.remove('scrolled'); scrolledState = false; }
    if (y < 2) clearActive();
    if (toTopBtn) { toTopBtn.hidden = !(y > baseThreshold + 100); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function openMobileMenu() { if (!menu) return; body.classList.add('menu-open'); menu.hidden = false; btn && btn.setAttribute('aria-expanded', 'true'); }
  function closeMobileMenu() { if (!menu) return; body.classList.remove('menu-open'); menu.hidden = true; btn && btn.setAttribute('aria-expanded', 'false'); }
  btn && btn.addEventListener('click', () => { if (isDesktop()) return; body.classList.contains('menu-open') ? closeMobileMenu() : openMobileMenu(); });
  document.addEventListener('click', (e) => { if (isDesktop()) return; if (!body.classList.contains('menu-open')) return; const inside = e.target.closest('.nav-inner'); if (!inside) closeMobileMenu(); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape' || isDesktop()) return; if (body.classList.contains('menu-open')) { closeMobileMenu(); btn && btn.focus(); } });

  const sectionEls = Array.from(document.querySelectorAll('.section'));
  const linkMap = new Map();
  if (menu) menu.querySelectorAll('a[href^="#"]').forEach(a => linkMap.set(a.getAttribute('href'), a));

  let io = null;
  function updateObserver() {
    if (io) io.disconnect();
    const navH = nav ? nav.offsetHeight : 0;
    io = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting);
      if (!vis.length) return;
      vis.sort((a,b)=> b.intersectionRatio - a.intersectionRatio);
      const best = vis[0];
      const id = '#' + best.target.id;
      if (id === '#home') { clearActive(); return; }
      clearActive();
      const active = linkMap.get(id);
      if (active) active.setAttribute('aria-current','page');
    }, { root: null, rootMargin: `-${navH}px 0px -40% 0px`, threshold: [0.15,0.35,0.55,0.75,0.9] });
    sectionEls.forEach(s => io.observe(s));
  }

  toTopBtn && toTopBtn.addEventListener('click', () => fastScrollTo(0, 350));
  let rAF = 0; let tId = 0;
  function onResize() {
    cancelAnimationFrame(rAF); clearTimeout(tId);
    tId = setTimeout(() => { rAF = requestAnimationFrame(() => { setStateForViewport(); computeThreshold(); setEqualButtonWidths(); updateObserver(); onScroll(); }); }, CFG.resizeDebounce);
  }
  function setStateForViewport() {
    if (!menu) return;
    if (isDesktop()) { closeMobileMenu(); menu.hidden = false; setEqualButtonWidths(); }
    else { menu.hidden = true; body.classList.remove('menu-open'); btn && btn.setAttribute('aria-expanded', 'false'); }
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    setStateForViewport(); computeThreshold(); setEqualButtonWidths(); updateObserver(); clearActive(); onScroll();
  });
  window.addEventListener('resize', onResize);
})();