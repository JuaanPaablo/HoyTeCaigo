/* Chatbot de Hoy te Caigo.
   - Sin endpoint configurado: modo demo con respuestas locales (sin IA).
   - Con endpoint (HTC_CONFIG.chatbot.endpoint, ej. "/api/chat"): envía la conversación al servidor, que llama a la IA. */
(function () {
  "use strict";
  var CFG = (window.HTC_CONFIG || {}).chatbot || {};
  var EVENTS = window.HTC_EVENTS || [];
  var SOCIAL = (window.HTC_CONFIG || {}).social || {};
  var fab = document.getElementById("chatfab");
  var panel = document.getElementById("chatpanel");
  if (!CFG.enabled) { fab.hidden = true; return; }

  var log = document.getElementById("chatlog");
  var form = document.getElementById("chatform");
  var input = document.getElementById("chatin");
  var quick = document.getElementById("chatquick");
  var history = [];
  var busy = false;
  var greeted = false;

  document.getElementById("chatmode").textContent = CFG.endpoint ? "Asistente con IA" : "Modo demo, sin IA";

  var QUICK = ["¿Qué eventos hay?", "¿Cuánto cuestan las entradas?", "¿Cómo me anoto a la lista?", "Quiero auspiciar"];
  QUICK.forEach(function (q) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = q;
    b.addEventListener("click", function () { send(q); });
    quick.appendChild(b);
  });

  function add(role, text) {
    var d = document.createElement("div");
    d.className = "msg " + (role === "user" ? "msg--me" : "msg--bot");
    d.textContent = text;           // textContent: nunca interpreta HTML
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function open(on) {
    panel.hidden = !on;
    fab.setAttribute("aria-expanded", String(on));
    if (on) {
      if (!greeted) { greeted = true; add("assistant", "¡Hola! Soy el asistente de Hoy te Caigo. Pregúntame por eventos, entradas, listas o zonas."); }
      input.focus();
    } else { fab.focus(); }
  }
  fab.addEventListener("click", function () { open(panel.hidden); });
  document.getElementById("chatx").addEventListener("click", function () { open(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) open(false); });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open-chat]")) { e.preventDefault(); open(true); }
  });

  /* ---- Respuestas locales (modo demo) ---- */
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function line(e) { return "• " + e.t + " · " + e.day + " " + e.d + " " + e.m + ", " + e.h + " · " + e.loc + " · " + e.p; }
  function socials() {
    var out = [];
    [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["whatsapp", "WhatsApp"]].forEach(function (n) {
      if (SOCIAL[n[0]]) out.push(n[1] + ": " + SOCIAL[n[0]]);
    });
    return out.length ? out.join("\n") : "Aún no hay redes publicadas.";
  }
  function localReply(q) {
    var t = norm(q);
    if (/(hola|buenas|hey|saludos)/.test(t)) return "¡Hola! ¿Buscas plan para hoy? Te cuento de eventos, entradas o zonas.";
    if (/(auspic|marca|patrocin|contacto|alianza)/.test(t)) return "Para marcas y auspicios escríbenos por nuestras redes y armamos la propuesta:\n" + socials();
    if (/(lista|gratis)/.test(t)) {
      var free = EVENTS.filter(function (e) { return e.a === "list"; });
      return free.length ? "Estos eventos son con lista gratuita. Usa el botón «Anotarme en la lista» de cada tarjeta:\n" + free.map(line).join("\n") : "Por ahora no hay eventos con lista gratuita.";
    }
    if (/(entrada|boleto|comprar|precio|cuesta|cuanto|pagar)/.test(t)) return "Precios de los próximos eventos:\n" + EVENTS.map(function (e) { return "• " + e.t + ": " + e.p; }).join("\n") + "\nCompra desde el botón de cada tarjeta en la cartelera.";
    if (/(donde|ubicacion|zona|lugar|direccion|mariscal|cumbaya|floresta|gonzalez)/.test(t)) return "Hacemos eventos en La Mariscal, Cumbayá, La Floresta y González Suárez.\n" + EVENTS.map(function (e) { return "• " + e.t + ": " + e.loc; }).join("\n");
    if (/(instagram|tiktok|facebook|redes|whatsapp|siguen|seguir)/.test(t)) return "Nuestras redes:\n" + socials();
    if (/(evento|cartelera|hoy|noche|proximo|fiesta|plan|que hay|dj|lineup)/.test(t)) return "Próximos eventos:\n" + EVENTS.map(line).join("\n");
    return "Puedo ayudarte con eventos, precios, listas, zonas y redes. ¿Qué te interesa?";
  }

  /* ---- Servidor (con IA) ---- */
  function remoteReply() {
    return fetch(CFG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) })
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) {
      if (!d || typeof d.reply !== "string") throw new Error("Respuesta inválida");
      return d.reply;
    });
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    add("user", text);
    history.push({ role: "user", content: text });
    var wait = add("assistant", "Escribiendo…");
    var p = CFG.endpoint
      ? remoteReply().catch(function () { return "No pude conectarme con el asistente. Esto es lo que sé:\n\n" + localReply(text); })
      : Promise.resolve(localReply(text));
    p.then(function (reply) {
      wait.textContent = reply;
      history.push({ role: "assistant", content: reply });
    }).then(function () { busy = false; log.scrollTop = log.scrollHeight; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value; input.value = "";
    send(v);
  });
})();
