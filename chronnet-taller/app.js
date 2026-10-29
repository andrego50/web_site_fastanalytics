/* =====================================================================
   Chronnet Show — página de presentación del taller con motor 3D real
   FastAnalytics S.A.S. — Taller Construcción y analítica de redes criminales
   Motor: assets3d/chronnet3d.js (bundle autocontenido, three embebido)
   ===================================================================== */

let LANG = 'es';
const T = (bi) => (typeof bi === 'string' ? bi : bi[LANG]);

/* Metadatos de las 8 escenas (títulos vienen del catálogo del presentador). */
const KICKERS = [
  { es: 'Apertura', en: 'Opening' },
  { es: 'M1 · Datos', en: 'M1 · Data' },
  { es: 'M2 · Chronnet', en: 'M2 · Chronnet' },
  { es: 'M3 · Estructura', en: 'M3 · Structure' },
  { es: 'M4 · Comunidades', en: 'M4 · Communities' },
  { es: 'M5 · Actores clave', en: 'M5 · Key players' },
  { es: 'M6 · Disrupción', en: 'M6 · Disruption' },
  { es: 'Cierre', en: 'Closing' },
];
const DESCS = [
  { es: 'La red invisible: nueve regiones del mapa se conectan hilo a hilo hasta revelar la red mundial, el lema y las cifras del análisis.',
    en: 'The invisible network: nine regions of the map connect thread by thread until the world network, the motto and the analysis figures are revealed.' },
  { es: 'Las fichas de miles de reportes se ordenan hasta formar el expediente: 4.501 filas, 534 SAR, 2.275 bancos, 129 países y el monto total documentado.',
    en: 'The cards of thousands of filings sort themselves into the case file: 4,501 rows, 534 SARs, 2,275 banks, 129 countries and the total documented amount.' },
  { es: 'Cinco aristas dirigidas nacen de la regla de consecutividad — y un contraejemplo muestra cuándo NO nace relación. Cifras reales de la red Chronnet.',
    en: 'Five directed edges are born from the consecutiveness rule — and a counterexample shows when a relation is NOT born. Real figures of the Chronnet network.' },
  { es: 'El grafo estructural: componente gigante (1.863 nodos), 175 componentes aislados y sus métricas, una por paso. Red de demostración, cifras reales.',
    en: 'The structural graph: giant component (1,863 nodes), 175 isolated components and their metrics, one per step. Demonstration network, real figures.' },
  { es: '246 comunidades (Fast Greedy, Q=0,907): un archipiélago de islas bien separadas, una de 135 bancos y mediana de tamaño 2.',
    en: '246 communities (Fast Greedy, Q=0.907): an archipelago of well-separated islands, one of 135 banks and median size 2.' },
  { es: 'Grado, fuerza e intermediación sobre el mapa; el top-15 real de blancos del módulo 6 y el percentil 90 como prioridad de análisis — nunca culpabilidad.',
    en: 'Degree, strength and betweenness over the map; the real top-15 targets of module 6 and the 90th percentile as analysis priority — never guilt.' },
  { es: 'KB, DEG y BTW ordenan retiros distintos sobre la misma red sintética: primero aislar puentes, después desorganizar núcleos. Dato real: CI tuvo peor AUC (0,793/0,787) que KB/DEG/BTW.',
    en: 'KB, DEG and BTW produce different removal orders on the same synthetic network: isolate bridges first, then disrupt cores. Real finding: CI had worse AUC (0.793/0.787) than KB/DEG/BTW.' },
  { es: '¿Qué observamos? ¿Qué hipótesis genera? ¿Qué debemos verificar? Los modelos priorizan preguntas; no determinan culpabilidad.',
    en: 'What do we observe? What hypothesis does it raise? What must we verify? Models prioritize questions; they do not determine guilt.' },
];
const CODIGO = [
  [{ es: 'index ↗', en: 'index ↗' }, 'taller/index.html'],
  [{ es: '00_datos ↗', en: '00_data ↗' }, 'taller/00_datos.html'],
  [{ es: '01_cronologica ↗', en: '01_chronological ↗' }, 'taller/01_cronologica.html'],
  [{ es: '02_exploratorio ↗', en: '02_exploratory ↗' }, 'taller/02_exploratorio.html',
   { es: '03_topologia ↗', en: '03_topology ↗' }, 'taller/03_topologia.html'],
  [{ es: '03_topologia ↗', en: '03_topology ↗' }, 'taller/03_topologia.html',
   { es: 'índice ↗', en: 'index ↗' }, 'taller/index.html'],
  [{ es: '04_actores_clave ↗', en: '04_key_players ↗' }, 'taller/04_actores_clave.html'],
  [{ es: '05_disrupcion ↗', en: '05_disruption ↗' }, 'taller/05_disrupcion.html'],
  [{ es: 'index ↗', en: 'index ↗' }, 'taller/index.html'],
];
const AVISOS = {
  es: ['Sospecha ≠ delito', 'Presencia en la red ≠ culpabilidad', 'Dataset filtrado · uso académico'],
  en: ['Suspicion ≠ crime', 'Presence in the network ≠ guilt', 'Leaked dataset · academic use'],
};

