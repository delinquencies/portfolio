const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const langToggle = document.querySelector(".lang-toggle");
const root = document.documentElement;

const translations = {
  en: {
    brand: "JOSE THE PLUMBER",
    tagline: "Reliable Plumbing. Honest Work.",
    navServices: "Services",
    navWhy: "Why Jose",
    navAbout: "About",
    navReviews: "Reviews",
    navContact: "Contact",
    callNow: "Call Now",
    langLabel: "ESPAÑOL",

    eyebrow: "FAST • RELIABLE • BILINGUAL",
    heroTitle: "CALL JOSE, THE PLUMBER",
    heroSub:
      "Fast, dependable plumbing service for homes and small businesses. Se habla español.",
    requestService: "Request Service",
    trust1: "Bilingual Service",
    trust2: "Residential & Commercial",
    trust3: "Fast Response",
    trust4: "Honest Work",

    quick1Title: "Need help fast?",
    quick1Text: "Call now for quick plumbing service.",
    quick2Title: "Se habla español",
    quick2Text: "Clear communication from start to finish.",
    quick3Title: "Local service",
    quick3Text: "Helping nearby homes and businesses.",

    servicesEyebrow: "WHAT WE DO",
    servicesTitle: "Plumbing Services",
    servicesIntro:
      "From everyday repairs to bigger installs, Jose handles the jobs that keep your place running right.",

    service1Title: "Leak Repair",
    service1Text:
      "Fast diagnosis and repair for leaks under sinks, around fixtures, and in exposed plumbing lines.",
    service2Title: "Drain Cleaning",
    service2Text:
      "Help with slow or clogged drains in kitchens, bathrooms, and utility spaces.",
    service3Title: "Water Heater Service",
    service3Text:
      "Repair and replacement help for standard and tankless water heaters.",
    service4Title: "Toilet & Faucet Repair",
    service4Text:
      "Fixes for running toilets, dripping faucets, bad seals, and worn fixtures.",
    service5Title: "Pipe Repair",
    service5Text:
      "Practical pipe repair solutions for damaged, aging, or leaking plumbing lines.",
    service6Title: "Fixture Installation",
    service6Text:
      "Installation help for sinks, faucets, toilets, and other everyday plumbing fixtures.",

    whyEyebrow: "WHY CHOOSE JOSE?",
    whyTitle: "Dependable Service Without the Runaround",
    whyIntro:
      "Jose focuses on clear communication, responsive service, and quality work that solves the problem the right way.",
    why1Title: "Bilingual Service",
    why1Text: "Clear communication in English and Spanish.",
    why2Title: "Fast Response",
    why2Text: "Quick help when plumbing problems cannot wait.",
    why3Title: "Honest Work",
    why3Text: "Straightforward service with practical solutions.",
    why4Title: "Local & Trusted",
    why4Text: "Friendly service built around community and trust.",

    aboutEyebrow: "MEET JOSE",
    aboutBadge: "BILINGUAL SERVICE",
    aboutTitle: "A Local Plumber Focused on Quality Work",
    aboutText1:
      "Jose the Plumber provides dependable plumbing service with a focus on responsive help, honest work, and real solutions for everyday problems.",
    aboutText2:
      "Whether it is a small repair, a fixture install, or a plumbing issue that cannot wait, the goal stays the same: fix it right and treat people well.",

    reviewsEyebrow: "CUSTOMER FEEDBACK",
    reviewsTitle: "What Customers Say",
    reviewsIntro:
      "Placeholder reviews for now. Swap these with real Google reviews later.",
    review1Text:
      "“Quick, professional, and easy to work with. Jose got our issue fixed fast.”",
    review1Name: "Maria R.",
    review2Text:
      "“Showed up on time, explained everything clearly, and the price was fair.”",
    review2Name: "Daniel T.",
    review3Text:
      "“Very respectful and did great work. We will call him again.”",
    review3Name: "Ana G.",

    areasEyebrow: "SERVICE AREA",
    areasTitle: "Proudly Serving Local Homes & Businesses",
    areasIntro: "Replace these cities later with Jose’s real service area.",

    contactEyebrow: "REQUEST SERVICE",
    contactTitle: "Need Plumbing Help?",
    contactIntro:
      "Call Jose directly or send a message below and we will get back to you.",
    contactPhoneLabel: "Call",
    contactEmailLabel: "Email",
    contactHoursLabel: "Hours",
    contactHoursText: "Mon-Sat, 7:00 AM - 6:00 PM",

    formName: "Name",
    formPhone: "Phone",
    formEmail: "Email",
    formAddress: "Service Address",
    formService: "Type of Service",
    formSelect: "Select one",
    formMessage: "Message",
    sendRequest: "Send Request",

    mapEyebrow: "LOCATION",
    mapTitle: "Serving the Greater Houston Area",

    footerTag: "Reliable Plumbing. Honest Work."
  },

  es: {
    brand: "JOSE EL PLOMERO",
    tagline: "Plomería confiable. Trabajo honesto.",
    navServices: "Servicios",
    navWhy: "Por qué Jose",
    navAbout: "Acerca de",
    navReviews: "Reseñas",
    navContact: "Contacto",
    callNow: "Llamar Ahora",
    langLabel: "ENGLISH",

    eyebrow: "RÁPIDO • CONFIABLE • BILINGÜE",
    heroTitle: "LLAMA A JOSE, EL PLOMERO",
    heroSub:
      "Servicio de plomería rápido y confiable para casas y pequeños negocios. Se habla español.",
    requestService: "Solicitar Servicio",
    trust1: "Servicio Bilingüe",
    trust2: "Residencial y Comercial",
    trust3: "Respuesta Rápida",
    trust4: "Trabajo Honesto",

    quick1Title: "¿Necesitas ayuda ya?",
    quick1Text: "Llama ahora para servicio rápido.",
    quick2Title: "Se habla español",
    quick2Text: "Comunicación clara de principio a fin.",
    quick3Title: "Servicio local",
    quick3Text: "Ayudando a hogares y negocios cercanos.",

    servicesEyebrow: "LO QUE HACEMOS",
    servicesTitle: "Servicios de Plomería",
    servicesIntro:
      "Desde reparaciones comunes hasta instalaciones más grandes, Jose resuelve los trabajos que mantienen tu lugar funcionando bien.",

    service1Title: "Reparación de Fugas",
    service1Text:
      "Diagnóstico y reparación rápida de fugas debajo de lavabos, alrededor de accesorios y en líneas expuestas.",
    service2Title: "Limpieza de Drenajes",
    service2Text:
      "Ayuda con drenajes lentos o tapados en cocinas, baños y áreas de lavado.",
    service3Title: "Servicio de Calentador",
    service3Text:
      "Ayuda con reparación y reemplazo de calentadores estándar y sin tanque.",
    service4Title: "Reparación de Inodoros y Llaves",
    service4Text:
      "Soluciones para inodoros que corren, llaves goteando, sellos dañados y accesorios desgastados.",
    service5Title: "Reparación de Tuberías",
    service5Text:
      "Soluciones prácticas para tuberías dañadas, viejas o con fugas.",
    service6Title: "Instalación de Accesorios",
    service6Text:
      "Instalación de lavabos, llaves, inodoros y otros accesorios de plomería.",

    whyEyebrow: "¿POR QUÉ ELEGIR A JOSE?",
    whyTitle: "Servicio Confiable Sin Complicaciones",
    whyIntro:
      "Jose se enfoca en comunicación clara, servicio rápido y trabajo de calidad para resolver el problema correctamente.",
    why1Title: "Servicio Bilingüe",
    why1Text: "Comunicación clara en inglés y español.",
    why2Title: "Respuesta Rápida",
    why2Text: "Ayuda rápida cuando el problema no puede esperar.",
    why3Title: "Trabajo Honesto",
    why3Text: "Servicio directo con soluciones prácticas.",
    why4Title: "Local y de Confianza",
    why4Text: "Servicio amable basado en comunidad y confianza.",

    aboutEyebrow: "CONOCE A JOSE",
    aboutBadge: "SERVICIO BILINGÜE",
    aboutTitle: "Un Plomero Local Enfocado en la Calidad",
    aboutText1:
      "Jose el Plomero ofrece servicio confiable con atención rápida, trabajo honesto y soluciones reales para problemas de todos los días.",
    aboutText2:
      "Ya sea una reparación pequeña, una instalación o un problema urgente, la meta es la misma: arreglarlo bien y tratar bien a la gente.",

    reviewsEyebrow: "OPINIONES DE CLIENTES",
    reviewsTitle: "Lo Que Dicen los Clientes",
    reviewsIntro:
      "Reseñas de muestra por ahora. Después puedes poner reseñas reales de Google.",
    review1Text:
      "“Rápido, profesional y fácil de tratar. Jose arregló nuestro problema muy rápido.”",
    review1Name: "Maria R.",
    review2Text:
      "“Llegó a tiempo, explicó todo claramente y el precio fue justo.”",
    review2Name: "Daniel T.",
    review3Text:
      "“Muy respetuoso e hizo un gran trabajo. Lo volveremos a llamar.”",
    review3Name: "Ana G.",

    areasEyebrow: "ÁREA DE SERVICIO",
    areasTitle: "Sirviendo con Orgullo a Hogares y Negocios Locales",
    areasIntro: "Reemplaza estas ciudades después con el área real de Jose.",

    contactEyebrow: "SOLICITAR SERVICIO",
    contactTitle: "¿Necesitas Ayuda de Plomería?",
    contactIntro:
      "Llama a Jose directamente o manda un mensaje aquí abajo y te responderemos pronto.",
    contactPhoneLabel: "Llamar",
    contactEmailLabel: "Correo",
    contactHoursLabel: "Horario",
    contactHoursText: "Lun-Sáb, 7:00 AM - 6:00 PM",

    formName: "Nombre",
    formPhone: "Teléfono",
    formEmail: "Correo",
    formAddress: "Dirección de Servicio",
    formService: "Tipo de Servicio",
    formSelect: "Selecciona uno",
    formMessage: "Mensaje",
    sendRequest: "Enviar Solicitud",

    mapEyebrow: "UBICACIÓN",
    mapTitle: "Sirviendo el Área Metropolitana de Houston",

    footerTag: "Plomería confiable. Trabajo honesto."
  }
};

function setLanguage(lang) {
  root.setAttribute("data-lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  localStorage.setItem("joseSiteLang", lang);
}

const savedLang = localStorage.getItem("joseSiteLang") || "en";
setLanguage(savedLang);

langToggle?.addEventListener("click", () => {
  const currentLang = root.getAttribute("data-lang") || "en";
  const nextLang = currentLang === "en" ? "es" : "en";
  setLanguage(nextLang);
});

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll('.site-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});