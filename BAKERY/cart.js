// cart.js
(function(){
  'use strict';
  const TAX = 0.0825;
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
  const cart = new Map();

  function ensureBadge(){
    if (!openFab) return null;
    let b = openFab.querySelector('.cart-badge');
    if (!b){
      b = document.createElement('span'); b.className = 'cart-badge';
      b.setAttribute('style', ['position:absolute','top:-6px','right:-6px','min-width:20px','height:20px','padding:0 6px','border-radius:999px','background:#A76B42','color:#fff','font:600 12px/20px Quicksand, sans-serif','text-align:center','box-shadow:0 2px 6px rgba(0,0,0,.2)'].join(';'));
      const s = getComputedStyle(openFab); if (s.position === 'static') openFab.style.position = 'fixed'; openFab.style.position = openFab.style.position || 'fixed';
      openFab.appendChild(b);
    }
    return b;
  }
  function totalQty(){ let q=0; cart.forEach(it=> q+=it.qty); return q; }
  function updateBadge(){ const b = ensureBadge(); if (!b) return; const q = totalQty(); b.textContent = q > 99 ? '99+' : String(q || ''); b.style.display = q ? 'inline-block' : 'none'; if (openFab) openFab.setAttribute('aria-label', q ? `Carrito (${q})` : 'Abrir carrito'); }

  function save(){ try { const data = Array.from(cart.values()).map(it => ({ id: it.id, name: it.name, price: it.price, qty: it.qty, img: it.img })); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(_){} }
  function load(){ try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; const arr = JSON.parse(raw); if (!Array.isArray(arr)) return; arr.forEach(it => { const id = String(it.id || ''); const name = String(it.name || ''); const price = Number(it.price) || 0; const qty = Math.max(1, Number(it.qty) || 1); const img = it.img || ''; if (!id) return; cart.set(id, { id, name, price, qty, img }); }); } catch(_){} }

  function fmt(v){ return v.toLocaleString('es-VE', { style:'currency', currency:'USD', minimumFractionDigits:2 }); }
  function open(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); overlay.hidden = false; document.body.style.overflow = 'hidden'; }
  function close(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden = true; document.body.style.overflow = ''; }

  function add({id, name, price, qty, img}){ const cur = cart.get(id) || { id, name, price, qty: 0, img }; cur.qty += qty; cart.set(id, cur); render(); open(); }
  function remove(id){ cart.delete(id); render(); }
  function setQty(id, qty){ const it = cart.get(id); if (!it) return; it.qty = Math.max(1, qty|0); render(); }

  function totals(){ let subtotal = 0; cart.forEach(it => { subtotal += it.price * it.qty; }); const tax = +(subtotal * TAX).toFixed(2); const total = +(subtotal + tax).toFixed(2); return { subtotal, tax, total }; }
  function rowTemplate(it){ return `
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
      </div>`; }

  function render(){ if (itemsEl) { itemsEl.innerHTML = Array.from(cart.values()).map(rowTemplate).join('') || '<p>Tu carrito está vacío.</p>'; bindRowEvents(); } const t = totals(); if (subEl) subEl.textContent = fmt(t.subtotal); if (taxEl) taxEl.textContent = fmt(t.tax); if (totalEl) totalEl.textContent = fmt(t.total); updateBadge(); save(); }
  function bindRowEvents(){ itemsEl.querySelectorAll('.ci-remove').forEach(btn => btn.addEventListener('click', e => { const id = e.currentTarget.closest('.cart-item').dataset.id; remove(id); })); itemsEl.querySelectorAll('input[type="number"]').forEach(inp => inp.addEventListener('input', e => { const wrap = e.currentTarget.closest('.cart-item'); setQty(wrap.dataset.id, parseInt(e.currentTarget.value || '1', 10)); })); }

  document.addEventListener('cart:add', (e) => { const { id, qty, price, name } = e.detail; const imgEl = document.querySelector(`.product-card[data-id="${id}"] img`); const img = imgEl ? imgEl.getAttribute('src') : ''; add({ id, name, price, qty, img }); });

  openFab && openFab.addEventListener('click', open);
  overlay && overlay.addEventListener('click', close);
  closeBtn && closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });

  function openModal(){ if (!modal || !modalOverlay) return; modalOverlay.hidden = false; modal.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(){ if (!modal || !modalOverlay) return; modalOverlay.hidden = true; modal.hidden = true; document.body.style.overflow = ''; }
  if (modal) modal.hidden = true; if (modalOverlay) modalOverlay.hidden = true;
  checkoutBtn && checkoutBtn.addEventListener('click', openModal);
  modalOverlay && modalOverlay.addEventListener('click', closeModal);
  modalCloses.forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && modal && !modal.hidden) { e.preventDefault(); closeModal(); } });

  load();
  render();
})();