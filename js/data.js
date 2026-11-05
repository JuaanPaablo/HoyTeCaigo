/*
 * Contenido editable: eventos, planes y videos.
 * Los eventos de abajo son de ejemplo. Reemplázalos por los reales.
 * Si cambias los eventos, actualiza también api/_knowledge.js para que el chatbot con IA los conozca.
 *
 * Evento: a = "tix" (venta de entradas) o "list" (lista gratis); url = enlace de compra o de la lista.
 * Colores c1/c2 y g (bolt | star | mic) definen la ilustración mientras no haya foto.
 * Si tienes foto del evento, ponla en assets/events/ y escribe img: "assets/events/archivo.jpg".
 */
window.HTC_EVENTS = [
  { t: "Neón Universitario", c: "Electrónica", d: "14", m: "Nov", day: "Sábado", h: "22:00", loc: "La Mariscal", dj: ["Kuri", "Mateo Ríos", "Sol B2B Nico"], p: "$8", a: "tix", url: "", c1: "#ff6a13", c2: "#ffd21f", g: "bolt" },
  { t: "Perreo Pop-Art", c: "Urbano", d: "20", m: "Nov", day: "Viernes", h: "21:30", loc: "Cumbayá", dj: ["DJ Zaida", "Lalo Beat", "MC Quito"], p: "$10", a: "tix", url: "", c1: "#ffd21f", c2: "#ff6a13", g: "star" },
  { t: "Café y Micro Abierto", c: "Social", d: "25", m: "Nov", day: "Miércoles", h: "18:30", loc: "La Floresta", dj: ["Micrófono abierto", "Host: Pame"], p: "Gratis", a: "list", url: "", c1: "#ffb347", c2: "#fff4bf", g: "mic" },
  { t: "Fiesta de Fin de Semestre", c: "Universitaria", d: "28", m: "Nov", day: "Sábado", h: "21:00", loc: "González Suárez", dj: ["Trío Sinapsis", "DJ Chuta", "Invitado sorpresa"], p: "$6", a: "tix", url: "", c1: "#ff6a13", c2: "#fff4bf", g: "star" },
  { t: "Retro 2000s", c: "Universitaria", d: "04", m: "Dic", day: "Viernes", h: "21:00", loc: "La Mariscal", dj: ["DJ Pixel", "Vale Vinilo"], p: "Gratis", a: "list", url: "", c1: "#ffd21f", c2: "#ffb347", g: "mic" },
  { t: "Techno en la Terraza", c: "Electrónica", d: "05", m: "Dic", day: "Sábado", h: "23:00", loc: "Cumbayá", dj: ["Anka", "Ro Vega", "Lumen"], p: "$12", a: "tix", url: "", c1: "#ff6a13", c2: "#ffd21f", g: "bolt" }
];

window.HTC_PLANS = [
  { k: "Café y micro", t: "Café y micrófono abierto", p: "Llegas sin compromiso, pides algo caliente y subes a decir lo tuyo: stand-up, poesía, música o un chiste. Ambiente chill para conocer gente.", f: [["Hora", "18:30"], ["Zona", "La Floresta"], ["Entrada", "Gratis"]], cta: "Anotarme en la lista" },
  { k: "Fiesta", t: "Noche de fiesta temática", p: "Dress code, DJs en vivo y pista llena. Cada fecha tiene su tema: neón, retro, urbano o electrónica.", f: [["Hora", "21:00"], ["Zona", "La Mariscal"], ["Entrada", "Desde $6"]], cta: "Ver fiestas" },
  { k: "Pre y after", t: "Pre, fiesta y after", p: "Empiezas con el grupo en el pre, sigues en la fiesta y cierras en el after. Te avisamos cada punto del recorrido.", f: [["Hora", "20:00 a 03:00"], ["Zona", "Cumbayá"], ["Entrada", "Desde $8"]], cta: "Ver fiestas" }
];

/*
 * Manifiesto de videos. Los archivos viven en tu almacenamiento externo, no aquí.
 * src: ruta del video respecto a HTC_CONFIG.videos.baseUrl (ej. "neon-universitario.mp4")
 * poster: miniatura liviana (jpg/webp) en la misma base. Opcional pero recomendada.
 * Los de abajo son clips de ejemplo sin archivo: se muestran como ilustración.
 */
window.HTC_VIDEOS = [
  { title: "Neón Universitario", cap: "La pista llena a las 11", views: "12,4 mil", src: "", poster: "", c1: "#ff6a13", c2: "#ffd21f" },
  { title: "Micro abierto", cap: "Pame y su primer stand-up", views: "8,1 mil", src: "", poster: "", c1: "#ffd21f", c2: "#ffb347" },
  { title: "Perreo Pop-Art", cap: "El drop que nadie esperaba", views: "21 mil", src: "", poster: "", c1: "#ffb347", c2: "#ff6a13" },
  { title: "Fin de semestre", cap: "Último brindis del ciclo", views: "6,7 mil", src: "", poster: "", c1: "#ff6a13", c2: "#fff4bf" },
  { title: "Retro 2000s", cap: "Todos cantando el mismo coro", views: "9,3 mil", src: "", poster: "", c1: "#ffd21f", c2: "#ff6a13" }
];
