/*
 * Contenido de respaldo: eventos, servicios y videos de ejemplo.
 * Si la página está conectada a Supabase (js/config.js), los eventos y videos salen del panel /admin
 * y esto solo se usa como respaldo. Los eventos de abajo son de ejemplo.
 * Si cambias los eventos, actualiza también api/_knowledge.js para que el chatbot con IA los conozca.
 *
 * Evento del portafolio:
 *   t título · c categoría (genera los filtros) · d/m/day/h fecha mostrada · loc ciudad o zona · dj artistas
 *   desc descripción corta · c1 color del marcador · img foto opcional ("assets/events/archivo.jpg")
 *   video archivo opcional del bucket (ej. "evento.mp4") para el botón "Ver video"
 *   iso (opcional) fecha real con zona, ej. "2026-12-05T23:00:00-05:00". Si pones un evento FUTURO con iso,
 *   aparece la barra amarilla "Próximo evento" con cuenta regresiva. Sin eventos futuros, esa barra no se muestra.
 */
window.HTC_EVENTS = [
  { t: "Festival Cultural de Primavera", c: "Culturales", d: "28", m: "Oct", day: "Miércoles", h: "18:30", loc: "Quito", dj: ["Artistas invitados", "Presenta: Pame"], desc: "Jornada de música, poesía y artes en vivo abierta a toda la ciudad.", video: "", c1: "#ffb347" },
  { t: "Feria Universitaria", c: "Universitarios", d: "23", m: "Oct", day: "Viernes", h: "10:00", loc: "Quito", dj: ["DJ Zaida", "MC Quito"], desc: "Encuentro de estudiantes de distintas universidades con escenario, stands y activaciones.", video: "", c1: "#ff6a13" },
  { t: "Gran Concierto Provincial", c: "Provinciales", d: "17", m: "Oct", day: "Sábado", h: "20:00", loc: "Cuenca", dj: ["Kuri", "Mateo Ríos", "Sol B2B Nico"], desc: "Producción de gran formato con escenario, sonido e iluminación para miles de asistentes.", video: "", c1: "#ffd21f" },
  { t: "Lanzamiento de Marca", c: "Corporativos", d: "10", m: "Oct", day: "Sábado", h: "19:00", loc: "Guayaquil", dj: ["Anka", "Ro Vega"], desc: "Evento de presentación para clientes y medios, con ambientación y show en vivo.", video: "", c1: "#ff6a13" },
  { t: "Encuentro Cultural", c: "Culturales", d: "09", m: "Oct", day: "Viernes", h: "19:00", loc: "Ambato", dj: ["DJ Pixel", "Vale Vinilo"], desc: "Noche de música y cultura local en un formato cercano para la comunidad.", video: "", c1: "#ffd21f" },
  { t: "Bienvenida Universitaria", c: "Universitarios", d: "03", m: "Oct", day: "Sábado", h: "21:00", loc: "Quito", dj: ["Trío Sinapsis", "DJ Chuta", "Invitado sorpresa"], desc: "Evento de inicio de ciclo para que los estudiantes de distintas universidades se encuentren.", video: "", c1: "#ff6a13" }
];

/* Qué hacemos: el selector "¿Qué quieres armar?" muestra estos servicios, por tamaño de evento. */
window.HTC_PLANS = [
  { k: "Eventos pequeños", t: "Eventos pequeños", p: "Encuentros, lanzamientos y reuniones de formato cercano. Cuidamos cada detalle: lugar, ambientación, artistas, sonido y convocatoria.", f: [["Formato", "Íntimo y cercano"], ["Ideal para", "Marcas, comunidades y grupos"], ["Cobertura", "Nacional"]], cta: "Cotizar un evento pequeño" },
  { k: "Eventos medianos", t: "Eventos medianos", p: "Producciones de tamaño medio con equipo completo: escenario, sonido, iluminación, logística y coordinación el día del evento.", f: [["Formato", "Producción completa"], ["Ideal para", "Universidades, empresas y municipios"], ["Cobertura", "Nacional"]], cta: "Cotizar un evento mediano" },
  { k: "Grandes eventos", t: "Grandes eventos", p: "Producciones de gran escala para miles de asistentes: planificación integral, logística, seguridad, artistas y montaje técnico.", f: [["Formato", "Gran escala"], ["Ideal para", "Festivales, conciertos y ferias"], ["Cobertura", "Nacional"]], cta: "Cotizar un gran evento" }
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
  { title: "Festival Cultural", cap: "Así se vivió", src: "", poster: "", c1: "#ffb347" },
  { title: "Feria Universitaria", cap: "Un día lleno de gente", src: "", poster: "", c1: "#ff6a13" },
  { title: "Gran Concierto", cap: "La noche del escenario", src: "", poster: "", c1: "#ffd21f" },
  { title: "Lanzamiento de Marca", cap: "Detrás de cámaras", src: "", poster: "", c1: "#ff6a13" },
  { title: "Encuentro Cultural", cap: "Cultura en vivo", src: "", poster: "", c1: "#ffd21f" }
];
