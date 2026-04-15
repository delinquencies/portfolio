// script.js
// ============================================================
// Dulce Lulú — Frontend interactions (cleaned & annotated)
// Modules:
//   0) Nav + smooth scroll + active link highlight
//   1) Productos carousel (flip-on-click, add-to-cart events)
//   2) Cart drawer + checkout modal (8.25% tax, badge, persistence)
//   3) Galería lightbox (uses #gallery-grid + .g-item)
//   4) Contact form handler
// Notes:
//   - Removed old/unused Galería module that targeted ".galeria-grid" (LEGACY).
//   - Kept function names/behavior intact to avoid regressions.
//   - Comments explain the *why*; structure stays the same.
// ============================================================

/* ============================================================
   0) NAV + SMOOTH SCROLL + ACTIVE LINK HIGHLIGHT
   Why: fixed nav with pills, smooth anchor scrolling, and
        IntersectionObserver-based active state. Also shows a
        back-to-top FAB and a mini logo after passing the hero.
   ============================================================ */
(function () {
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

  // Equal-width pills (desktop only) — measure widest and set CSS var
  function setEqualButtonWidths() {
    if (!menu || !isDesktop()) return;
    const items = Array.from(menu.querySelectorAll('li'));
    if (!items.length) return;

    // Temporarily reveal if hidden to measure accurately
    const cs = getComputedStyle(menu);
    const wasHidden = menu.hidden || cs.display === 'none' || cs.visibility === 'hidden';
    if (wasHidden) {
      menu.hidden = false;
      menu.style.visibility = 'hidden';
      menu.style.position = 'absolute';
      menu.style.left = '-99999px';
    }

    items.forEach(li => (li.style.width = 'auto'));
    const max = Math.max(...items.map(li => li.offsetWidth || 0));
    root.style.setProperty('--nav-btn-width', `${Math.ceil(max)}px`);

    if (wasHidden) {
      menu.hidden = true;
      menu.style.visibility = '';
      menu.style.position = '';
      menu.style.left = '';
    }
  }

  // Smooth scrolling tuned for short hops; respects reduced motion
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

  // Click in nav → smooth scroll; close mobile menu afterwards
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !a.getAttribute('href') || !a.closest('.nav-menu')) return;
    e.preventDefault();
    smoothScrollTo(a.getAttribute('href'));
    if (!isDesktop()) closeMobileMenu();
  });

  // Sync nav height (CSS var) + mini-logo threshold based on hero height
  let baseThreshold = 0, scrolledState = false;
  function computeThreshold() {
    const heroH = hero ? hero.offsetHeight : 0;
    const navH  = nav  ? nav.offsetHeight  : 0;
    baseThreshold = Math.max(heroH - navH, 0);
    root.style.setProperty('--nav-height', `${navH}px`);
  }

  // Clear stale aria-current from pills
  function clearActive() {
    if (!menu) return;
    menu.querySelectorAll('a[aria-current="page"]').forEach(a => a.removeAttribute('aria-current'));
  }

  // Scroll effects: toggle mini-logo, show FAB, clear active at the very top
  function onScroll() {
    const y = window.scrollY;
    const ENTER = baseThreshold + CFG.scrollEnterPad;
    const EXIT  = baseThreshold - CFG.scrollExitPad;
    if (!scrolledState && y >= ENTER) { body.classList.add('scrolled'); scrolledState = true; }
    else if (scrolledState && y <= EXIT) { body.classList.remove('scrolled'); scrolledState = false; }

    if (y < 2) clearActive();
    if (toTopBtn) toTopBtn.hidden = !(y > baseThreshold + 100);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu open/close (+ outside click + Escape)
  function openMobileMenu() {
    if (!menu) return;
    body.classList.add('menu-open');
    menu.hidden = false;
    btn && btn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    if (!menu) return;
    body.classList.remove('menu-open');
    menu.hidden = true;
    btn && btn.setAttribute('aria-expanded', 'false');
  }
  btn && btn.addEventListener('click', () => { if (isDesktop()) return; body.classList.contains('menu-open') ? closeMobileMenu() : openMobileMenu(); });
  document.addEventListener('click', (e) => { if (isDesktop()) return; if (!body.classList.contains('menu-open')) return; const inside = e.target.closest('.nav-inner'); if (!inside) closeMobileMenu(); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape' || isDesktop()) return; if (body.classList.contains('menu-open')) { closeMobileMenu(); btn && btn.focus(); } });

  // Active section highlighting using IO; compensates for fixed nav height
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
    }, {
      root: null,
      rootMargin: `-${navH}px 0px -40% 0px`, // bias to viewport below the fixed nav
      threshold: [0.15, 0.35, 0.55, 0.75, 0.9]
    });

    sectionEls.forEach(s => io.observe(s));
  }

  // Back-to-top FAB
  toTopBtn && toTopBtn.addEventListener('click', () => fastScrollTo(0, 350));

  // Ensure correct state across breakpoints
  function setStateForViewport() {
    if (!menu) return;
    if (isDesktop()) {
      closeMobileMenu();
      menu.hidden = false;
      setEqualButtonWidths();
    } else {
      menu.hidden = true;
      body.classList.remove('menu-open');
      btn && btn.setAttribute('aria-expanded', 'false');
    }
  }

  // Debounced resize: recompute nav height + re-init observer
  let rAF = 0; let tId = 0;
  function onResize() {
    cancelAnimationFrame(rAF);
    clearTimeout(tId);
    tId = setTimeout(() => {
      rAF = requestAnimationFrame(() => {
        setStateForViewport();
        computeThreshold();
        setEqualButtonWidths();
        updateObserver();
        onScroll();
      });
    }, CFG.resizeDebounce);
  }

  // Init
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    setStateForViewport();
    computeThreshold();
    setEqualButtonWidths();
    updateObserver();
    clearActive(); // ensure no highlight at top
    onScroll();
  });
  window.addEventListener('resize', onResize);
})();

