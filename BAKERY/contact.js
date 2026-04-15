// contact.js
(function(){
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const ok = form.querySelector('.form-success');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.msg.value.trim();
    if (!name || !email || !msg) { form.reportValidity && form.reportValidity(); return; }
    ok.hidden = false;
    form.reset();
  });
})();