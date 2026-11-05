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
    whatsapp: ""     // ej. "https://wa.me/593XXXXXXXXX"
  },

  // Videos en alta definición. NO se guardan en este repositorio.
  // Súbelos a un almacenamiento aparte (Cloudflare R2, Bunny Stream, Backblaze B2, YouTube no listado…)
  // y pega aquí la URL base pública. Cada video de js/data.js se carga como VIDEO_BASE_URL + archivo.
  // Si queda vacío, el feed muestra clips de ejemplo.
  videos: {
    baseUrl: ""      // ej. "https://videos.hoytecaigo.ec/"
  },

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
