/* Mapa de cobertura de Ecuador. Las provincias pintadas salen de js/config.js → coverage.
   Los datos del mapa (js/ecuador-map.js, ~70 KB) se descargan solo cuando la sección está por aparecer en pantalla. */
(function () {
  "use strict";
  var root = document.getElementById("map");
  if (!root) return;
  var svg = document.getElementById("mapsvg");
  var cap = document.getElementById("mapcap");
  var legend = document.getElementById("maplegend");
  var cov = (window.HTC_CONFIG || {}).coverage || {};
  var REG = { sierra: "Sierra", costa: "Costa", oriente: "Oriente", insular: "Región Insular" };
  var DEFAULT_CAP = "Toca una provincia";
  var started = false;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function painted(p) {
    return (cov.regions || []).indexOf(p.region) >= 0 || (cov.provinces || []).indexOf(p.id) >= 0;
  }

  function init() {
    if (started || !window.HTC_MAP) return;
    started = true;
    var M = window.HTC_MAP;
    svg.setAttribute("viewBox", M.viewBox);

    /* Orden de pintado: Sierra, Costa, Oriente (para la animación escalonada) */
    var rank = { sierra: 0, costa: 1, oriente: 2, insular: 3 };
    var n = 0;
    var order = {};
    M.provinces.filter(painted).sort(function (a, b) { return rank[a.region] - rank[b.region]; }).forEach(function (p) { order[p.id] = n++; });

    var html = M.provinces.map(function (p) {
      var on = painted(p);
      return '<path class="map__p r-' + p.region + (on ? " cov" : "") + '" data-id="' + p.id + '"' +
        (on ? ' style="--n:' + order[p.id] + '"' : "") + ' d="' + p.d + '"><title>' + esc(p.name) + '</title></path>';
    }).join("");

    /* Matriz en Quito */
    var q = M.quito;
    html += '<g class="map__q" transform="translate(' + q[0] + " " + q[1] + ')" pointer-events="none">' +
      '<circle class="map__ring" r="9"/><circle r="6.5" fill="#1b1410"/><circle r="3.4" fill="#ffd21f"/>' +
      '<text x="14" y="-9" class="map__qt">Matriz · Quito</text></g>';
    svg.innerHTML = html;

    /* Rótulo del recuadro de Galápagos, ubicado según su propio tamaño */
    var gal = svg.querySelector('[data-id="galapagos"]');
    if (gal && gal.getBBox) {
      var b = gal.getBBox();
      var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", b.x); t.setAttribute("y", Math.max(14, b.y - 8)); t.setAttribute("class", "map__qt map__qt--sm");
      t.textContent = "Galápagos";
      svg.appendChild(t);
    }

    /* Leyenda por región, con los nombres de las provincias pintadas */
    var by = { sierra: [], costa: [], oriente: [] };
    M.provinces.forEach(function (p) { if (by[p.region] && painted(p)) by[p.region].push(p.name); });
    var total = { sierra: 0, costa: 0, oriente: 0 };
    M.provinces.forEach(function (p) { if (total[p.region] !== undefined) total[p.region]++; });
    legend.innerHTML = ["sierra", "costa", "oriente"].filter(function (r) { return by[r].length; }).map(function (r) {
      var all = by[r].length === total[r];
      return '<li><i class="sw sw--' + r + '"></i><div><b>' + REG[r] + '</b><span>' +
        (all ? "Todas las provincias" : esc(by[r].join(", "))) + '</span></div></li>';
    }).join("") + '<li><i class="sw sw--off"></i><div><b>Resto del país</b><span>También llegamos bajo pedido</span></div></li>';

    /* Interacción: pasar el cursor o tocar una provincia actualiza el texto de abajo */
    var show = function (e) {
      var path = e.target.closest ? e.target.closest(".map__p") : null;
      if (!path) return;
      var p = M.provinces.filter(function (x) { return x.id === path.getAttribute("data-id"); })[0];
      if (!p) return;
      cap.innerHTML = "<b>" + esc(p.name) + "</b> · " + REG[p.region] + (painted(p) ? " · Eventos realizados" : " · Disponible bajo pedido");
    };
    svg.addEventListener("pointerover", show);
    svg.addEventListener("click", show);
    svg.addEventListener("pointerleave", function () { cap.textContent = DEFAULT_CAP; });

    /* Animación: las provincias se pintan en cascada la primera vez que el mapa se ve */
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm && "IntersectionObserver" in window) {
      root.classList.add("map--pre");
      var go = function () { root.classList.remove("map--pre"); };
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { io.disconnect(); setTimeout(go, 250); }
      }, { threshold: 0.35 });
      io.observe(root);
      setTimeout(go, 8000);   // red de seguridad: si no se dispara, se pinta igual
    }
  }

  function load() {
    if (window.HTC_MAP) { init(); return; }
    var s = document.createElement("script");
    s.src = "js/ecuador-map.js";
    s.onload = init;
    document.body.appendChild(s);
  }

  if ("IntersectionObserver" in window) {
    var pre = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { pre.disconnect(); load(); }
    }, { rootMargin: "700px 0px" });
    pre.observe(root);
  } else { load(); }
})();
