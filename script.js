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
    cards.forEach((card, i) => card.classList.toggle("is-active", i === current));
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

  goTo(0);
  window.addEventListener("resize", () => goTo(current));
}

/* ======================================================
    MOBILE IN-VIEW SERVICE CARD MOTION
    ====================================================== */
const serviceCards = Array.from(document.querySelectorAll(".ingredients-grid .ing-card"));
if ("IntersectionObserver" in window && serviceCards.length > 0) {
  const serviceCardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
        } else {
          entry.target.classList.remove("is-inview");
        }
      });
    },
    {
      threshold: 0.55,
      rootMargin: "-4% 0px -8% 0px",
    }
  );

  serviceCards.forEach((card) => serviceCardObserver.observe(card));
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
  const status = document.getElementById("contactFormStatus");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      if (status) {
        status.textContent = "Please complete all fields before sending.";
      }
      return;
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (status) {
      status.textContent = "Sending your message...";
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submit request failed");
      }

      if (status) {
        status.textContent = "Thanks — your message has been sent.";
      }

      contactForm.reset();
    } catch (error) {
      if (status) {
        status.textContent =
          "Message couldn't be sent right now. Please email hello@nic-gibson.com.";
      }
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = "Send note →";
      }
    }
  });
}

