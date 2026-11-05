/* Panel de contenido: eventos, videos y categorías. */
(function () {
  "use strict";
  var S = window.HTC_STORE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MAX_VIDEO_MB = 50;      // tope del plan gratuito de Supabase Storage por archivo
  var DEFAULT_ZONES = ["La Mariscal", "Cumbayá", "La Floresta", "González Suárez"];

  var st = { tab: "events", cats: [], events: [], videos: [], q: "", cat: "", loading: true };

  /* ---------- utilidades de interfaz ---------- */
  var toastEl = $("#toast"), tt;
  function toast(msg, bad) {
    toastEl.textContent = msg; toastEl.className = "toast on" + (bad ? " bad" : "");
    clearTimeout(tt); tt = setTimeout(function () { toastEl.className = "toast"; }, 3200);
  }
  function errMsg(e) {
    var m = (e && e.message) || String(e);
    if (/duplicate key|already exists|unique/i.test(m)) return "Ya existe un elemento con ese nombre.";
    if (/foreign key|violates/i.test(m)) return "No se puede borrar porque otros elementos lo usan.";
    if (/Invalid login/i.test(m)) return "Correo o contraseña incorrectos.";
    if (/row-level security|permission|JWT/i.test(m)) return "No tienes permiso para hacer esto. Vuelve a iniciar sesión.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Sin conexión con el servidor. Revisa tu internet.";
    return m;
  }
  function fmtDate(d) {
    if (!d) return "Sin fecha";
    var p = String(d).split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return DIA[dt.getDay()] + " " + dt.getDate() + " " + MES[dt.getMonth()] + " " + dt.getFullYear();
  }
  function slug(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "archivo"; }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  /* Confirmación dentro de la página (los diálogos del navegador están bloqueados) */
  var cdlg = $("#cdlg");
  function confirmBox(title, text, yes) {
    return new Promise(function (res) {
      $("#ctitle").textContent = title; $("#ctext").textContent = text; $("#cyes").textContent = yes || "Eliminar";
      var done = function (v) { cdlg.close(); $("#cyes").onclick = $("#cno").onclick = null; res(v); };
      $("#cyes").onclick = function () { done(true); };
      $("#cno").onclick = function () { done(false); };
      cdlg.oncancel = function () { res(false); };
      cdlg.showModal();
    });
  }

  /* Ventana de formulario: onSubmit devuelve una promesa; si falla, muestra el error y deja editar */
  var dlg = $("#dlg"), dform = $("#dform");
  function openModal(title, bodyHtml, onSubmit, after) {
    $("#dlgtitle").textContent = title; $("#dbody").innerHTML = bodyHtml; $("#derr").textContent = "";
    $("#dsave").disabled = false; $("#dsave").textContent = "Guardar";
    dform.onsubmit = function (e) {
      e.preventDefault();
      var btn = $("#dsave"); btn.disabled = true; btn.textContent = "Guardando…"; $("#derr").textContent = "";
      Promise.resolve().then(onSubmit).then(function () { dlg.close(); return refresh(); }).then(function () { toast("Guardado"); })
        .catch(function (err) { $("#derr").textContent = errMsg(err); btn.disabled = false; btn.textContent = "Guardar"; });
    };
    $("#dcancel").onclick = function () { dlg.close(); };
    dlg.showModal();
    if (after) after();
    var first = $("#dbody input:not([type=hidden]):not([type=file]), #dbody select, #dbody textarea"); if (first) first.focus();
  }

  /* ---------- imágenes y archivos ---------- */
  function resizeImage(file, maxSide, quality) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, maxSide / Math.max(img.width, img.height));
        var c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); b ? res(b) : rej(new Error("No se pudo procesar la imagen.")); }, "image/jpeg", quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("Ese archivo no es una imagen válida.")); };
      img.src = url;
    });
  }
  function uploadPath(folder, name, ext) { return folder + "/" + Date.now() + "-" + slug(name.replace(/\.[^.]+$/, "")) + "." + ext; }

  /* Campo de imagen: URL + botón para subir. Reduce la foto a 1600 px para ahorrar espacio. */
  function imgField(id, label, value, hint) {
    return '<div class="field upl"><label for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" type="url" placeholder="https://…" value="' + esc(value || "") + '">' +
      '<div class="upl__top"><input id="' + id + '-f" type="file" accept="image/*" hidden>' +
      '<button class="btn btn--text" type="button" id="' + id + '-b">Subir imagen</button><span class="upl__st" id="' + id + '-s"></span></div>' +
      (hint ? '<span class="hint">' + hint + '</span>' : '') +
      '<img class="upl__prev" id="' + id + '-p" alt="Vista previa" ' + (value ? 'src="' + esc(value) + '"' : 'hidden') + '></div>';
  }
  function wireImg(id, folder) {
    var url = $("#" + id), f = $("#" + id + "-f"), s = $("#" + id + "-s"), p = $("#" + id + "-p");
    function show(v) { if (v) { p.src = v; p.hidden = false; } else { p.hidden = true; } }
    $("#" + id + "-b").onclick = function () { f.click(); };
    url.oninput = function () { show(url.value.trim()); };
    f.onchange = function () {
      var file = f.files[0]; if (!file) return;
      s.textContent = "Subiendo…";
      resizeImage(file, 1600, 0.82).then(function (blob) { return S.upload(blob, uploadPath(folder, file.name, "jpg")); })
        .then(function (u) { url.value = u; show(u); s.textContent = "Listo"; })
        .catch(function (e) { s.textContent = ""; $("#derr").textContent = errMsg(e); });
    };
  }

  /* ---------- carga de datos ---------- */
  function refresh() {
    return Promise.all([S.list("categories"), S.list("videos"), S.list("events")]).then(function (r) {
      st.cats = r[0]; st.videos = r[1]; st.events = r[2]; st.loading = false; render();
    }).catch(function (e) { st.loading = false; $("#view").innerHTML = '<div class="empty"><b>No se pudieron cargar los datos</b>' + esc(errMsg(e)) + '</div>'; });
  }

  /* ---------- render ---------- */
  var TABS = [["events", "Eventos"], ["videos", "Videos"], ["cats", "Categorías"]];
  function render() {
    $("#tabs").innerHTML = TABS.map(function (t) {
      return '<button class="tab" role="tab" type="button" data-tab="' + t[0] + '" aria-selected="' + (st.tab === t[0]) + '">' + t[1] + '</button>';
    }).join("");
    var v = $("#view");
    if (st.loading) { v.innerHTML = '<div class="list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>'; return; }
    if (st.tab === "events") renderEvents(v); else if (st.tab === "videos") renderVideos(v); else renderCats(v);
  }

  function thumb(src) {
    /* Si la imagen no carga (enlace roto o aún no subida), se muestra el logo */
    return src ? '<img class="item__thumb" src="' + esc(src) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'../assets/logo.png\';this.classList.add(\'item__thumb--logo\')">'
      : '<img class="item__thumb item__thumb--logo" src="../assets/logo.png" alt="">';
  }

  /* ----- Eventos ----- */
  function renderEvents(v) {
    var q = st.q.toLowerCase();
    var list = st.events.filter(function (e) {
      return (!st.cat || e.category_id === st.cat) && (!q || (e.title + " " + (e.zone || "")).toLowerCase().indexOf(q) >= 0);
    });
    var html = '<div class="head"><h2>Eventos</h2><button class="btn" type="button" data-act="new-event">+ Nuevo evento</button></div>' +
      '<div class="tools"><input type="text" id="q" placeholder="Buscar por nombre o zona" value="' + esc(st.q) + '" aria-label="Buscar eventos">' +
      '<select id="fcat" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>' +
      st.cats.map(function (c) { return '<option value="' + c.id + '"' + (st.cat === c.id ? " selected" : "") + '>' + esc(c.name) + '</option>'; }).join("") + '</select></div>';
    if (!list.length) {
      html += '<div class="empty"><b>' + (st.events.length ? "Sin resultados" : "Aún no hay eventos") + '</b>' +
        (st.events.length ? "Prueba con otra búsqueda o categoría." : "Pulsa «Nuevo evento» para publicar el primero.") + '</div>';
    } else {
      html += '<div class="list">' + list.map(function (e) {
        var c = byId(st.cats, e.category_id), vid = e.video_id ? byId(st.videos, e.video_id) : null;
        return '<article class="item">' + thumb(e.image_url) +
          '<div class="item__main"><div class="item__title">' + esc(e.title) + '</div><div class="item__meta">' +
          (c ? '<span class="chip"><i class="dot" style="background:' + esc(c.color) + '"></i>' + esc(c.name) + '</span>' : '') +
          '<span>' + fmtDate(e.event_date) + (e.event_time ? " · " + esc(String(e.event_time).slice(0, 5)) : "") + '</span>' +
          (e.zone ? '<span>' + esc(e.zone) + '</span>' : '') +
          (vid ? '<span class="chip">Video</span>' : '') +
          (e.published ? '' : '<span class="badge badge--draft">Borrador</span>') + '</div></div>' +
          '<div class="item__act"><button class="btn btn--text" type="button" data-act="edit-event" data-id="' + e.id + '">Editar</button>' +
          '<button class="btn btn--text" type="button" data-act="del-event" data-id="' + e.id + '">Eliminar</button></div></article>';
      }).join("") + '</div>';
    }
    v.innerHTML = html;
  }

  function eventForm(ev) {
    var isNew = !ev; ev = ev || { published: true, artists: [] };
    if (!st.cats.length) { toast("Primero crea al menos una categoría.", true); st.tab = "cats"; render(); return; }
    var zones = DEFAULT_ZONES.slice();
    st.events.forEach(function (e) { if (e.zone && zones.indexOf(e.zone) < 0) zones.push(e.zone); });
    var body =
      '<div class="field"><label for="f-title">Nombre del evento</label><input id="f-title" type="text" maxlength="90" required value="' + esc(ev.title) + '"></div>' +
      '<div class="row2"><div class="field"><label for="f-cat">Categoría</label><select id="f-cat" required>' +
      st.cats.map(function (c) { return '<option value="' + c.id + '"' + (ev.category_id === c.id ? " selected" : "") + '>' + esc(c.name) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label for="f-zone">Zona</label><input id="f-zone" type="text" list="zones" maxlength="60" value="' + esc(ev.zone || "") + '"><datalist id="zones">' + zones.map(function (z) { return '<option value="' + esc(z) + '">'; }).join("") + '</datalist></div></div>' +
      '<div class="row2"><div class="field"><label for="f-date">Fecha</label><input id="f-date" type="date" required value="' + esc(ev.event_date || "") + '"></div>' +
      '<div class="field"><label for="f-time">Hora <span class="muted">(opcional)</span></label><input id="f-time" type="time" value="' + esc(String(ev.event_time || "").slice(0, 5)) + '"></div></div>' +
      '<div class="field"><label for="f-art">Artistas</label><textarea id="f-art" placeholder="Uno por línea">' + esc((ev.artists || []).join("\n")) + '</textarea></div>' +
      '<div class="field"><label for="f-desc">Descripción corta</label><textarea id="f-desc" maxlength="240" placeholder="De qué trató el evento (máx. 240 caracteres)">' + esc(ev.description || "") + '</textarea></div>' +
      imgField("f-img", "Foto del evento", ev.image_url, "Se reduce sola a 1600 px. Horizontal se ve mejor.") +
      '<div class="field"><label for="f-vid">Video del evento <span class="muted">(opcional)</span></label><select id="f-vid"><option value="">Sin video</option>' +
      st.videos.map(function (x) { return '<option value="' + x.id + '"' + (ev.video_id === x.id ? " selected" : "") + '>' + esc(x.title) + '</option>'; }).join("") + '</select>' +
      '<span class="hint">Los videos se agregan en la pestaña «Videos».</span></div>' +
      '<label class="check"><input id="f-pub" type="checkbox"' + (ev.published ? " checked" : "") + '> Publicado en la página</label>';
    openModal(isNew ? "Nuevo evento" : "Editar evento", body, function () {
      var title = $("#f-title").value.trim(), date = $("#f-date").value;
      if (!title) throw new Error("Escribe el nombre del evento.");
      if (!date) throw new Error("Elige la fecha del evento.");
      var row = {
        title: title, category_id: $("#f-cat").value, zone: $("#f-zone").value.trim() || null,
        event_date: date, event_time: $("#f-time").value || null,
        artists: $("#f-art").value.split(/\n|,/).map(function (x) { return x.trim(); }).filter(Boolean),
        description: $("#f-desc").value.trim() || null, image_url: $("#f-img").value.trim() || null,
        video_id: $("#f-vid").value || null, published: $("#f-pub").checked
      };
      if (ev.id) row.id = ev.id;
      return S.save("events", row);
    }, function () { wireImg("f-img", "events"); });
  }

  /* ----- Videos ----- */
  function renderVideos(v) {
    var html = '<div class="head"><h2>Videos</h2><button class="btn" type="button" data-act="new-video">+ Nuevo video</button></div>';
    if (!st.videos.length) {
      html += '<div class="empty"><b>Aún no hay videos</b>Pulsa «Nuevo video» para agregar el primero.</div>';
    } else {
      html += '<div class="list">' + st.videos.map(function (x) {
        var used = st.events.filter(function (e) { return e.video_id === x.id; }).length;
        return '<article class="item">' + thumb(x.poster_url) +
          '<div class="item__main"><div class="item__title">' + esc(x.title) + '</div><div class="item__meta">' +
          (x.caption ? '<span>' + esc(x.caption) + '</span>' : '') + '<span>Orden ' + x.sort_order + '</span>' +
          (used ? '<span class="chip">En ' + used + ' evento' + (used > 1 ? 's' : '') + '</span>' : '') +
          (x.published ? '' : '<span class="badge badge--draft">Oculto</span>') + '</div></div>' +
          '<div class="item__act"><button class="btn btn--text" type="button" data-act="edit-video" data-id="' + x.id + '">Editar</button>' +
          '<button class="btn btn--text" type="button" data-act="del-video" data-id="' + x.id + '">Eliminar</button></div></article>';
      }).join("") + '</div>';
    }
    v.innerHTML = html;
  }

  function videoForm(vd) {
    var isNew = !vd; vd = vd || { published: true, sort_order: (st.videos.length ? Math.max.apply(null, st.videos.map(function (x) { return x.sort_order; })) + 1 : 1) };
    var body =
      '<div class="field"><label for="v-title">Título</label><input id="v-title" type="text" maxlength="80" required value="' + esc(vd.title) + '"></div>' +
      '<div class="field"><label for="v-cap">Descripción corta <span class="muted">(opcional)</span></label><input id="v-cap" type="text" maxlength="100" value="' + esc(vd.caption || "") + '"></div>' +
      '<div class="field upl"><label for="v-src">Video</label><input id="v-src" type="url" required placeholder="https://… (enlace .mp4)" value="' + esc(vd.src || "") + '">' +
      '<div class="upl__top"><input id="v-file" type="file" accept="video/mp4,video/*" hidden><button class="btn btn--text" type="button" id="v-b">Subir archivo</button><span class="upl__st" id="v-s"></span></div>' +
      '<span class="hint">Sube un MP4 de hasta ' + MAX_VIDEO_MB + ' MB, o pega el enlace de un video que ya esté en tu almacenamiento (por ejemplo Cloudflare R2). Mejor MP4 H.264 de 720p.</span></div>' +
      imgField("v-poster", "Portada", vd.poster_url, "Si subes el video desde aquí puedes generar la portada automáticamente.") +
      '<div class="upl__top"><button class="btn btn--text" type="button" id="v-gen" disabled>Crear portada desde el video subido</button></div>' +
      '<div class="row2"><div class="field"><label for="v-ord">Orden</label><input id="v-ord" type="number" min="0" step="1" value="' + esc(vd.sort_order) + '"><span class="hint">El 1 aparece primero.</span></div>' +
      '<div class="field"><label>&nbsp;</label><label class="check"><input id="v-pub" type="checkbox"' + (vd.published ? " checked" : "") + '> Visible en la página</label></div></div>';
    var localFile = null;
    openModal(isNew ? "Nuevo video" : "Editar video", body, function () {
      var title = $("#v-title").value.trim(), src = $("#v-src").value.trim();
      if (!title) throw new Error("Escribe el título del video.");
      if (!/^https?:\/\//i.test(src) && !/^blob:/.test(src)) throw new Error("Sube el video o pega un enlace que empiece con https://");
      var row = {
        title: title, caption: $("#v-cap").value.trim() || null, src: src, poster_url: $("#v-poster").value.trim() || null,
        sort_order: parseInt($("#v-ord").value, 10) || 0, published: $("#v-pub").checked
      };
      if (vd.id) row.id = vd.id;
      return S.save("videos", row);
    }, function () {
      wireImg("v-poster", "posters");
      var f = $("#v-file"), s = $("#v-s"), gen = $("#v-gen");
      $("#v-b").onclick = function () { f.click(); };
      f.onchange = function () {
        var file = f.files[0]; if (!file) return;
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) { $("#derr").textContent = "El video pesa " + Math.round(file.size / 1048576) + " MB y el límite es " + MAX_VIDEO_MB + " MB. Comprímelo o súbelo a Cloudflare R2 y pega el enlace."; f.value = ""; return; }
        $("#derr").textContent = ""; s.textContent = "Subiendo " + Math.round(file.size / 1048576) + " MB…"; $("#dsave").disabled = true;
        S.upload(file, uploadPath("videos", file.name, (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4"))
          .then(function (u) { $("#v-src").value = u; localFile = file; gen.disabled = false; s.textContent = "Video subido"; })
          .catch(function (e) { s.textContent = ""; $("#derr").textContent = errMsg(e); })
          .then(function () { $("#dsave").disabled = false; });
      };
      gen.onclick = function () {
        if (!localFile) return;
        s.textContent = "Creando portada…"; gen.disabled = true;
        posterFrom(localFile).then(function (blob) { return S.upload(blob, uploadPath("posters", localFile.name, "jpg")); })
          .then(function (u) { $("#v-poster").value = u; var p = $("#v-poster-p"); p.src = u; p.hidden = false; s.textContent = "Portada creada"; })
          .catch(function (e) { s.textContent = ""; $("#derr").textContent = errMsg(e); })
          .then(function () { gen.disabled = false; });
      };
    });
  }

  /* Toma un fotograma a ~20 % del video local y lo convierte en JPG (el archivo es local, el canvas no se bloquea) */
  function posterFrom(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.preload = "auto";
      var fail = function () { URL.revokeObjectURL(url); rej(new Error("No se pudo leer el video para crear la portada.")); };
      v.onerror = fail;
      v.onloadedmetadata = function () { v.currentTime = Math.min(Math.max(v.duration * 0.2, 0.5), Math.max(v.duration - 0.1, 0)); };
      v.onseeked = function () {
        var k = Math.min(1, 1280 / v.videoWidth), c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); b ? res(b) : fail(); }, "image/jpeg", 0.85);
      };
      v.src = url;
    });
  }

  /* ----- Categorías ----- */
  function renderCats(v) {
    var html = '<div class="head"><h2>Categorías</h2><button class="btn" type="button" data-act="new-cat">+ Nueva categoría</button></div>' +
      '<p class="muted" style="margin-bottom:14px">Las categorías agrupan los eventos y generan los filtros de la página. El color se usa en las tarjetas sin foto.</p>';
    if (!st.cats.length) {
      html += '<div class="empty"><b>Aún no hay categorías</b>Crea la primera para poder publicar eventos.</div>';
    } else {
      html += '<div class="list">' + st.cats.map(function (c) {
        var n = st.events.filter(function (e) { return e.category_id === c.id; }).length;
        return '<article class="item item--cat"><span class="dot dot--lg" style="background:' + esc(c.color) + '"></span>' +
          '<div class="item__main"><div class="item__title">' + esc(c.name) + '</div><div class="item__meta"><span>' + n + ' evento' + (n === 1 ? '' : 's') + '</span><span>Orden ' + c.sort_order + '</span></div></div>' +
          '<div class="item__act"><button class="btn btn--text" type="button" data-act="edit-cat" data-id="' + c.id + '">Editar</button>' +
          '<button class="btn btn--text" type="button" data-act="del-cat" data-id="' + c.id + '">Eliminar</button></div></article>';
      }).join("") + '</div>';
    }
    v.innerHTML = html;
  }

  function catForm(c) {
    var isNew = !c; c = c || { color: "#ff6a13", sort_order: (st.cats.length ? Math.max.apply(null, st.cats.map(function (x) { return x.sort_order; })) + 1 : 1) };
    var body =
      '<div class="field"><label for="c-name">Nombre</label><input id="c-name" type="text" maxlength="40" required value="' + esc(c.name) + '"></div>' +
      '<div class="row2"><div class="field"><label for="c-color">Color</label><input id="c-color" type="color" value="' + esc(c.color) + '"></div>' +
      '<div class="field"><label for="c-ord">Orden</label><input id="c-ord" type="number" min="0" step="1" value="' + esc(c.sort_order) + '"></div></div>';
    openModal(isNew ? "Nueva categoría" : "Editar categoría", body, function () {
      var name = $("#c-name").value.trim();
      if (!name) throw new Error("Escribe el nombre de la categoría.");
      var row = { name: name, color: $("#c-color").value, sort_order: parseInt($("#c-ord").value, 10) || 0 };
      if (c.id) row.id = c.id;
      return S.save("categories", row);
    });
  }

  /* ---------- eventos de clic ---------- */
  function del(table, item, label, extra) {
    confirmBox("Eliminar " + label, "Vas a eliminar «" + (item.title || item.name) + "». " + (extra || "") + "Esta acción no se puede deshacer.").then(function (ok) {
      if (!ok) return;
      S.remove(table, item.id).then(refresh).then(function () { toast("Eliminado"); }).catch(function (e) { toast(errMsg(e), true); });
    });
  }
  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-tab]"); if (tab) { st.tab = tab.getAttribute("data-tab"); render(); return; }
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (act === "new-event") eventForm();
    else if (act === "edit-event") eventForm(byId(st.events, id));
    else if (act === "del-event") del("events", byId(st.events, id), "evento");
    else if (act === "new-video") videoForm();
    else if (act === "edit-video") videoForm(byId(st.videos, id));
    else if (act === "del-video") {
      var used = st.events.filter(function (x) { return x.video_id === id; }).length;
      del("videos", byId(st.videos, id), "video", used ? "Se quitará de " + used + " evento(s). " : "");
    }
    else if (act === "new-cat") catForm();
    else if (act === "edit-cat") catForm(byId(st.cats, id));
    else if (act === "del-cat") {
      var c = byId(st.cats, id), n = st.events.filter(function (x) { return x.category_id === id; }).length;
      if (n) { toast("«" + c.name + "» tiene " + n + " evento(s). Cámbialos de categoría antes de eliminarla.", true); return; }
      del("categories", c, "categoría");
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "q") { st.q = e.target.value; var pos = e.target.selectionStart; renderEvents($("#view")); var q = $("#q"); q.focus(); q.setSelectionRange(pos, pos); }
  });
  document.addEventListener("change", function (e) { if (e.target.id === "fcat") { st.cat = e.target.value; renderEvents($("#view")); $("#fcat").focus(); } });

  /* ---------- sesión ---------- */
  function showApp(user) {
    $("#login").hidden = true; $("#app").hidden = false;
    $("#who").textContent = user.email; $("#modebadge").hidden = S.mode !== "demo";
    st.loading = true; render(); refresh();
  }
  function showLogin() {
    $("#app").hidden = true; $("#login").hidden = false; $("#demonote").hidden = S.mode !== "demo";
    if (S.mode === "demo") { $("#email").required = false; $("#pass").required = false; }
  }
  $("#loginform").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("#loginbtn"), err = $("#loginerr"); err.textContent = "";
    var email = $("#email").value.trim(), pass = $("#pass").value;
    if (S.mode !== "demo" && (!email || !pass)) { err.textContent = "Escribe tu correo y contraseña."; return; }
    btn.disabled = true; btn.textContent = "Entrando…";
    S.signIn(email, pass).then(showApp).catch(function (x) { err.textContent = errMsg(x); }).then(function () { btn.disabled = false; btn.textContent = "Entrar"; });
  });
  $("#logout").addEventListener("click", function () { S.signOut().then(showLogin); });

  S.getUser().then(function (u) { if (u) showApp(u); else showLogin(); }).catch(showLogin);
})();