/* ============================== ESTADO ============================== */
const $ = (id) => document.getElementById(id);
let p = null;            // presentador chronnet3d
let escenaActual = -1;
let enMenu = true;
let materialMode = false;
let estadoPrevioMaterial = 'detenido'; // para retomar la reproducción al volver del material

/* ============================== UI: MENÚ ============================== */
function construirMenu() {
  const grid = $('mgrid');
  grid.textContent = '';
  p.escenas.forEach((escena, i) => {
    const card = document.createElement('div');
    card.className = 'mcard ' + (i === 0 || i === 7 ? 'concepto' : 'datos');
    card.dataset.i = String(i);
    const num = document.createElement('div');
    num.className = 'num';
    num.textContent = String(i).padStart(2, '0');
    const k = document.createElement('div');
    k.className = 'k';
    k.textContent = T(KICKERS[i]);
    const h3 = document.createElement('h3');
    h3.textContent = T(escena.titulo);
    const desc = document.createElement('p');
    desc.textContent = T(DESCS[i]);
    card.append(num, k, h3, desc);
    // Enlaces al código Quarto del módulo (1 o 2 por tarjeta).
    for (let c = 0; c < CODIGO[i].length; c += 2) {
      const a = document.createElement('a');
      a.className = 'codigo';
      a.href = CODIGO[i][c + 1];
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = T(CODIGO[i][c]);
      a.addEventListener('click', (e) => e.stopPropagation());
      card.appendChild(a);
      if (c + 2 < CODIGO[i].length) card.appendChild(document.createTextNode(' · '));
    }
    card.addEventListener('click', () => abrirEscena(i));
    grid.appendChild(card);
  });
}

function construirChips() {
  const row = $('chipRow');
  row.textContent = '';
  for (const aviso of AVISOS[LANG]) {
    const chip = document.createElement('span');
    chip.className = 'chipwarn';
    chip.textContent = aviso;
    row.appendChild(chip);
  }
}

/* ============================== UI: ESCENA ============================== */
function mostrarMenu() {
  enMenu = true;
  $('menu').classList.add('open');
  $('stageWrap').classList.remove('open');
  $('simbar').classList.remove('open');
  p.fijarActivo(false);
  $('sceneKicker').textContent = 'CHRONNET SHOW';
  $('sceneTitle').textContent = LANG === 'es' ? 'Portada' : 'Cover';
}

async function abrirEscena(i, autoplay = true) {
  enMenu = false;
  $('menu').classList.remove('open');
  $('stageWrap').classList.add('open');
  if (materialMode) toggleMaterial(); // volver al 3D antes de cambiar de escena
  p.fijarActivo(true);
  escenaActual = i;
  $('sceneKicker').textContent = `${String(i).padStart(2, '0')} · ${T(KICKERS[i])}`;
  $('sceneTitle').textContent = T(p.escenas[i].titulo);
  pintarEnlaceMaterial();
  await p.cargarEscena(i);
  const simbar = $('simbar');
  simbar.classList.toggle('open', simbar.children.length > 0);
  if (autoplay) p.reproducir();
  pintarPaso(p.pasoActual(), p.totalPasos());
}