/* ============================================================
   1) PRODUCTOS — Standard carousel + flip-on-click
   Why: single-row horizontal snap; card flips reveal details
        and quantity controls without changing the grid height.
   Emits: CustomEvent('cart:add', {id, qty, price, name})
   ============================================================ */
(function(){
  const grid = document.getElementById('product-grid');
  const carWrap = document.querySelector('.carousel-nav');
  const carPrev = document.querySelector('.car-prev');
  const carNext = document.querySelector('.car-next');
  if (!grid) return;

  // NOTE: replace with API later; keep client data minimal to avoid price drift
  const PRODUCTS = [
    { id:'tresleches', name:'Tres Leches', price:8.5, img:'prod_tresleches.jpg', desc:'Bizcocho suave empapado en tres leches.', nutrition:{ kcal:320, sugar:'24g', allergens:'Leche, Huevo, Gluten' } },
    { id:'quesillito', name:'Quesillo', price:6.0, img:'prod_quesillo.jpg', desc:'Flan venezolano cremoso con caramelo.', nutrition:{ kcal:280, sugar:'22g', allergens:'Leche, Huevo' } },
    { id:'cachitos', name:'Cachitos Dulces', price:4.0, img:'prod_cachitos.jpg', desc:'Masa suave rellena de dulce.', nutrition:{ kcal:210, sugar:'12g', allergens:'Gluten' } },
    { id:'golfeados', name:'Golfeados', price:5.5, img:'prod_golfeado.jpg', desc:'Espirales dulces con queso.', nutrition:{ kcal:330, sugar:'26g', allergens:'Gluten, Leche' } },
    { id:'polvorosas', name:'Polvorosas', price:3.0, img:'prod_polvorosas.jpg', desc:'Galletas tradicionales que se deshacen.', nutrition:{ kcal:150, sugar:'8g', allergens:'Gluten' } },
    { id:'torta_zanahoria', name:'Torta de Zanahoria', price:7.0, img:'prod_carrot.jpg', desc:'Esponjosa con frosting suave.', nutrition:{ kcal:290, sugar:'21g', allergens:'Gluten, Leche' } },
  ];

  function fmtPrice(v){ return v.toLocaleString('es-VE', { style:'currency', currency:'USD', minimumFractionDigits:2 }); }

  function cardTemplate(p){
    const n=p.nutrition; const price=fmtPrice(p.price);
    return `
    <article class="product-card" data-id="${p.id}" aria-expanded="false">
      <div class="product-card-inner">
        <div class="pc-face pc-front">
          <div class="pc-media">
            <img src="${p.img}" alt="${p.name}" loading="lazy" />
            <div class="pc-nutrition" aria-label="Información nutricional breve">
              <span>${n.kcal} kcal</span>
              <span>${n.sugar} azúcar</span>
            </div>
          </div>
          <div class="pc-body">
            <h3 class="pc-title">${p.name}</h3>
            <div class="pc-price">${price}</div>
          </div>
        </div>
        <div class="pc-face pc-back">
          <div class="pc-content">
            <p class="pc-desc">${p.desc}</p>
            <table class="pc-table" aria-label="Tabla nutricional">
              <tbody>
                <tr><th>Calorías</th><td>${n.kcal}</td></tr>
                <tr><th>Azúcar</th><td>${n.sugar}</td></tr>
                <tr><th>Alérgenos</th><td>${n.allergens}</td></tr>
              </tbody>
            </table>
            <div class="pc-qty">
              <label for="qty-${p.id}">Cant.</label>
              <input id="qty-${p.id}" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad para ${p.name}">
              <button class="btn-add" type="button">Añadir</button>
            </div>
          </div>
        </div>
      </div>
    </article>`;
  }

  function renderCarousel(){
    grid.innerHTML = PRODUCTS.map(cardTemplate).join('');
    grid.classList.add('is-carousel');     // enable horizontal snapping
    carWrap && (carWrap.hidden = false);   // show prev/next
    bindCardEvents();
  }

  function bindCardEvents(){
    // Flip card on click; ignore clicks on interactive controls inside
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-add, input, button, a, label, select, textarea')) return;
        const expanded = card.getAttribute('aria-expanded') === 'true';
        card.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });

    // Add to cart → emit event consumed by the cart module
    grid.querySelectorAll('.btn-add').forEach(btn => btn.addEventListener('click', e => {
      const card = e.currentTarget.closest('.product-card');
      const id = card.dataset.id;
      const qty = Math.max(1, parseInt(card.querySelector('input[type="number"]').value || '1', 10));
      const product = PRODUCTS.find(x=>x.id===id);
      card.dispatchEvent(new CustomEvent('cart:add', {
        bubbles: true,
        detail: { id, qty, price: product.price, name: product.name }
      }));
      e.currentTarget.textContent = 'Añadido ✓';
      setTimeout(()=>{ e.currentTarget.textContent = 'Añadir'; }, 900);
    }));
  }

  // Carousel paging buttons (scroll by one card width)
  function page(dir){
    const first = grid.querySelector('.product-card');
    if (!first) return;
    const w = first.getBoundingClientRect().width + 16;
    grid.scrollBy({ left: dir * w, behavior: 'smooth' });
  }
  carPrev && carPrev.addEventListener('click', ()=> page(-1));
  carNext && carNext.addEventListener('click', ()=> page(1));

  renderCarousel();
})();

