/*
 * Contenido editable: portafolio de eventos, servicios y videos.
 * Los eventos de abajo son de ejemplo. Reemplázalos por los reales.
 * Si cambias los eventos, actualiza también api/_knowledge.js para que el chatbot con IA los conozca.
 *
 * Evento del portafolio:
 *   t título · c categoría (genera los filtros) · d/m/day/h fecha mostrada · loc zona · dj artistas
 *   desc descripción corta · c1 color del marcador · img foto opcional ("assets/events/archivo.jpg")
 *   video archivo opcional del bucket (ej. "neon.mp4") para el botón "Ver video"
 *   iso (opcional) fecha real con zona, ej. "2026-12-05T23:00:00-05:00". Si pones un evento FUTURO con iso,
 *   aparece la barra amarilla "Próximo evento" con cuenta regresiva. Sin eventos futuros, esa barra no se muestra.
 */
window.HTC_EVENTS = [
  { t: "Café y Micro Abierto", c: "Social", d: "28", m: "Oct", day: "Miércoles", h: "18:30", loc: "La Floresta", dj: ["Micrófono abierto", "Host: Pame"], desc: "Noche de stand-up, poesía y música en vivo para conocer gente en un ambiente tranquilo.", video: "", c1: "#ffb347" },
  { t: "Perreo Pop-Art", c: "Urbano", d: "23", m: "Oct", day: "Viernes", h: "21:30", loc: "Cumbayá", dj: ["DJ Zaida", "Lalo Beat", "MC Quito"], desc: "Fiesta urbana con estética pop-art, pista llena y artistas locales.", video: "", c1: "#ffd21f" },
  { t: "Neón Universitario", c: "Electrónica", d: "17", m: "Oct", day: "Sábado", h: "22:00", loc: "La Mariscal", dj: ["Kuri", "Mateo Ríos", "Sol B2B Nico"], desc: "Fiesta temática de neón con DJs de música electrónica y dress code fluorescente.", video: "", c1: "#ff6a13" },
  { t: "Techno en la Terraza", c: "Electrónica", d: "10", m: "Oct", day: "Sábado", h: "23:00", loc: "Cumbayá", dj: ["Anka", "Ro Vega", "Lumen"], desc: "Noche de techno al aire libre con vista a la ciudad.", video: "", c1: "#ff6a13" },
  { t: "Retro 2000s", c: "Universitaria", d: "09", m: "Oct", day: "Viernes", h: "21:00", loc: "La Mariscal", dj: ["DJ Pixel", "Vale Vinilo"], desc: "Los hits de los 2000 para cantar a todo pulmón con tu grupo de la universidad.", video: "", c1: "#ffd21f" },
  { t: "Bienvenida Universitaria", c: "Universitaria", d: "03", m: "Oct", day: "Sábado", h: "21:00", loc: "González Suárez", dj: ["Trío Sinapsis", "DJ Chuta", "Invitado sorpresa"], desc: "Fiesta de inicio de ciclo para que los estudiantes de distintas universidades se encuentren.", video: "", c1: "#ff6a13" }
];

/* Qué hacemos: el selector "¿Qué quieres armar?" muestra estos servicios. */
window.HTC_PLANS = [
  { k: "Fiestas temáticas", t: "Fiestas temáticas", p: "Diseñamos la noche completa: concepto, lugar, artistas, sonido, decoración y convocatoria. Cada fecha tiene su propio tema: neón, retro, urbano o electrónica.", f: [["Formato", "Pista, DJs y dress code"], ["Público", "Universitarios y grupos"], ["Zonas", "Todo Quito"]], cta: "Cotizar una fiesta" },
  { k: "Café y micro", t: "Encuentros y micrófono abierto", p: "Espacios más tranquilos para conversar, subir al micrófono y conocer gente: stand-up, poesía, música acústica y café.", f: [["Formato", "Micrófono abierto"], ["Público", "Estudiantes y comunidades"], ["Lugares", "Cafés y bares"]], cta: "Cotizar un encuentro" },
  { k: "Marcas", t: "Activaciones y auspicios", p: "Ponemos tu marca dentro de nuestros eventos o armamos uno a medida: degustaciones, sampling, concursos y presencia en pista.", f: [["Formato", "A medida"], ["Público", "Joven, de Quito"], ["Incluye", "Convocatoria en redes"]], cta: "Quiero una propuesta" }
];

/*
 * Videos. Los archivos viven en tu almacenamiento externo (R2), no aquí.
 *
 * Opción automática (sin tocar código): sube al bucket los videos con estos nombres exactos:
 *   clip-1.mp4, clip-2.mp4, clip-3.mp4 ... (hasta clip-10.mp4)
 * La página los detecta sola y los muestra. Si no encuentra ninguno, muestra los clips de ejemplo de abajo.
 *
 * Opción manual: completa src (y poster opcional) con el nombre real del archivo en el bucket.
 * Si no hay poster, la miniatura es el primer cuadro del video (solo descarga los metadatos).
 */
window.HTC_VIDEOS = [
  { title: "Neón Universitario", cap: "Así se vivió la pista", src: "", poster: "", c1: "#ff6a13" },
  { title: "Micro abierto", cap: "Stand-up y buena vibra", src: "", poster: "", c1: "#ffd21f" },
  { title: "Perreo Pop-Art", cap: "La noche urbana", src: "", poster: "", c1: "#ffb347" },
  { title: "Bienvenida", cap: "Inicio de ciclo", src: "", poster: "", c1: "#ff6a13" },
  { title: "Retro 2000s", cap: "Todos cantando el mismo coro", src: "", poster: "", c1: "#ffd21f" }
];