/* Señal de correspondencia: enlace permanente a la página Quarto de la escena. */
function pintarEnlaceMaterial() {
  const enlace = $('matLink');
  if (!enlace) return;
  if (escenaActual < 0) { enlace.style.display = 'none'; return; }
  const destino = CODIGO[escenaActual][1];
  enlace.style.display = '';
  enlace.href = destino;
  enlace.dataset.dest = destino;
  enlace.textContent =
    (LANG === 'es' ? 'Material de esta escena: ' : 'Material for this scene: ') +
    destino.replace('taller/', '') + ' ↗';
}

function pintarPaso(paso, total) {  const info = p.escenas[escenaActual];
  const cap = info && info.pasos[paso] ? T(info.pasos[paso].cap) : '';
  $('capText').textContent = cap;
  // El nombre de la página Quarto acompaña el paso: en charla, primero la
  // animación y luego la explicación del material con el mismo nombre.
  const mat = escenaActual >= 0 ? CODIGO[escenaActual][1].replace('taller/', '') : '';
  const etiqueta = total > 0 ? `${LANG === 'es' ? 'Paso' : 'Step'} ${paso}/${total}` : '—';
  $('caption').querySelector('.stepno').textContent = mat ? `${mat} · ${etiqueta}` : etiqueta;
  $('stepCount').textContent = mat ? `${mat} · ${paso} / ${total}` : `${paso} / ${total}`;
}

function pintarProgreso(prog) {
  const pct = `${(prog * 100).toFixed(1)}%`;
  $('progFill').style.width = pct;
  $('progDot').style.left = pct;
}

function pintarEstado(estado) {
  $('playBtn').textContent = estado === 'reproduciendo' ? '⏸' : '▶';
}

/* ============================== MATERIAL ⇄ 3D ============================== */
function toggleMaterial() {
  materialMode = !materialMode;
  const frame = $('matFrame');
  if (materialMode) {
    // Carga el material de la escena actual (señal de correspondencia).
    const dest = escenaActual >= 0 ? CODIGO[escenaActual][1] : 'taller/index.html';
    if (frame.dataset.dest !== dest) { frame.src = './' + dest; frame.dataset.dest = dest; }
    frame.classList.add('open');
    $('cv').style.display = 'none';
    $('hints').style.display = 'none';
    $('matTab').classList.add('open');
    $('matBack').classList.add('open');
    $('matBtn').classList.add('on');
    estadoPrevioMaterial = p.estado();     // ¿reproducía antes de abrir el material?
    p.fijarActivo(false); // el 3D se pausa mientras está oculto
  } else {
    frame.classList.remove('open');
    $('cv').style.display = '';
    $('hints').style.display = '';
    $('matTab').classList.remove('open');
    $('matBack').classList.remove('open');
    $('matBtn').classList.remove('on');
    // Vuelve al lugar exacto: mismo paso y, si estaba reproduciendo, sigue.
    if (!enMenu && estadoPrevioMaterial === 'reproduciendo') p.reproducir();
    else if (!enMenu) p.fijarActivo(true);
  }
}

/* ============================== IDIOMA ============================== */
function applyLang() {
  document.querySelectorAll('[data-es]').forEach((el) => {
    el.textContent = el.dataset[LANG];
  });
  $('langBtn').textContent = LANG === 'es' ? 'EN' : 'ES';
  construirMenu();
  construirChips();
  if (escenaActual >= 0) {
    $('sceneKicker').textContent = `${String(escenaActual).padStart(2, '0')} · ${T(KICKERS[escenaActual])}`;
    $('sceneTitle').textContent = T(p.escenas[escenaActual].titulo);
    pintarPaso(p.pasoActual(), p.totalPasos());
    pintarEnlaceMaterial();
  }
}

/* ============================== MEDIOS ============================== */
// Clips Blender disponibles en media/. El pipeline de renders los entrega de
// a uno: al llegar un archivo nuevo, el orquestador lo añade a esta lista (y
// la página lo conecta sola); los demás quedan con su badge "EN PRODUCCIÓN".
const MEDIOS_DISPONIBLES = new Set([
  'media/clip1_la_red_del_lavado.mp4',
  'media/clip2_el_raid.mp4',
  'media/clip3_actores_clave.mp4',
  'media/still_portada.png',
  'media/still_lema.png',
  'media/still_cierre.png',
]);

