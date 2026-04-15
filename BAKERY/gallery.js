// gallery.js
(function(){
  'use strict';
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

  function open(i){ index = i; const a = items[index]; if (!a) return; imgEl.src = a.dataset.full || a.querySelector('img').src; overlay.hidden = false; viewer.hidden = false; document.body.style.overflow='hidden'; }
  function close(){ overlay.hidden = true; viewer.hidden = true; document.body.style.overflow=''; index=-1; }
  function prev(){ if (index<0) return; open((index - 1 + items.length)%items.length); }
  function next(){ if (index<0) return; open((index + 1)%items.length); }

  grid.addEventListener('pointerdown', (e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.add('tap'); });
  grid.addEventListener('pointerup',   (e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.remove('tap'); });
  grid.addEventListener('pointercancel',(e)=>{ const a = e.target.closest('.g-item'); if(!a) return; a.classList.remove('tap'); });
  grid.addEventListener('click', (e)=>{ const a = e.target.closest('.g-item'); if (!a) return; e.preventDefault(); const i = items.indexOf(a); open(i); });

  overlay && overlay.addEventListener('click', close);
  btnClose && btnClose.addEventListener('click', close);
  btnPrev && btnPrev.addEventListener('click', prev);
  btnNext && btnNext.addEventListener('click', next);

  document.addEventListener('keydown', (e)=>{ if (viewer.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') prev(); else if (e.key === 'ArrowRight') next(); });

  let sx=0, sy=0;
  viewer.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; }, {passive:true});
  viewer.addEventListener('touchend', (e)=>{ const t=e.changedTouches[0]; const dx=t.clientX - sx; const dy=t.clientY - sy; if (Math.abs(dx)>50 && Math.abs(dy)<40){ dx>0 ? prev() : next(); } }, {passive:true});
})();