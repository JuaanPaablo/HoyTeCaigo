/* Función serverless (Vercel) para el chatbot con IA.
   La clave de la API vive solo aquí, como variable de entorno. Nunca en el navegador.

   POST /api/chat   { messages: [{ role: "user" | "assistant", content: "..." }] }
   →  { reply: "..." }

   Variables de entorno: ANTHROPIC_API_KEY (obligatoria), CHATBOT_MODEL, ALLOWED_ORIGIN (recomendada). */
const SYSTEM = require("./_knowledge");

const MODEL = process.env.CHATBOT_MODEL || "claude-haiku-5-5";
const MAX_MESSAGES = 10;
const MAX_CHARS = 500;

// Límite simple por IP (por instancia). Para producción real usa Upstash/Redis o el WAF de tu hosting.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 60_000, max = 12;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.origin && req.headers.origin !== allowed) {
    return res.status(403).json({ error: "Origen no permitido" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "Chatbot sin configurar" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(429).json({ error: "Demasiadas preguntas, intenta en un minuto" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const raw = Array.isArray(body && body.messages) ? body.messages : [];
  let messages = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Mensaje inválido" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages })
    });
    if (!r.ok) return res.status(502).json({ error: "El asistente no está disponible" });
    const data = await r.json();
    const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return res.status(200).json({ reply: reply || "No pude responder eso. ¿Me lo preguntas de otra forma?" });
  } catch {
    return res.status(502).json({ error: "El asistente no está disponible" });
  }
};
