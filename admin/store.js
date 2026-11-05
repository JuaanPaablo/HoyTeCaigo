/* Capa de datos del panel.
   - Con supabase.url y supabase.anonKey en js/config.js: usa Supabase (datos reales, compartidos).
   - Sin configurar: MODO DEMO. Los datos viven solo en este navegador (localStorage) para poder probar el panel. */
window.HTC_STORE = (function () {
  "use strict";
  var CFG = window.HTC_CONFIG || {};
  var sc = CFG.supabase || {};
  var live = !!(sc.url && sc.anonKey && window.supabase && window.supabase.createClient);
  var BUCKET = "media";

  /* ---------------- Supabase ---------------- */
  if (live) {
    var sb = window.supabase.createClient(sc.url, sc.anonKey);
    var ORDER = {
      categories: [["sort_order", true], ["name", true]],
      events: [["event_date", false], ["event_time", false]],
      videos: [["sort_order", true], ["created_at", true]],
      leads: [["created_at", false]]
    };
    var must = function (r) { if (r.error) throw r.error; return r.data; };
    return {
      mode: "supabase",
      getUser: function () {
        return sb.auth.getSession().then(function (r) {
          var s = r.data && r.data.session;
          return s ? { email: s.user.email } : null;
        });
      },
      signIn: function (email, password) {
        return sb.auth.signInWithPassword({ email: email, password: password }).then(function (r) {
          if (r.error) throw r.error;
          return { email: r.data.user.email };
        });
      },
      signOut: function () { return sb.auth.signOut(); },
      list: function (table) {
        var q = sb.from(table).select("*");
        ORDER[table].forEach(function (o) { q = q.order(o[0], { ascending: o[1] }); });
        return q.then(must);
      },
      save: function (table, row) {
        var id = row.id, body = {};
        Object.keys(row).forEach(function (k) { if (k !== "id" && k !== "created_at") body[k] = row[k]; });
        var q = id ? sb.from(table).update(body).eq("id", id) : sb.from(table).insert(body);
        return q.select().single().then(must);
      },
      remove: function (table, id) { return sb.from(table).delete().eq("id", id).then(function (r) { if (r.error) throw r.error; }); },
      upload: function (blob, path) {
        return sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || undefined, cacheControl: "31536000", upsert: false })
          .then(function (r) {
            if (r.error) throw r.error;
            return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          });
      }
    };
  }

  /* ---------------- Modo demo (localStorage) ---------------- */
  var KEY = "htc_demo_v1";
  var R2 = "https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/";
  function seed() {
    var cats = [
      { id: "c1", name: "Universitarios", color: "#ff6a13", sort_order: 1 },
      { id: "c2", name: "Culturales", color: "#ffb347", sort_order: 2 },
      { id: "c3", name: "Provinciales", color: "#ffd21f", sort_order: 3 },
      { id: "c4", name: "Corporativos", color: "#ff6a13", sort_order: 4 }
    ];
    var vids = [1, 2, 3, 4, 5].map(function (n) {
      return { id: "v" + n, title: "Evento " + n, caption: "Video del evento", src: R2 + "clip-" + n + ".mp4", poster_url: R2 + "poster-" + n + ".jpg", sort_order: n, published: true, created_at: "2026-10-20T10:0" + n + ":00Z" };
    });
    function ev(i, title, cat, date, time, zone, artists, desc) {
      return { id: "e" + i, title: title, category_id: cat, event_date: date, event_time: time, zone: zone, artists: artists, description: desc, image_url: null, video_id: null, published: true, created_at: "2026-10-0" + i + "T10:00:00Z" };
    }
    return {
      categories: cats, videos: vids,
      leads: [
        { id: "l1", name: "Camila Torres", contact: "0991234567", source: "landing", consent: true, status: "nuevo", notes: null, created_at: "2026-11-04T15:20:00Z" },
        { id: "l2", name: null, contact: "mateo@correo.com", source: "landing", consent: true, status: "contactado", notes: null, created_at: "2026-11-02T21:05:00Z" }
      ],
      events: [
        ev(1, "Festival Cultural de Primavera", "c2", "2026-10-28", "18:30:00", "Quito", ["Artistas invitados", "Presenta: Pame"], "Jornada de música, poesía y artes en vivo abierta a toda la ciudad."),
        ev(2, "Feria Universitaria", "c1", "2026-10-23", "10:00:00", "Quito", ["DJ Zaida", "MC Quito"], "Encuentro de estudiantes de distintas universidades con escenario, stands y activaciones."),
        ev(3, "Gran Concierto Provincial", "c3", "2026-10-17", "20:00:00", "Cuenca", ["Kuri", "Mateo Ríos", "Sol B2B Nico"], "Producción de gran formato con escenario, sonido e iluminación para miles de asistentes."),
        ev(4, "Lanzamiento de Marca", "c4", "2026-10-10", "19:00:00", "Guayaquil", ["Anka", "Ro Vega"], "Evento de presentación para clientes y medios, con ambientación y show en vivo."),
        ev(5, "Encuentro Cultural", "c2", "2026-10-09", "19:00:00", "Ambato", ["DJ Pixel", "Vale Vinilo"], "Noche de música y cultura local en un formato cercano para la comunidad."),
        ev(6, "Bienvenida Universitaria", "c1", "2026-10-03", "21:00:00", "Quito", ["Trío Sinapsis", "DJ Chuta", "Invitado sorpresa"], "Evento de inicio de ciclo para que los estudiantes de distintas universidades se encuentren.")
      ]
    };
  }
  function read() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.events) { d.leads = d.leads || []; return d; } } catch (e) {}
    return seed();
  }
  function write(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { throw new Error("El navegador no tiene espacio para guardar más datos de la demo."); } }
  function uid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "id" + Date.now() + Math.random().toString(16).slice(2); }
  function sortBy(arr, fn) { return arr.slice().sort(fn); }
  var cmp = {
    categories: function (a, b) { return (a.sort_order - b.sort_order) || a.name.localeCompare(b.name); },
    events: function (a, b) { return String(b.event_date).localeCompare(String(a.event_date)) || String(b.event_time || "").localeCompare(String(a.event_time || "")); },
    videos: function (a, b) { return (a.sort_order - b.sort_order) || String(a.created_at).localeCompare(String(b.created_at)); },
    leads: function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); }
  };
  var wait = function (v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 120); }); };

  return {
    mode: "demo",
    getUser: function () { return wait(sessionStorage.getItem("htc_demo_user") ? { email: "demo@local" } : null); },
    signIn: function () { sessionStorage.setItem("htc_demo_user", "1"); return wait({ email: "demo@local" }); },
    signOut: function () { sessionStorage.removeItem("htc_demo_user"); return wait(); },
    reset: function () { localStorage.removeItem(KEY); return wait(); },
    list: function (table) { return wait(sortBy(read()[table], cmp[table])); },
    save: function (table, row) {
      var d = read(), list = d[table], out;
      if (row.id) {
        for (var i = 0; i < list.length; i++) if (list[i].id === row.id) { out = list[i] = Object.assign({}, list[i], row); }
      } else {
        out = Object.assign({ id: uid(), created_at: new Date().toISOString() }, row);
        if (table === "categories" && list.some(function (c) { return c.name.toLowerCase() === String(row.name).toLowerCase(); })) return Promise.reject(new Error("Ya existe una categoría con ese nombre."));
        list.push(out);
      }
      write(d); return wait(out);
    },
    remove: function (table, id) {
      var d = read();
      if (table === "categories" && d.events.some(function (e) { return e.category_id === id; })) return Promise.reject(new Error("Esta categoría tiene eventos."));
      d[table] = d[table].filter(function (x) { return x.id !== id; });
      if (table === "videos") d.events.forEach(function (e) { if (e.video_id === id) e.video_id = null; });
      write(d); return wait();
    },
    upload: function (blob) {
      if (/^image\//.test(blob.type)) {
        return new Promise(function (res, rej) {
          var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = function () { rej(new Error("No se pudo leer la imagen.")); }; fr.readAsDataURL(blob);
        });
      }
      return wait(URL.createObjectURL(blob));   // solo dura mientras la pestaña esté abierta
    }
  };
})();
