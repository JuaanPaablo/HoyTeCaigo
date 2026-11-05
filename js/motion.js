/* Hoy te Caigo · movimiento al hacer scroll y al interactuar. Se carga al final (después de app.js).
   Si el visitante pidió reducir movimiento, o el navegador no soporta IntersectionObserver, no hace nada
   y todo el contenido queda visible tal cual. Los estilos están en css/motion.css. */
(function () {
  "use strict";
  if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var vh = window.innerHeight || 800;

  /* ---------- Aparición al hacer scroll ---------- */
  if ("IntersectionObserver" in window) {
    var items = [];
    var add = function (sel, variant) {
      $$(sel).forEach(function (el, i) { items.push({ el: el, i: i, v: variant }); });
    };
    add(".sec-head");
    add(".next__in", "slap");
    add("#events .card");
    add(".cov__text > .eyebrow");
    add(".cov__text > .h2-big");
    add(".cov__text > .plan__intro");
    add(".legend li");
    add(".map", "slap");
    add(".plan .eyebrow");
    add(".plan .h2-big");
    add(".plan__intro");
    add(".steps li");
    add(".plan__panel", "slap");
    add("#feed .clip");
    add(".lead", "slap");
    add(".band", "slap");
    add(".foot > div");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add("in");
        /* Al terminar se quitan las clases: así el hover y el resto del CSS vuelven a mandar */
        setTimeout(function () { el.classList.remove("rv", "in"); el.removeAttribute("data-rv"); el.style.removeProperty("--d"); }, 1800);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    /* Red de seguridad: al imprimir, o si pasan 20 s sin que algo se haya revelado, todo se muestra tal cual */
    var revealAll = function () {
      $$(".rv").forEach(function (el) { io.unobserve(el); el.classList.remove("rv", "in"); el.removeAttribute("data-rv"); el.style.removeProperty("--d"); });
    };
    window.addEventListener("beforeprint", revealAll);
    setTimeout(revealAll, 20000);

    items.forEach(function (it) {
      var el = it.el;
      if (el.hidden || el.closest("[hidden]")) return;
      if (el.getBoundingClientRect().top < vh * 0.92) return;      // lo que ya se ve al cargar no se esconde
      el.style.setProperty("--d", (Math.min(it.i % 6, 5) * 0.08).toFixed(2) + "s");   // escalonado corto
      if (it.v) el.setAttribute("data-rv", it.v);
      el.classList.add("rv");
      io.observe(el);
    });
  }

  /* ---------- Al filtrar el portafolio, las tarjetas que quedan entran de nuevo ---------- */
  var filters = document.getElementById("filters");
  if (filters) filters.addEventListener("click", function (e) {
    if (!e.target.closest(".chip")) return;
    var n = 0;
    $$("#events .card").forEach(function (c) {
      if (c.hidden) return;
      c.style.setProperty("--d", Math.min(n++, 8) * 0.05 + "s");
      c.classList.remove("pop-in"); void c.offsetWidth; c.classList.add("pop-in");
      c.addEventListener("animationend", function done() { c.classList.remove("pop-in"); c.style.removeProperty("--d"); c.removeEventListener("animationend", done); });
    });
  });

  /* ---------- Al cambiar de servicio, el texto entra deslizándose ---------- */
  var planOut = document.getElementById("planout");
  if (planOut && "MutationObserver" in window) {
    new MutationObserver(function () {
      planOut.classList.remove("swap"); void planOut.offsetWidth; planOut.classList.add("swap");
    }).observe(planOut, { childList: true });
  }

  /* ---------- Aviso discreto al botón del chat (una sola vez) ---------- */
  var fab = document.getElementById("chatfab");
  if (fab) setTimeout(function () {
    if (fab.getAttribute("aria-expanded") === "true") return;
    fab.classList.add("nudge");
    fab.addEventListener("animationend", function () { fab.classList.remove("nudge"); }, { once: true });
  }, 9000);
})();