/* ============================================================
   2) CART DRAWER + CHECKOUT MODAL
   Why: listen for 'cart:add' events; persist to localStorage;
        compute 8.25% tax; show totals; open drawer on add;
        modal is a placeholder for Stripe later; badge on FAB.
   ============================================================ */
(function(){
  const TAX = 0.0825; // 8.25%
  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-overlay');
  const openFab = document.querySelector('.cart-fab');
  const closeBtn = document.querySelector('.cart-close');
  const itemsEl = document.querySelector('.cart-items');
  const subEl = document.querySelector('.c-subtotal');
  const taxEl = document.querySelector('.c-tax');
  const totalEl = document.querySelector('.c-total');
  const checkoutBtn = document.querySelector('.btn-checkout');

  const modal = document.querySelector('.modal');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalCloses = document.querySelectorAll('.modal-close');

  if (!drawer) return;

  const STORAGE_KEY = 'dulcelulu.cart.v1';
  const cart = new Map(); // id -> { id, name, price, qty, img }

  // ----- FAB badge (created lazily so no extra CSS needed) -----
  function ensureBadge(){
    if (!openFab) return null;
    let b = openFab.querySelector('.cart-badge');
    if (!b){
      b = document.createElement('span');
      b.className = 'cart-badge';
      // Minimal inline styles: portable and independent from stylesheet
      b.setAttribute('style', [
        'position:absolute','top:-6px','right:-6px','min-width:20px','height:20px','padding:0 6px',
        'border-radius:999px','background:#A76B42','color:#fff','font:600 12px/20px Quicksand, sans-serif',
        'text-align:center','box-shadow:0 2px 6px rgba(0,0,0,.2)'
      ].join(';'));
      // Ensure FAB can anchor the badge
      const s = getComputedStyle(openFab);
      if (s.position === 'static') openFab.style.position = 'fixed';
      openFab.style.position = openFab.style.position || 'fixed';
      openFab.appendChild(b);
    }
    return b;
  }
  function totalQty(){ let q=0; cart.forEach(it=> q+=it.qty); return q; }
  function updateBadge(){
    const b = ensureBadge();
    if (!b) return;
    const q = totalQty();
    b.textContent = q > 99 ? '99+' : String(q || '');
    b.style.display = q ? 'inline-block' : 'none';
    if (openFab) openFab.setAttribute('aria-label', q ? `Carrito (${q})` : 'Abrir carrito');
  }

  // ----- Persistence -----
  function save(){
    try {
      const data = Array.from(cart.values()).map(it => ({ id: it.id, name: it.name, price: it.price, qty: it.qty, img: it.img }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(_){}
  }
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      arr.forEach(it => {
        const id = String(it.id || '');
        const name = String(it.name || '');
        const price = Number(it.price) || 0;
        const qty = Math.max(1, Number(it.qty) || 1);
        const img = it.img || '';
        if (!id) return;
        cart.set(id, { id, name, price, qty, img });
      });
    } catch(_){}
  }

  // ----- Drawer open/close -----
  function fmt(v){ return v.toLocaleString('es-VE', { style:'currency', currency:'USD', minimumFractionDigits:2 }); }
  function open(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); overlay.hidden = false; document.body.style.overflow = 'hidden'; }
  function close(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden = true; document.body.style.overflow = ''; }

  // ----- Cart operations -----
  function add({id, name, price, qty, img}){
    const cur = cart.get(id) || { id, name, price, qty: 0, img };
    cur.qty += qty;
    cart.set(id, cur);
    render();  // recalc + DOM update + persist + badge
    open();    // UX: open the drawer on add
  }
  function remove(id){ cart.delete(id); render(); }
  function setQty(id, qty){ const it = cart.get(id); if (!it) return; it.qty = Math.max(1, qty|0); render(); }

  // Totals with 8.25% tax
  function totals(){
    let subtotal = 0; cart.forEach(it => { subtotal += it.price * it.qty; });
    const tax = +(subtotal * TAX).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    return { subtotal, tax, total };
  }

  // Render cart list + totals; rebinding is cheap at our scale
  function rowTemplate(it){
    return `
      <div class="cart-item" data-id="${it.id}">
        <img src="${it.img || 'placeholder.jpg'}" alt="${it.name}">
        <div>
          <p class="ci-title">${it.name}</p>
          <p class="ci-price">${fmt(it.price)} × ${it.qty}</p>
          <div class="ci-qty">
            <label class="sr-only" for="cqty-${it.id}">Cantidad</label>
            <input id="cqty-${it.id}" type="number" min="1" value="${it.qty}">
          </div>
        </div>
        <div>
          <button class="ci-remove" aria-label="Quitar">✕</button>
          <div class="ci-line">${fmt(it.price * it.qty)}</div>
        </div>
      </div>`;
  }
  function render(){
    if (itemsEl) {
      itemsEl.innerHTML = Array.from(cart.values()).map(rowTemplate).join('') || '<p>Tu carrito está vacío.</p>';
      bindRowEvents();
    }
    const t = totals();
    if (subEl) subEl.textContent = fmt(t.subtotal);
    if (taxEl) taxEl.textContent = fmt(t.tax);
    if (totalEl) totalEl.textContent = fmt(t.total);
    updateBadge();
    save();
  }
  function bindRowEvents(){
    itemsEl.querySelectorAll('.ci-remove').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.closest('.cart-item').dataset.id; remove(id);
    }));
    itemsEl.querySelectorAll('input[type="number"]').forEach(inp => inp.addEventListener('input', e => {
      const wrap = e.currentTarget.closest('.cart-item');
      setQty(wrap.dataset.id, parseInt(e.currentTarget.value || '1', 10));
    }));
  }

  // Listen to product add events from Productos module
  document.addEventListener('cart:add', (e) => {
    const { id, qty, price, name } = e.detail;
    const imgEl = document.querySelector(`.product-card[data-id="${id}"] img`);
    const img = imgEl ? imgEl.getAttribute('src') : '';
    add({ id, name, price, qty, img });
  });

  // Drawer controls
  openFab && openFab.addEventListener('click', open);
  overlay && overlay.addEventListener('click', close);
  closeBtn && closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });

  // Checkout modal (placeholder for Stripe)
  function openModal(){ if (!modal || !modalOverlay) return; modalOverlay.hidden = false; modal.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(){ if (!modal || !modalOverlay) return; modalOverlay.hidden = true; modal.hidden = true; document.body.style.overflow = ''; }
  if (modal) modal.hidden = true; if (modalOverlay) modalOverlay.hidden = true; // defensive: closed on load
  checkoutBtn && checkoutBtn.addEventListener('click', openModal);
  modalOverlay && modalOverlay.addEventListener('click', closeModal);
  modalCloses.forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && modal && !modal.hidden) { e.preventDefault(); closeModal(); } });

  // Boot: restore cart → render (drawer stays closed)
  load();
  render();
})();

