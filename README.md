# Hoy te Caigo

Landing page-portafolio de **Hoy te Caigo**, marca de **Productora GS**: eventos pequeños, medianos y grandes, con cobertura a nivel nacional y matriz en Quito, Ecuador.
Sitio estático (HTML, CSS y JavaScript puro, sin build) con una función serverless opcional para el chatbot.

## Estructura

```
index.html            Página
css/styles.css        Estilos (tokens de color y tipografía al inicio)
js/config.js          Redes, videos, formulario y chatbot  ← edita aquí primero
js/data.js            Eventos del portafolio, servicios y videos de ejemplo
js/app.js             Portafolio, filtros, servicios, feed y visor de video
js/chatbot.js         Widget de chat (modo demo o con IA)
js/boot.js            Arranque: trae los datos del panel (si está configurado) y luego carga app.js
admin/                Panel de contenido para marketing (/admin)
supabase/schema.sql   Base de datos, permisos y datos iniciales del panel
api/chat.js           Función serverless que llama a la IA (Vercel)
api/_knowledge.js     Lo que sabe el chatbot con IA
assets/logo.png       Logo original (PNG con fondo transparente)
assets/og-image.png   Imagen de vista previa al compartir el link
```

## Panel de contenido para marketing (/admin)

Permite al equipo de marketing **crear, editar y eliminar eventos, categorías y videos** sin tocar código, y subir fotos y videos desde el navegador. Está en `https://TU-SITIO/admin/`.

**Sin configurar** el panel funciona en **modo demo**: guarda los cambios solo en el navegador de quien lo prueba y la página pública sigue usando `js/data.js`. Para que sea real y compartido hay que conectar una base de datos (Supabase, plan gratuito, sin tarjeta):

1. Crea una cuenta y un proyecto en supabase.com (elige región cercana, por ejemplo São Paulo).
2. **SQL Editor → New query:** pega todo `supabase/schema.sql` y pulsa **Run**. Crea las tablas, los permisos y deja los eventos y videos de ejemplo cargados.
3. **Authentication → Providers → Email:** desactiva **Allow new users to sign up** (así nadie se registra por su cuenta).
4. **Authentication → Users → Add user:** crea un usuario con correo y contraseña para cada persona de marketing (marca «Auto Confirm User»).
5. **Project Settings → API:** copia la **Project URL** y la clave **anon public** en `js/config.js` → `supabase.url` y `supabase.anonKey`. **Nunca** pegues la `service_role`.
6. Sube el cambio a GitHub; Vercel lo publica. Entra a `/admin/` con el correo y la contraseña del paso 4.

Cómo funciona:

- La página pública lee solo lo **publicado**; el equipo con sesión ve y edita todo, incluidos los borradores. Las reglas están en `supabase/schema.sql` (RLS), por eso la clave `anon` puede ser pública.
- Si la base tarda más de 4 s o falla, la página usa los datos de `js/data.js`, así nunca queda vacía.
- Las fotos se reducen a 1600 px al subirlas. Los videos subidos desde el panel van a Supabase Storage (tope de 50 MB por archivo en el plan gratuito). Para videos más pesados, súbelos a Cloudflare R2 y pega el enlace en el formulario.
- El panel puede crear la portada de un video subido desde el propio navegador.
- Los clips de R2 que ya existen quedan cargados como videos en la base. Cámbiales el título desde el panel.

Límites del plan gratuito de Supabase (verifica los vigentes en su página de precios): los proyectos **se pausan tras una semana sin actividad** y hay que reactivarlos a mano. Mientras esté pausado, la página sigue funcionando con `js/data.js`, pero el panel no. Tener visitas o usar el panel con frecuencia evita la pausa; un pase a plan de pago la elimina.

El chatbot con IA aún lee los eventos de `api/_knowledge.js`; el chatbot en modo demo sí usa los eventos del panel.

## Editar contenido (sin panel)

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

El formulario pide WhatsApp o correo y consentimiento.

**Con Supabase configurado (recomendado)** guarda cada contacto en la tabla `leads`. Si tu base ya existía antes de esta función, ejecuta **una vez** `supabase/leads.sql` en el SQL Editor (una base nueva ya lo incluye en `schema.sql`). Marketing los ve en la pestaña **Contactos** del panel: abre WhatsApp o correo con un clic, marca el estado (nuevo, contactado, descartado), elimina y exporta a CSV. Los visitantes solo pueden enviar un contacto; nadie sin sesión puede leerlos.

**Sin Supabase** no guarda nada hasta que pongas `leads.endpoint` en `js/config.js`; mientras tanto le dice al usuario que aún no está conectado. Opciones para recibir los datos:

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

## Animaciones

Están separadas del resto: `css/motion.css` (cómo se mueve todo) y `js/motion.js` (qué aparece al hacer scroll). Para quitarlas por completo basta con borrar la línea de `motion.css` en `index.html` y `"js/motion.js"` en `js/boot.js`.

- **Entrada del hero:** el texto se arma en orden, el logo entra con un golpe de cómic y una onda amarilla, y los íconos aparecen uno por uno.
- **Ambiente:** los íconos flotan, el logo «respira» muy despacio y el fondo de puntos baja lentamente.
- **Al hacer scroll:** secciones, tarjetas, pasos, videos y bloques aparecen con un movimiento corto y escalonado. Solo se esconde lo que está debajo de la pantalla al cargar.
- **Al tocar o pasar el cursor:** las fotos de las tarjetas se acercan, la fecha se inclina, el botón de play de los videos late.
- **Al cambiar contenido:** filtrar el portafolio o cambiar de servicio entra con una transición corta.
- **Accesibilidad:** si el visitante tiene activado «reducir movimiento» en su dispositivo, no se anima nada y todo se ve completo desde el inicio. Solo se animan `transform` y `opacity`, para que vaya fluido en celulares.

## Publicar

Vercel despliega solo cada vez que se sube un cambio a `main`. Nota: el plan gratuito de Vercel (Hobby) es para uso no comercial; revisa sus términos si la página empieza a generar ingresos.

## Pendientes

- Reemplazar los eventos de ejemplo por los reales, con fotos.
- Subir los videos al bucket (`clip-1.mp4`…) o listar sus nombres en `js/data.js`.
- Conectar el formulario (`leads.endpoint`).
- URLs de Instagram, TikTok y WhatsApp cuando existan.
- Dominio propio para la página y para los videos.
