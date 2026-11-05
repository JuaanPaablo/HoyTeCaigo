/* Arranque de la página.
   Si js/config.js tiene supabase.url y supabase.anonKey, carga categorías, eventos y videos publicados
   desde la base de datos (los que administra marketing en /admin) y reemplaza los datos de js/data.js.
   Si no está configurado, tarda más de 4 s o falla, la página usa los datos de js/data.js: nunca queda vacía por un error.
   La clave "anon" es pública por diseño; la seguridad la dan las reglas RLS de supabase/schema.sql. */
(function () {
  "use strict";
  var CFG = window.HTC_CONFIG || {};
  var S = CFG.supabase || {};
  var scripts = ["js/app.js", "js/chatbot.js"];

  function load(i) {
    if (i >= scripts.length) return;
    var s = document.createElement("script");
    s.src = scripts[i];
    s.onload = function () { load(i + 1); };
    s.onerror = function () { load(i + 1); };
    document.body.appendChild(s);
  }

  if (!(S.url && S.anonKey)) { load(0); return; }

  var MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  var DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var base = S.url.replace(/\/$/, "") + "/rest/v1/";
  var done = false;
  var timer = setTimeout(function () { if (!done) { done = true; load(0); } }, 4000);

  function get(table, query) {
    return fetch(base + table + "?" + query, { headers: { apikey: S.anonKey, Authorization: "Bearer " + S.anonKey } })
      .then(function (r) { if (!r.ok) throw new Error(table + " " + r.status); return r.json(); });
  }

  Promise.all([
    get("categories", "select=*&order=sort_order.asc,name.asc"),
    get("videos", "select=*&published=eq.true&order=sort_order.asc,created_at.asc"),
    get("events", "select=*&published=eq.true&order=event_date.desc,event_time.desc")
  ]).then(function (r) {
    if (done) return;
    var cats = {}, vids = {};
    r[0].forEach(function (c) { cats[c.id] = c; });
    r[1].forEach(function (v) { vids[v.id] = v; });

    window.HTC_VIDEOS = r[1].map(function (v) {
      return { title: v.title, cap: v.caption || "", src: v.src, poster: v.poster_url || "", c1: "#ff6a13" };
    });
    window.HTC_EVENTS = r[2].map(function (e) {
      var c = cats[e.category_id] || {};
      var v = e.video_id ? vids[e.video_id] : null;
      var p = String(e.event_date || "").split("-");
      var dt = new Date(+p[0], +p[1] - 1, +p[2]);
      var time = (e.event_time || "").slice(0, 5);
      return {
        t: e.title, c: c.name || "Otros",
        d: (dt.getDate() < 10 ? "0" : "") + dt.getDate(), m: MES[dt.getMonth()], day: DIA[dt.getDay()], h: time,
        loc: e.zone || "", dj: e.artists || [], desc: e.description || "",
        img: e.image_url || "", video: v ? v.src : "", poster: v ? (v.poster_url || "") : "",
        c1: c.color || "#ff6a13",
        iso: e.event_date ? e.event_date + "T" + (time || "00:00") + ":00-05:00" : ""   // Ecuador: UTC-5
      };
    });
    window.HTC_REMOTE = true;   // los videos vienen de la base: no autodetectar clip-N.mp4
    done = true; clearTimeout(timer); load(0);
  }).catch(function () {
    if (!done) { done = true; clearTimeout(timer); load(0); }
  });
})();
