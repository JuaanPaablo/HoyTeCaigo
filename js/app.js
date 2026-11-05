/* Lógica de la página: portafolio, servicios, feed de videos, redes y avisos. */
(function () {
  "use strict";
  var CFG = window.HTC_CONFIG || {};
  var EVENTS = window.HTC_EVENTS || [];
  var PLANS = window.HTC_PLANS || [];
  var VIDEOS = window.HTC_VIDEOS || [];
  var SOCIAL = CFG.social || {};
  var VBASE = (CFG.videos && CFG.videos.baseUrl) || "";
  var MAX_AUTO_CLIPS = 10;
  var $ = function (s) { return document.querySelector(s); };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  /* Marcador de posición con el logo, centrado, para eventos y clips sin foto */
  function placeholder(color) {
    return '<div class="ph" style="--c1:' + esc(color) + '"><img src="assets/logo.png" alt="" loading="lazy"></div>';
  }

  /* Aviso */
  var toast = $("#toast"), tt;
  function say(msg) {
    toast.textContent = msg; toast.classList.add("on");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("on"); }, 2800);
  }
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
  var words = ["Fiestas temáticas", "Micrófono abierto", "Producción de eventos", "Electrónica", "Urbano", "Quito de noche", "¡Hoy te caigo!"];
  var tk = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
  $("#ticker").innerHTML = tk + tk;

  /* ---------- Visor de video (se descarga solo al abrirlo, preload="none") ---------- */
  function vurl(f) { return /^https?:\/\//.test(f) ? f : VBASE + f; }
  /* Un video es reproducible si tiene URL completa o hay una base de videos configurada */
  function isLive(src) { return !!(src && (/^https?:\/\//.test(src) || VBASE)); }
  var dlg = $("#vid"), player = $("#vidp");
  function closeVid() {
    player.pause(); player.removeAttribute("src"); player.removeAttribute("poster"); player.load();
    if (dlg.open) dlg.close();
  }
  function openVid(src, poster) {
    if (poster) player.poster = vurl(poster); else player.removeAttribute("poster");
    player.src = vurl(src);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    var p = player.play(); if (p && p.catch) p.catch(function () {});
  }
  $("#vidx").addEventListener("click", closeVid);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeVid(); });
  dlg.addEventListener("close", function () { player.pause(); });

  /* ---------- Portafolio ---------- */
  var pin = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="#ffd21f" stroke="#1b1410" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6" fill="#1b1410"/></svg>';
  var playIco = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#1b1410"/></svg>';

  $("#events").innerHTML = EVENTS.map(function (e, i) {
    var art = e.img ? '<img loading="lazy" src="' + esc(e.img) + '" alt="">' : placeholder(e.c1);
    var foot = isLive(e.video)
      ? '<div class="card__foot"><button type="button" class="btn btn--sm" data-ev="' + i + '">' + playIco + ' Ver video</button></div>'
      : '';
    return '<article class="card" data-cat="' + esc(e.c) + '">' +
      '<div class="card__art">' + art + '<div class="card__date"><b>' + esc(e.d) + '</b><small>' + esc(e.m) + '</small></div><span class="card__tag">' + esc(e.c) + '</span></div>' +
      '<div class="card__body"><h3>' + esc(e.t) + '</h3>' +
      '<div class="card__where">' + pin + esc(e.loc) + ', Quito</div>' +
      '<div class="card__when">' + esc(e.day) + (e.h ? ' · ' + esc(e.h) : '') + '</div>' +
      (e.desc ? '<p class="card__desc">' + esc(e.desc) + '</p>' : '') +
      (e.dj && e.dj.length ? '<div class="lineup-label">Artistas</div><ul class="lineup">' + e.dj.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' : '') +
      foot + '</div></article>';
  }).join("");
  if (!EVENTS.length) $("#events").innerHTML = '<p class="note">Pronto publicaremos aquí nuestro portafolio de eventos.</p>';
  $("#events").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ev]"); if (!b) return;
    var ev = EVENTS[+b.getAttribute("data-ev")];
    if (ev && ev.video) openVid(ev.video, ev.poster);
  });

  var cats = ["Todos"];
  EVENTS.forEach(function (e) { if (cats.indexOf(e.c) < 0) cats.push(e.c); });
  var catOrder = window.HTC_CAT_ORDER;
  if (catOrder) cats.sort(function (a, b) {
    if (a === "Todos") return -1; if (b === "Todos") return 1;
    var i = catOrder.indexOf(a), j = catOrder.indexOf(b);
    return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
  });
  var fl = $("#filters");
  fl.innerHTML = cats.map(function (c, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join("");
  fl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    fl.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    document.querySelectorAll(".card").forEach(function (c) { c.hidden = b.dataset.c !== "Todos" && c.dataset.cat !== b.dataset.c; });
  });

  /* ---------- Qué hacemos ---------- */
  var mo = $("#moods"), out = $("#planout");
  mo.innerHTML = PLANS.map(function (p, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + esc(p.k) + '</button>'; }).join("");
  function showPlan(i) {
    var p = PLANS[i]; if (!p) return;
    out.innerHTML = '<h3>' + esc(p.t) + '</h3><p>' + esc(p.p) + '</p><ul class="plan__facts">' +
      p.f.map(function (f) { return '<li><b>' + esc(f[0]) + '</b>' + esc(f[1]) + '</li>'; }).join("") +
      '</ul><a class="btn btn--sm btn--star" href="#contacto">' + esc(p.cta) + '</a>';
  }
  showPlan(0);
  mo.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    mo.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    showPlan(+b.dataset.i);
  });

  /* ---------- Feed de videos (La vibra) ---------- */
  var feed = $("#feed"), clips = [];
  function renderFeed(list, note) {
    clips = list;
    $("#feednote").textContent = note || "";
    $("#vibra").hidden = !list.length;   // sin videos publicados, se oculta la sección
    feed.hidden = !list.length;
    feed.innerHTML = list.map(function (v, i) {
      var live = isLive(v.src);
      var bg;
      if (!live) bg = placeholder(v.c1 || "#ff6a13");
      /* Portada en imagen (liviana y nítida). Si el archivo no existe, la página usa el primer cuadro del video. */
      else if (v.poster) bg = '<img loading="lazy" decoding="async" src="' + esc(vurl(v.poster)) + '" data-fb="' + esc(vurl(v.src)) + '" alt="">';
      else bg = '<video muted playsinline preload="metadata" tabindex="-1" aria-hidden="true" src="' + esc(vurl(v.src)) + '#t=0.1"></video>';
      return '<button type="button" class="clip" data-i="' + i + '" aria-label="Ver video: ' + esc(v.title) + '">' +
        '<span class="clip__media">' + bg +
        '<span class="clip__play"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#1b1410"/></svg></span></span>' +
        '<span class="clip__cap"><b>' + esc(v.title) + '</b>' + esc(v.cap || "") + '</span></button>';
    }).join("");
  }
  /* Si una portada no existe en el bucket, se cambia por el primer cuadro del propio video */
  feed.addEventListener("error", function (e) {
    var im = e.target;
    if (im.tagName !== "IMG" || !im.getAttribute("data-fb")) return;
    var v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "metadata"; v.setAttribute("aria-hidden", "true"); v.tabIndex = -1;
    v.src = im.getAttribute("data-fb") + "#t=0.1";
    im.replaceWith(v);
  }, true);
  feed.addEventListener("click", function (e) {
    var b = e.target.closest(".clip"); if (!b) return;
    var v = clips[+b.dataset.i];
    if (!isLive(v.src)) { say("Este clip es de ejemplo. Sube tus videos al bucket para verlos aquí."); return; }
    openVid(v.src, v.poster);
  });

  var hasExplicit = window.HTC_REMOTE || VIDEOS.some(function (v) { return v.src; });
  renderFeed(VIDEOS, hasExplicit ? "" : (VBASE ? "Buscando tus videos…" : "Clips de ejemplo. Conecta tus videos en js/config.js."));

  /* Autodetección: busca clip-1.mp4 … clip-10.mp4 en el bucket. Un <video> con solo metadatos
     avisa si el archivo existe sin pedir permisos CORS ni descargar el video completo.
     No se usa cuando los videos vienen del panel (HTC_REMOTE) ni cuando están listados en data.js. */
  if (VBASE && !hasExplicit) {
    var found = [], pending = MAX_AUTO_CLIPS;
    var probe = function (n) {
      var v = document.createElement("video"), done = false, timer;
      var fin = function (ok) {
        if (done) return; done = true; clearTimeout(timer);
        v.removeAttribute("src"); v.load();
        if (ok) found.push(n);
        if (--pending === 0) {
          if (found.length) {
            found.sort(function (a, b) { return a - b; });
            renderFeed(found.map(function (k) { return { title: "Evento " + k, cap: "Video del evento", src: "clip-" + k + ".mp4", poster: "poster-" + k + ".jpg", c1: "#ff6a13" }; }), "");
          } else {
            renderFeed(VIDEOS, "Clips de ejemplo. Sube clip-1.mp4, clip-2.mp4… al bucket para verlos aquí.");
          }
        }
      };
      timer = setTimeout(function () { fin(false); }, 9000);
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function () { fin(true); };
      v.onerror = function () { fin(false); };
      v.src = VBASE + "clip-" + n + ".mp4";
    };
    for (var n = 1; n <= MAX_AUTO_CLIPS; n++) probe(n);
  }

  /* ---------- Próximo evento con cuenta regresiva (solo si hay un evento futuro con iso) ---------- */
  var upcoming = EVENTS.filter(function (e) { return e.iso && Date.parse(e.iso) > Date.now(); })
    .sort(function (a, b) { return Date.parse(a.iso) - Date.parse(b.iso); })[0];
  if (upcoming) {
    var target = Date.parse(upcoming.iso);
    $("#nexttitle").textContent = upcoming.t;
    $("#nextmeta").textContent = upcoming.day + " " + upcoming.d + " " + upcoming.m + " · " + upcoming.h + " · " + upcoming.loc + ", Quito";
    $("#next").hidden = false;
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var timer2;
    var tick = function () {
      var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      $("#cd-d").textContent = Math.floor(s / 86400);
      $("#cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
      $("#cd-m").textContent = pad(Math.floor(s % 3600 / 60));
      $("#cd-s").textContent = pad(s % 60);
      if (s === 0) clearInterval(timer2);
    };
    timer2 = setInterval(tick, 1000);
    tick();
  }

  /* ---------- Formulario "Avísame". Sin endpoint en config no guarda nada y lo dice. ---------- */
  var form = $("#leadform"), msg = $("#leadmsg"), sending = false;
  function leadMsg(text, bad) { msg.textContent = text; msg.className = "lead__msg" + (bad ? " err" : ""); }
  function validContact(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || /^\+?[\d\s-]{7,15}$/.test(v);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    var name = $("#lead-name").value.trim();
    var contact = $("#lead-contact").value.trim();
    var ok = $("#lead-ok").checked;
    $("#lead-contact").setAttribute("aria-invalid", "false");
    if (!validContact(contact)) {
      $("#lead-contact").setAttribute("aria-invalid", "true");
      leadMsg("Escribe un correo válido o un número de WhatsApp (solo dígitos).", true);
      $("#lead-contact").focus(); return;
    }
    if (!ok) { leadMsg("Marca la casilla para que podamos escribirte.", true); $("#lead-ok").focus(); return; }
    if ($("#lead-web").value) { leadMsg("¡Listo! Te avisamos."); form.reset(); return; }   // trampa para bots
    var url = (CFG.leads && CFG.leads.endpoint) || "";
    if (!url) { leadMsg("El registro aún no está conectado. Vuelve pronto o escríbenos por Facebook.", true); return; }
    sending = true; leadMsg("Enviando…");
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ name: name, contact: contact, consent: true, source: "landing" })
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      leadMsg("¡Listo! Te avisamos cuando anunciemos algo nuevo."); form.reset();
    }).catch(function () {
      leadMsg("No pudimos guardar tus datos. Intenta de nuevo en un momento.", true);
    }).then(function () { sending = false; });
  });
})();