/* ============================================================
   3) GALERÍA — Lightbox for #gallery-grid
   Why: open full image in overlay; close on overlay/✕/Esc;
        prev/next arrows; basic swipe; tiny tap/hover micro-scale.
   Markup: #gallery-grid contains <a.g-item data-full><img/></a>
           .glb-overlay + .glb-viewer exist in HTML.
   ============================================================ */
(function(){
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const overlay = document.querySelector('.glb-overlay');
  const viewer  = document.querySelector('.glb-viewer');
  const imgEl   = document.querySelector('.glb-img');
  const btnClose= document.querySelector('.glb-close');
  const btnPrev = document.querySelector('.glb-prev');
  const btnNext = document.querySelector('.glb-next');

  const items = Array.from(grid.querySelectorAll('.g-item'));
  let index = -1;

  function open(i){
    index = i;
    const a = items[index];
    if (!a) return;
    imgEl.src = a.dataset.full || a.querySelector('img').src;
    overlay.hidden = false;
    viewer.hidden  = false;
    document.body.style.overflow='hidden';
  }
  function close(){
    overlay.hidden = true;
    viewer.hidden  = true;
    document.body.style.overflow='';
    index = -1;
  }
  function prev(){ if (index<0) return; open((index - 1 + items.length)%items.length); }
  function next(){ if (index<0) return; open((index + 1)%items.length); }

  // Tap/hover micro‑scale feedback on tiles
  grid.addEventListener('pointerdown', (e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.add('tap'); });
  grid.addEventListener('pointerup',   (e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.remove('tap'); });
  grid.addEventListener('pointercancel',(e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.remove('tap'); });

  // Open lightbox on click
  grid.addEventListener('click', (e)=>{
    const a = e.target.closest('.g-item');
    if (!a) return;
    e.preventDefault();
    open(items.indexOf(a));
  });

  // Controls + overlay click
  overlay && overlay.addEventListener('click', close);
  btnClose && btnClose.addEventListener('click', close);
  btnPrev && btnPrev.addEventListener('click', prev);
  btnNext && btnNext.addEventListener('click', next);

  // Keyboard arrows + Esc
  document.addEventListener('keydown', (e)=>{
    if (viewer.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft')  prev();
    else if (e.key === 'ArrowRight') next();
  });

  // Simple swipe on mobile
  let sx=0, sy=0;
  viewer.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; }, {passive:true});
  viewer.addEventListener('touchend', (e)=>{ const t=e.changedTouches[0]; const dx=t.clientX - sx; const dy=t.clientY - sy; if (Math.abs(dx)>50 && Math.abs(dy)<40){ dx>0 ? prev() : next(); } }, {passive:true});
})();

/* ============================================================
   4) CONTACT FORM — client-side submit stub
   Why: dev-friendly UX while backend/email isn’t ready.
   ============================================================ */
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;
  const ok = form.querySelector('.form-success');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Minimal validation before showing the success UI
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.msg.value.trim();
    if (!name || !email || !msg) {
      form.reportValidity && form.reportValidity();
      return;
    }
    ok.hidden = false;
    form.reset();
  });
})();
