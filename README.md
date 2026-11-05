# Hoy te Caigo

Landing page-portafolio de **Hoy te Caigo**, productora de eventos, vida nocturna y fiestas temáticas universitarias en Quito, Ecuador.
Sitio estático (HTML, CSS y JavaScript puro, sin build) con una función serverless opcional para el chatbot.

## Estructura

```
index.html            Página
css/styles.css        Estilos (tokens de color y tipografía al inicio)
js/config.js          Redes, videos, formulario y chatbot  ← edita aquí primero
js/data.js            Eventos del portafolio, servicios y videos de ejemplo
js/app.js             Portafolio, filtros, servicios, feed y visor de video
js/chatbot.js         Widget de chat (modo demo o con IA)
api/chat.js           Función serverless que llama a la IA (Vercel)
api/_knowledge.js     Lo que sabe el chatbot con IA
assets/logo.png       Logo original (PNG con fondo transparente)
assets/og-image.png   Imagen de vista previa al compartir el link
```

## Editar contenido

- **Portafolio:** `js/data.js` → `HTC_EVENTS`. Los de ahora son de ejemplo. Cada evento admite `img` (foto en `assets/events/`) y `video` (archivo del bucket) para mostrar el botón «Ver video».
- **Servicios:** `js/data.js` → `HTC_PLANS` (el selector «¿Qué quieres armar?»).
- **Redes:** `js/config.js` → `social`. Facebook ya está cargado. **Instagram y TikTok** están vacíos: cuando existan, pega la URL y se activan solos en el footer. Mientras tanto aparecen como «Próximamente».
- Si cambias eventos o servicios, actualiza también `api/_knowledge.js` para que el chatbot con IA los conozca.

## Videos (Cloudflare R2, aparte del repositorio)

Los videos **no se suben a este repositorio** (`.gitignore` bloquea `*.mp4`, `*.mov`, etc.). Viven en el bucket de R2 cuya URL pública está en `js/config.js` → `videos.baseUrl`. La página solo descarga el video que alguien abre (`preload="none"`); las miniaturas usan solo los metadatos.

**Forma automática (sin tocar código):** sube al bucket los videos con estos nombres exactos:

```
clip-1.mp4   clip-2.mp4   clip-3.mp4   …   clip-10.mp4
```

La sección «La vibra» los detecta sola. Si no encuentra ninguno, muestra clips de ejemplo.

**Forma manual:** en `js/data.js` → `HTC_VIDEOS`, escribe `src` con el nombre real del archivo (y `poster` si tienes una miniatura `.jpg`). Así puedes ponerles título y descripción.

Recomendado: MP4 H.264, vertical 9:16, 720p y pocos segundos por clip.

> `pub-…r2.dev` es una URL pública pensada para pruebas y tiene límites. Cuando haya dominio, conecta uno propio al bucket (en Cloudflare: bucket → Settings → Custom domain) y cambia `videos.baseUrl`.

## Entérate de lo que viene (captura de contactos)

El formulario pide WhatsApp o correo y consentimiento. **No guarda nada hasta que pongas `leads.endpoint` en `js/config.js`**; mientras tanto le dice al usuario que aún no está conectado. Opciones para recibir los datos:

- **Formspree o similar:** crea un formulario y pega su URL. Es lo más rápido.
- **Google Apps Script:** una hoja de cálculo que recibe el POST.
- **Firebase (Firestore) o una función de Vercel:** si quieres tenerlo en tu propia base.

Envía `POST` JSON `{ name, contact, consent, source }`. Guarda solo lo necesario y ofrece borrar los datos a quien lo pida (ley de protección de datos personales de Ecuador).

## Próximo evento (opcional)

Si agregas un evento **futuro** con el campo `iso` (ejemplo `2026-12-05T23:00:00-05:00`; Ecuador es -05:00), aparece una barra amarilla con cuenta regresiva arriba del portafolio. Sin eventos futuros, la barra no se muestra.

## Vista previa al compartir (WhatsApp, Facebook)

`assets/og-image.png` (1200×630) y las etiquetas `og:` de `index.html` controlan cómo se ve el link al compartirlo. Usan la URL completa de Vercel (`https://hoytecaigo.vercel.app/…`) porque WhatsApp y Facebook no leen rutas relativas. **Al comprar el dominio, reemplaza `hoytecaigo.vercel.app` en `index.html`** (etiquetas `canonical`, `og:url`, `og:image` y `twitter:image`).

## Chatbot

- **Sin configurar:** funciona en modo demo con respuestas locales sobre servicios, eventos, zonas, redes y cómo cotizar.
- **Con IA:**
  1. En Vercel, *Settings → Environment Variables*: crea `ANTHROPIC_API_KEY` y `ALLOWED_ORIGIN` (el dominio de la página). Ver `.env.example`. La API de Anthropic se cobra por uso.
  2. En `js/config.js` pon `chatbot.endpoint: "/api/chat"`.

La clave de la API **nunca** va en el navegador ni en el repositorio. `api/chat.js` limita mensajes y frecuencia de forma básica; para tráfico alto agrega un límite de uso externo.

## Publicar

Vercel despliega solo cada vez que se sube un cambio a `main`. Nota: el plan gratuito de Vercel (Hobby) es para uso no comercial; revisa sus términos si la página empieza a generar ingresos.

## Pendientes

- Reemplazar los eventos de ejemplo por los reales, con fotos.
- Subir los videos al bucket (`clip-1.mp4`…) o listar sus nombres en `js/data.js`.
- Conectar el formulario (`leads.endpoint`).
- URLs de Instagram, TikTok y WhatsApp cuando existan.
- Dominio propio para la página y para los videos.
