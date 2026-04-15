// products.js
(function(){
  'use strict';
  const grid = document.getElementById('product-grid');
  const carWrap = document.querySelector('.carousel-nav');
  const carPrev = document.querySelector('.car-prev');
  const carNext = document.querySelector('.car-next');
  if (!grid) return;

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
  function renderCarousel(){ grid.innerHTML = PRODUCTS.map(cardTemplate).join(''); grid.classList.add('is-carousel'); carWrap && (carWrap.hidden = false); bindCardEvents(); }
  function bindCardEvents(){
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-add, input, button, a, label, select, textarea')) return;
        const expanded = card.getAttribute('aria-expanded') === 'true';
        card.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
    grid.querySelectorAll('.btn-add').forEach(btn => btn.addEventListener('click', e => {
      const card = e.currentTarget.closest('.product-card');
      const id = card.dataset.id;
      const qty = Math.max(1, parseInt(card.querySelector('input[type="number"]').value || '1', 10));
      const product = PRODUCTS.find(x=>x.id===id);
      card.dispatchEvent(new CustomEvent('cart:add', { bubbles: true, detail: { id, qty, price: product.price, name: product.name } }));
      e.currentTarget.textContent = 'Añadido ✓'; setTimeout(()=>{ e.currentTarget.textContent = 'Añadir'; }, 900);
    }));
  }
  function page(dir){ const first = grid.querySelector('.product-card'); if (!first) return; const w = first.getBoundingClientRect().width + 16; grid.scrollBy({ left: dir * w, behavior: 'smooth' }); }
  carPrev && carPrev.addEventListener('click', ()=> page(-1));
  carNext && carNext.addEventListener('click', ()=> page(1));
  renderCarousel();
})();