function conectarMedios() {
  for (const el of document.querySelectorAll('[data-media]')) {
    if (!MEDIOS_DISPONIBLES.has(el.dataset.media)) continue;
    el.src = el.dataset.media;
    const badge = el.parentElement.querySelector('.badge');
    if (badge) badge.style.display = 'none';
  }
}

/* ============================== ARRANQUE ============================== */
async function boot() {
  const q = new URLSearchParams(location.search);
  if (q.get('lang') === 'en') LANG = 'en';

  const { init } = await import('./assets3d/chronnet3d.js');
  p = await init($('cv'), {
    tema: 'claro',
    idioma: LANG,
    baseUrl: './assets3d/',
    contenedorEtiquetas: $('canvasBox'),
    contenedorControles: $('simbar'),
  });
  window.__chronnet = p; // manija de depuración/pruebas

  p.suscribir({
    alCambiarPaso: (paso, total) => pintarPaso(paso, total),
    alCambiarProgreso: (prog) => pintarProgreso(prog),
    alCambiarEstado: (estado) => pintarEstado(estado),
    alCambiarEscena: (i) => {
      // Sincroniza cabecera/caption aunque el cambio venga del propio motor
      // (botón "Entrar al laboratorio" de E00, deep links, etc.).
      escenaActual = i;
      $('sceneKicker').textContent = `${String(i).padStart(2, '0')} · ${T(KICKERS[i])}`;
      $('sceneTitle').textContent = T(p.escenas[i].titulo);
      pintarPaso(p.pasoActual(), p.totalPasos());
      const simbar = $('simbar');
      simbar.classList.toggle('open', simbar.children.length > 0);
    },
  });

  applyLang();
  conectarMedios();
  pintarProgreso(0);

  // Controles del presentador.
  $('playBtn').addEventListener('click', () => p.alternar());
  $('nextBtn').addEventListener('click', () => p.pasoSiguiente());
  $('prevBtn').addEventListener('click', () => p.pasoAnterior());
  $('nextSceneBtn').addEventListener('click', () => irEscena(1));
  $('prevSceneBtn').addEventListener('click', () => irEscena(-1));
  $('menuBtn').addEventListener('click', mostrarMenu);
  $('codeBtn').addEventListener('click', () => window.open('taller/', '_blank', 'noopener'));
  $('matBtn').addEventListener('click', toggleMaterial);
  $('matBack').addEventListener('click', toggleMaterial);
  $('langBtn').addEventListener('click', () => {
    LANG = LANG === 'es' ? 'en' : 'es';
    p.fijarIdioma(LANG);
    applyLang();
  });
  $('fsBtn').addEventListener('click', alternarPantallaCompleta);
  // sndBtn queda inerte a propósito (sin banda sonora en la página).

  $('prog').addEventListener('click', (e) => {
    const caja = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width));
    saltarA(Math.round(frac * p.totalPasos()));
  });

  window.addEventListener('keydown', (e) => {
    if (enMenu || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'Escape' && materialMode) { toggleMaterial(); return; }
    switch (e.key) {
      case ' ':
        e.preventDefault();
        p.alternar();
        break;
      case 'ArrowRight':
        e.preventDefault();
        p.pasoSiguiente();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        p.pasoAnterior();
        break;
      case 'f':
      case 'F':
        alternarPantallaCompleta();
        break;
      case ']':
        irEscena(1);
        break;
      case '[':
        irEscena(-1);
        break;
    }
  });

  // Deep links: ?scene=N&step=K
  const sid = q.get('scene');
  if (sid !== null && p.escenas[Number(sid)]) {
    await abrirEscena(Number(sid), false);
    const st = Math.min(Number(q.get('step') || 0), p.totalPasos());
    saltarA(st);
  }
}

function irEscena(delta) {
  if (escenaActual < 0) return;
  const n = (escenaActual + delta + p.escenas.length) % p.escenas.length;
  void abrirEscena(n);
}

function saltarA(paso) {
  let guardia = 64;
  while (p.pasoActual() < paso && guardia-- > 0) p.pasoSiguiente();
  while (p.pasoActual() > paso && guardia-- > 0) p.pasoAnterior();
}

function alternarPantallaCompleta() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen();
}

window.addEventListener('load', () => {
  void boot();
});
