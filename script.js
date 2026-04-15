const cursor = document.getElementById("cursor");

if (cursor) {
  let hasMouse = false;

  window.addEventListener(
    "mousemove",
    () => {
      if (!hasMouse) {
        hasMouse = true;
        cursor.classList.add("visible");
        document.body.style.cursor = "none";
      }
    },
    { once: false }
  );

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  document
    .querySelectorAll("a, button, .project-card, .ing-card, .hero-pill")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("big"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("big"));
    });
}

/* ======================================================
     SLIDER
     ====================================================== */
const track = document.getElementById("sliderTrack");
const dotsWrap = document.getElementById("sliderDots");
if (track && dotsWrap) {
  const cards = Array.from(track.querySelectorAll(".project-card"));
  const total = cards.length;
  let current = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragCurrentX = 0;
  let baseOffset = 0;

  cards.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "slider-dot" + (i === 0 ? " active" : "");
    d.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function cardWidth() {
    return cards[0].getBoundingClientRect().width + 24;
  }

  function applyTranslate(px, animate) {
    track.style.transition = animate
      ? "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)"
      : "none";
    track.style.transform = `translateX(${px}px)`;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(total - 1, index));
    baseOffset = -(current * cardWidth());
    applyTranslate(baseOffset, true);
    dotsWrap
      .querySelectorAll(".slider-dot")
      .forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function onDragStart(e) {
    isDragging = true;
    dragStartX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
    dragCurrentX = dragStartX;
    track.classList.add("dragging");
    if (e.type === "mousedown") e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    dragCurrentX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const diff = dragCurrentX - dragStartX;
    applyTranslate(baseOffset + diff, false);
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("dragging");
    const diff = dragCurrentX - dragStartX;
    if (diff < -60) goTo(current + 1);
    else if (diff > 60) goTo(current - 1);
    else goTo(current);
  }

  track.addEventListener("mousedown", onDragStart);
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
  track.addEventListener("touchstart", onDragStart, { passive: true });
  track.addEventListener("touchmove", onDragMove, { passive: true });
  track.addEventListener("touchend", onDragEnd);

  track.addEventListener(
    "click",
    (e) => {
      if (Math.abs(dragCurrentX - dragStartX) > 5) e.preventDefault();
    },
    true
  );

  document
    .getElementById("nextBtn")
    ?.addEventListener("click", () => goTo(current + 1));
  document
    .getElementById("prevBtn")
    ?.addEventListener("click", () => goTo(current - 1));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  });

  window.addEventListener("resize", () => goTo(current));
}

/* ======================================================
     HERO FLAVOR SWITCHER
     ====================================================== */
const heroImg = document.getElementById("heroShakeImg");
const pills = document.querySelectorAll(".hero-pill");
let heroIdx = 0;
const heroImgs = Array.from(pills)
  .map((pill) => pill.dataset.heroImage)
  .filter(Boolean);

function switchFlavor(idx) {
  heroIdx = idx;

  const hasImagePool = heroImgs.length > 0;
  if (heroImg && hasImagePool) {
    heroImg.style.opacity = "0";
    setTimeout(() => {
      heroImg.src = heroImgs[heroIdx % heroImgs.length];
      heroImg.style.opacity = "1";
    }, 220);
  }

  pills.forEach((p, i) => p.classList.toggle("active", i === heroIdx));
}

if (heroImg) {
  heroImg.addEventListener("click", () => {
    const cycleLength = heroImgs.length || pills.length || 1;
    switchFlavor((heroIdx + 1) % cycleLength);
  });
}

pills.forEach((pill, i) => pill.addEventListener("click", () => switchFlavor(i)));

/* ======================================================
    CONTACT FORM
    ====================================================== */
const contactForm = document.getElementById("contactForm");
if (contactForm instanceof HTMLFormElement) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const status = document.getElementById("contactFormStatus");

    if (!name || !email || !message) {
      if (status) {
        status.textContent = "Please complete all fields before sending.";
      }
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nWhat can we build together?\n${message}`
    );

    if (status) {
      status.textContent = "Opening your email app...";
    }

    window.location.href = `mailto:hello@nicgibson.com?subject=${subject}&body=${body}`;
  });
}

