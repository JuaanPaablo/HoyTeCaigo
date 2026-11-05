# Hoy te Caigo

Landing page de **Hoy te Caigo**: eventos, vida nocturna y fiestas temáticas universitarias en Quito, Ecuador.
Sitio estático (HTML, CSS y JavaScript puro, sin build) con una función serverless opcional para el chatbot.

## Estructura

```
index.html            Página
css/styles.css        Estilos (tokens de color y tipografía al inicio)
js/config.js          Redes, almacenamiento de videos y chatbot  ← edita aquí primero
js/data.js            Eventos, planes del día y manifiesto de videos
js/app.js             Cartelera, filtros, plan, feed y visor de video
js/chatbot.js         Widget de chat (modo demo o con IA)
api/chat.js           Función serverless que llama a la IA (Vercel)
api/_knowledge.js     Lo que sabe el chatbot con IA
assets/logo.jpg       Logo
```

## Ver la página en local

Abre `index.html` en el navegador. Para probar el chatbot con IA necesitas el servidor de Vercel:

```bash
npm i -g vercel
vercel dev
```

## Editar contenido

- **Eventos:** `js/data.js` → `HTC_EVENTS`. Cada evento admite `url` (enlace de compra o de la lista) e `img` (foto en `assets/events/`). Los de ahora son de ejemplo.
- **Redes:** `js/config.js` → `social`. Facebook ya está cargado. **Instagram y TikTok** están vacíos: cuando existan, pega la URL y se activan solos en el footer, sin tocar nada más. Mientras tanto aparecen como «Próximamente».
- Si cambias eventos, actualiza también `api/_knowledge.js` para que el chatbot con IA los conozca.

## Videos en alta definición (almacenamiento aparte)

Los videos **no se suben a este repositorio** (`.gitignore` bloquea `*.mp4`, `*.mov`, etc.). Guárdalos en un servicio de archivos y la página solo carga el que alguien abre, con `preload="none"`.

Opciones habituales, de menor a mayor costo de gestión:

1. **YouTube o Vimeo (no listado):** gratis, pero el reproductor no se integra igual de limpio.
2. **Cloudflare R2:** almacenamiento sin cobro de salida de datos, ideal para videos.
3. **Bunny Stream:** convierte a varias calidades y entrega por CDN.

Pasos con almacenamiento de archivos (R2, B2, Bunny Storage):

1. Convierte cada video a MP4 H.264 (de 720p a 1080p, vertical 9:16) y crea una miniatura `.jpg` liviana.
2. Súbelos al bucket y activa acceso público (CDN) o un dominio propio.
3. En `js/config.js` pon `videos.baseUrl` con la URL pública del bucket, terminada en `/`.
4. En `js/data.js` → `HTC_VIDEOS`, escribe `src` (y `poster`) con la ruta del archivo dentro del bucket.

## Chatbot

- **Sin configurar:** funciona en modo demo con respuestas locales sobre eventos, precios, listas, zonas y redes.
- **Con IA:**
  1. Despliega el repositorio en Vercel (importa el repo desde GitHub).
  2. En *Settings → Environment Variables* crea `ANTHROPIC_API_KEY` (y `ALLOWED_ORIGIN` con el dominio de la página). Ver `.env.example`.
  3. En `js/config.js` pon `chatbot.endpoint: "/api/chat"`.

La clave de la API **nunca** va en el navegador ni en el repositorio. `api/chat.js` limita mensajes y frecuencia de forma básica; para tráfico alto agrega un límite de uso externo.

## Publicar

- **Vercel (recomendado):** sirve la página y el chatbot juntos.
- **GitHub Pages:** sirve solo la parte estática (el chatbot quedará en modo demo).

## Pendientes

- Reemplazar eventos, precios y line-ups de ejemplo por los reales.
- Enlaces de compra y listas por evento.
- URLs de Instagram, TikTok y WhatsApp cuando existan.
- Términos de compra, reembolsos y reglas de ingreso (los enlaces del footer están pendientes).
- Fotos y videos reales.
