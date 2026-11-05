/*
 * Configuración central de Hoy te Caigo.
 * Cambia aquí las redes, el almacenamiento de videos y el chatbot.
 * No pongas claves secretas en este archivo: es público en el navegador.
 */
window.HTC_CONFIG = {
  // Redes sociales. Deja "" en las que aún no existen: la página las muestra
  // como "Próximamente" y se activan solas cuando pegues la URL.
  social: {
    facebook: "https://www.facebook.com/GSproduccionesyeventos/",
    instagram: "",   // ej. "https://www.instagram.com/hoytecaigo/"
    tiktok: "",      // ej. "https://www.tiktok.com/@hoytecaigo"
    whatsapp: ""     // el número, con o sin código de país: "0991234567" o "593991234567" (o un enlace wa.me)
  },

  // Videos en alta definición. NO se guardan en este repositorio.
  // Súbelos a un almacenamiento aparte (Cloudflare R2, Bunny Stream, Backblaze B2, YouTube no listado…)
  // y pega aquí la URL base pública. Cada video de js/data.js se carga como VIDEO_BASE_URL + archivo.
  // Si queda vacío, el feed muestra clips de ejemplo.
  videos: {
    baseUrl: "https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/"   // bucket público de Cloudflare R2
  },

  // Panel de contenido (/admin). Pega aquí la URL del proyecto de Supabase y su clave PÚBLICA
  // ("Publishable key" sb_publishable_… o la antigua "anon public"). Es pública por diseño.
  // NUNCA pegues aquí la "Secret key" (sb_secret_…) ni la "service_role": darían control total de la base.
  // Con esto la página lee eventos, categorías y videos de la base. Sin esto usa js/data.js y el panel va en modo demo.
  supabase: {
    url: "https://zejarsjhgjxkbpjrkfcf.supabase.co",
    anonKey: "sb_publishable_gmp7Gq7d79DSoQNgNZRSzQ_UB4KJC74"   // clave pública (publishable)
  },

  // Mapa de cobertura. Se pintan TODAS las provincias de las regiones de "regions" (sierra, costa, oriente)
  // y además las provincias sueltas de "provinces" (usa el id: "esmeraldas", "manabi", "guayas", "santa-elena",
  // "el-oro", "los-rios", "santo-domingo-de-los-tsachilas", "sucumbios", "napo", "orellana", "pastaza",
  // "morona-santiago", "zamora-chinchipe", "galapagos"...). Estos valores son de EJEMPLO hasta tener los reales.
  coverage: {
    regions: ["sierra"],
    provinces: ["esmeraldas", "manabi", "guayas", "santa-elena", "el-oro", "pastaza"]
  },

  // Mensaje que aparece escrito cuando alguien abre WhatsApp desde la página
  whatsappMessage: "Hola, quiero cotizar un evento con Productora GS.",

  // Formulario "Avísame". Envía un POST JSON { name, contact, source, consent } a este endpoint.
  // Opciones sin servidor propio: Formspree, un Google Apps Script que escriba en una hoja,
  // o una función de Firebase/Vercel. Mientras esté vacío, el formulario avisa que aún no está conectado
  // y NO guarda nada.
  leads: {
    endpoint: ""     // ej. "https://formspree.io/f/xxxxxxx"
  },

  // Chatbot. Mientras "endpoint" esté vacío funciona en modo demo (respuestas locales sin IA).
  // Para activar la IA, despliega api/chat.js (ver README) y pon aquí su ruta.
  chatbot: {
    enabled: true,
    endpoint: ""     // ej. "/api/chat"
  }
};
