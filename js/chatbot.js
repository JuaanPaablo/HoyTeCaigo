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

  var QUICK = ["¿Qué hacen?", "Eventos que han hecho", "Quiero cotizar un evento", "¿Dónde trabajan?"];
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
    document.body.classList.toggle("chat-open", on);   // oculta el botón de WhatsApp mientras el chat está abierto
    fab.setAttribute("aria-expanded", String(on));
    if (on) {
      if (!greeted) { greeted = true; add("assistant", "¡Hola! Soy el asistente de Hoy te Caigo. Pregúntame qué hacemos, qué eventos hemos producido o cómo cotizar uno."); }
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
  function line(e) { return "• " + e.t + " · " + e.d + " " + e.m + " · " + e.loc; }
  function socials() {
    var out = [];
    [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["whatsapp", "WhatsApp"]].forEach(function (n) {
      if (SOCIAL[n[0]]) out.push(n[1] + ": " + SOCIAL[n[0]]);
    });
    return out.length ? out.join("\n") : "Aún no hay redes publicadas.";
  }
  function localReply(q) {
    var t = norm(q);
    if (/(hola|buenas|hey|saludos)/.test(t)) return "¡Hola! Somos Hoy te Caigo, de Productora GS. Te cuento qué hacemos, qué eventos hemos producido o cómo cotizar uno.";
    if (/(entrada|boleto|comprar|precio|cuesta|cuanto|pagar|ticket)/.test(t)) return "Por ahora esta página es nuestro portafolio y no vendemos entradas. Si quieres un evento nuevo o una propuesta, escríbenos:\n" + socials();
    if (/(cotiz|contrat|auspic|marca|patrocin|contacto|alianza|propuesta|presupuesto|trabaj)/.test(t)) return "Cuéntanos tu idea, el público y la fecha, y armamos la propuesta. Escríbenos por:\n" + socials();
    if (/(que hacen|servicio|ofrecen|producen|hacen)/.test(t)) return "Somos Productora GS y producimos eventos pequeños, medianos y grandes en todo el Ecuador, además de activaciones para marcas. Nos encargamos de la idea, el lugar, los artistas, la logística y la convocatoria.";
    if (/(donde|ubicacion|zona|lugar|direccion|ciudad|pais|nacional|cobertura|quito|guayaquil|cuenca)/.test(t)) return "Tenemos cobertura a nivel nacional y nuestra matriz está en Quito. Algunos eventos que hemos producido:\n" + EVENTS.slice(0, 5).map(function (e) { return "• " + e.t + ": " + e.loc; }).join("\n");
    if (/(instagram|tiktok|facebook|redes|whatsapp|siguen|seguir|encuentro)/.test(t)) return "Nuestras redes:\n" + socials();
    if (/(video|vibra)/.test(t)) return "Mira la sección «La vibra» de la página: ahí están los videos de nuestros eventos.";
    if (/(evento|portafolio|han hecho|realizad|fiesta|trabajos|dj|artista)/.test(t)) return "Algunos eventos que hemos producido:\n" + EVENTS.map(line).join("\n") + "\nMira el portafolio completo en la página.";
    return "Puedo contarte qué hacemos, qué eventos hemos producido, dónde nos encuentras o cómo cotizar un evento. ¿Qué te interesa?";
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
