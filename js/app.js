/* Lógica de la página: cartelera, plan del día, feed de videos, redes y avisos. */
(function () {
  "use strict";
  var CFG = window.HTC_CONFIG || {};
  var EVENTS = window.HTC_EVENTS || [];
  var PLANS = window.HTC_PLANS || [];
  var VIDEOS = window.HTC_VIDEOS || [];
  var SOCIAL = CFG.social || {};
  var VBASE = (CFG.videos && CFG.videos.baseUrl) || "";
  var $ = function (s) { return document.querySelector(s); };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function burst(cx, cy, r1, r2, n) {
    var p = [];
    for (var i = 0; i < n * 2; i++) {
      var a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? r1 : r2;
      p.push((cx + Math.cos(a) * r).toFixed(1) + "," + (cy + Math.sin(a) * r).toFixed(1));
    }
    return p.join(" ");
  }
  var logoPts = burst(20, 20, 13, 19, 10);
  ["#logoburst", "#logoburst2"].forEach(function (s) { var e = $(s); if (e) e.setAttribute("points", logoPts); });

  /* Aviso */
  var toast = $("#toast"), tt;
  function say(msg) {
    toast.textContent = msg; toast.classList.add("on");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("on"); }, 2800);
  }
  window.HTC_say = say;
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-soon]");
    if (a) { e.preventDefault(); say(a.getAttribute("data-soon")); }
  });

  /* Redes: activas si hay URL, "Próximamente" si no */
  var NETS = [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["whatsapp", "WhatsApp"]];
  $("#social").innerHTML = NETS.map(function (n) {
    var u = SOCIAL[n[0]];
    return u
      ? '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + n[1] + '</a></li>'
      : '<li><a href="#" class="is-soon" data-soon="' + n[1] + ': próximamente">' + n[1] + '<small>Próximamente</small></a></li>';
  }).join("");
  document.querySelectorAll("[data-social]").forEach(function (a) {
    var u = SOCIAL[a.getAttribute("data-social")];
    if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else { a.setAttribute("data-soon", a.getAttribute("data-label") + ": enlace próximamente."); }
  });

  /* Cinta */
  var words = ["Fiestas temáticas", "Micrófono abierto", "Café y buena vibra", "Electrónica", "Urbano", "Quito de noche", "¡Hoy te caigo!"];
  var tk = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
  $("#ticker").innerHTML = tk + tk;

  /* Cartelera */
  var glyph = {
    bolt: '<polygon points="228,62 168,160 208,160 186,238 262,132 220,132" fill="#fff" stroke="#1b1410" stroke-width="6" stroke-linejoin="round"/>',
    star: '<polygon points="200,58 222,118 286,120 236,158 254,220 200,184 146,220 164,158 114,120 178,118" fill="#fff" stroke="#1b1410" stroke-width="6" stroke-linejoin="round"/>',
    mic: '<rect x="172" y="62" width="56" height="92" rx="28" fill="#fff" stroke="#1b1410" stroke-width="6"/><path d="M150 128v6a50 50 0 0 0 100 0v-6M200 184v34M176 220h48" fill="none" stroke="#1b1410" stroke-width="6" stroke-linecap="round"/>'
  };
  function art(ev, i) {
    if (ev.img) return '<img loading="lazy" src="' + esc(ev.img) + '" alt="">';
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="pd' + i + '" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="' + ev.c2 + '"/></pattern></defs>' +
      '<rect width="400" height="300" fill="' + ev.c1 + '"/><rect width="400" height="300" fill="url(#pd' + i + ')" opacity=".75"/>' +
      '<polygon points="' + burst(200, 160, 82, 128, 11) + '" fill="' + ev.c2 + '" stroke="#1b1410" stroke-width="6" stroke-linejoin="round"/>' +
      '<g transform="translate(0 20)">' + (glyph[ev.g] || glyph.star) + '</g></svg>';
  }
  var pin = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="#ffd21f" stroke="#1b1410" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6" fill="#1b1410"/></svg>';

  $("#events").innerHTML = EVENTS.map(function (e, i) {
    var label = e.a === "tix" ? "Comprar entradas" : "Anotarme en la lista";
    var action = e.url
      ? '<a class="btn btn--sm" href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'
      : '<a class="btn btn--sm" href="#" data-soon="' + esc(label) + ' de «' + esc(e.t) + '»: enlace pendiente.">' + label + '</a>';
    return '<article class="card" data-cat="' + esc(e.c) + '">' +
      '<div class="card__art">' + art(e, i) + '<div class="card__date"><b>' + esc(e.d) + '</b><small>' + esc(e.m) + '</small></div><span class="card__tag">' + esc(e.c) + '</span></div>' +
      '<div class="card__body"><h3>' + esc(e.t) + '</h3>' +
      '<div class="card__where">' + pin + esc(e.loc) + ', Quito</div>' +
      '<div class="card__when">' + esc(e.day) + ' · ' + esc(e.h) + '</div>' +
      '<div class="lineup-label">Line-up</div><ul class="lineup">' + e.dj.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
      '<div class="card__foot"><div class="price"><small>' + (e.a === "tix" ? "Desde" : "Entrada") + '</small>' + esc(e.p) + '</div>' + action + '</div></div></article>';
  }).join("");

  var cats = ["Todos"];
  EVENTS.forEach(function (e) { if (cats.indexOf(e.c) < 0) cats.push(e.c); });
  var fl = $("#filters");
  fl.innerHTML = cats.map(function (c, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join("");
  fl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    fl.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    document.querySelectorAll(".card").forEach(function (c) { c.hidden = b.dataset.c !== "Todos" && c.dataset.cat !== b.dataset.c; });
  });

  /* El plan para hoy */
  var mo = $("#moods"), out = $("#planout");
  mo.innerHTML = PLANS.map(function (p, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + esc(p.k) + '</button>'; }).join("");
  function showPlan(i) {
    var p = PLANS[i]; if (!p) return;
    out.innerHTML = '<h3>' + esc(p.t) + '</h3><p>' + esc(p.p) + '</p><ul class="plan__facts">' +
      p.f.map(function (f) { return '<li><b>' + esc(f[0]) + '</b>' + esc(f[1]) + '</li>'; }).join("") +
      '</ul><a class="btn btn--sm btn--star" href="#cartelera">' + esc(p.cta) + '</a>';
  }
  showPlan(0);
  mo.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    mo.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    showPlan(+b.dataset.i);
  });

  /* Feed de videos. Los archivos viven en almacenamiento externo (HTC_CONFIG.videos.baseUrl).
     Nada se descarga hasta que alguien toca un clip: el visor usa preload="none". */
  function vurl(f) { return /^https?:\/\//.test(f) ? f : VBASE + f; }
  $("#feednote").textContent = VBASE ? "" : "Clips de ejemplo. Conecta tus videos en js/config.js (videos.baseUrl).";
  $("#feed").innerHTML = VIDEOS.map(function (v, i) {
    var live = !!(VBASE && v.src);
    var bg = (live && v.poster)
      ? '<img loading="lazy" src="' + esc(vurl(v.poster)) + '" alt="">'
      : '<svg viewBox="0 0 225 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="cd' + i + '" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.6" fill="' + v.c2 + '"/></pattern></defs><rect width="225" height="400" fill="' + v.c1 + '"/><rect width="225" height="400" fill="url(#cd' + i + ')"/><polygon points="' + burst(112, 170, 52, 86, 10) + '" fill="' + v.c2 + '" stroke="#1b1410" stroke-width="5" stroke-linejoin="round" opacity=".9"/></svg>';
    return '<button type="button" class="clip" data-i="' + i + '" aria-label="Ver video: ' + esc(v.title) + '">' + bg +
      '<span class="clip__views">' + esc(v.views) + ' vistas</span>' +
      '<span class="clip__play"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#1b1410"/></svg></span>' +
      '<span class="clip__cap"><b>' + esc(v.title) + '</b>' + esc(v.cap) + '</span></button>';
  }).join("");

  var dlg = $("#vid"), player = $("#vidp");
  function closeVid() {
    player.pause(); player.removeAttribute("src"); player.removeAttribute("poster"); player.load();
    if (dlg.open) dlg.close();
  }
  $("#feed").addEventListener("click", function (e) {
    var b = e.target.closest(".clip"); if (!b) return;
    var v = VIDEOS[+b.dataset.i];
    if (!(VBASE && v.src)) { say("Este clip es de ejemplo. Conecta tus videos en js/config.js."); return; }
    if (v.poster) player.poster = vurl(v.poster);
    player.src = vurl(v.src);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    var p = player.play(); if (p && p.catch) p.catch(function () {});
  });
  $("#vidx").addEventListener("click", closeVid);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeVid(); });
  dlg.addEventListener("close", function () { player.pause(); });
})();
