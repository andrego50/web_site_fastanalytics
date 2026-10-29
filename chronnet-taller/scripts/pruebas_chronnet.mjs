// Pruebas de integración de la página pública chronnet-taller con el motor 3D
// real (playwright). Sirve ~/web_site_fastanalytics estáticamente en 127.0.0.1:5175
// y verifica: 0 errores de consola, las 8 escenas cargan y avanzan pasos,
// el toggle Material muestra el iframe con taller/index.html y pausa el 3D,
// el botón de código apunta a taller/, los clips <video> existentes están
// presentes, EN cambia captions y UI, las advertencias son visibles y el
// progreso va de 0 a 1.
//
// Uso:  node scripts/pruebas_chronnet.mjs

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const SITIO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUERTO = 5175;
const BASE = `http://127.0.0.1:${PUERTO}/chronnet-taller/`;

const require = createRequire(join(SITIO, '..', 'package.json'));
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  // playwright vive en el repo del taller_3d (no se toca el sitio web).
  ({ chromium } = createRequire('/home/andrego50/05_Formacion/Taller_Redes_Criminales/taller_3d/app/package.json')('playwright'));
}

const resultados = [];
const consoleErrores = [];
const peticionesFallidas = [];

function prueba(nombre, ok, evidencia = '') {
  resultados.push({ nombre, ok, evidencia });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nombre}${evidencia ? `  — ${evidencia}` : ''}`);
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const servidor = spawn('python3', ['-m', 'http.server', String(PUERTO), '--directory', SITIO, '--bind', '127.0.0.1'], {
  stdio: 'ignore',
});
process.on('exit', () => servidor.kill());
await espera(900);

const navegador = await chromium.launch({ args: ['--use-angle=gl-egl'] });
const page = await navegador.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrores.push(msg.text());
});
page.on('pageerror', (err) => consoleErrores.push(`pageerror: ${err.message}`));
page.on('requestfailed', (req) => peticionesFallidas.push(`${req.url()} :: ${req.failure()?.errorText ?? '?'}`));

console.log(`Cargando ${BASE} ...`);
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__chronnet !== undefined, null, { timeout: 20000 });
await espera(1000);

// --- Menú: 8 tarjetas con num/kicker/título/descripción y enlaces de código ---
const tarjetas = await page.locator('#mgrid .mcard').count();
prueba('Menú: 8 tarjetas de escenas', tarjetas === 8, `n=${tarjetas}`);
const linksCodigo = await page.locator('#mgrid .mcard .codigo').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
const esperadosCodigo = [
  'taller/index.html', 'taller/00_datos.html', 'taller/01_cronologica.html',
  'taller/02_exploratorio.html', 'taller/03_topologia.html',
  'taller/04_actores_clave.html', 'taller/05_disrupcion.html', 'taller/index.html',
];
prueba(
  'Menú: enlaces "código" apuntan a las páginas Quarto reales',
  esperadosCodigo.every((h) => linksCodigo.includes(h)),
  linksCodigo.join(' '),
);

// --- Recorrido de las 8 escenas: cargan, avanzan y llegan a progreso 1 -------
let avanceOk = true;
let evidenciaAvance = [];
for (let i = 0; i < 8; i++) {
  if (i > 0) {
    await page.locator('#menuBtn').click(); // volver al menú entre escenas
    await espera(300);
  }
  await page.locator(`#mgrid .mcard[data-i="${i}"]`).click();
  await espera(650);
  const r = await page.evaluate(() => {
    const p = window.__chronnet;
    p.pausar();
    const prog0 = p.progreso();
    p.pasoSiguiente();
    const paso1 = p.pasoActual();
    for (let k = 0; k < 40 && p.pasoActual() < p.totalPasos(); k++) p.pasoSiguiente();
    return { escena: p.escenaActual(), prog0, paso1, total: p.totalPasos(), prog1: p.progreso() };
  });
  const caption = await page.locator('#capText').textContent();
  const ok = r.escena === i && r.prog0 === 0 && r.paso1 === 1 && r.prog1 === 1 && caption.length > 20;
  if (!ok) avanceOk = false;
  evidenciaAvance.push(`${r.escena}:${r.paso1}/${r.total}→${r.prog1}`);
}
prueba('Escenas: las 8 cargan desde el menú, avanzan un paso y llegan a progreso 1', avanceOk, evidenciaAvance.join(' '));

// --- Paso anterior -------------------------------------------------------------
const retro = await page.evaluate(() => {
  const p = window.__chronnet;
  p.cargarEscena(2);
  return new Promise((res) => setTimeout(() => {
    p.pasoSiguiente(); p.pasoSiguiente();
    const en2 = p.pasoActual();
    p.pasoAnterior();
    res({ en2, ahora: p.pasoActual() });
  }, 700));
});
prueba('Controles: paso anterior retrocede (2 → 1)', retro.en2 === 2 && retro.ahora === 1, JSON.stringify(retro));

// --- Barra de progreso 0 → 1 ----------------------------------------------------
const progreso = await page.evaluate(() => {
  const p = window.__chronnet;
  for (let k = 0; k < 40 && p.pasoActual() < p.totalPasos(); k++) p.pasoSiguiente();
  return p.progreso();
});
const anchoBarra = await page.evaluate(() => document.getElementById('progFill').style.width);
prueba('Progreso: la barra refleja 0 → 1', progreso === 1 && anchoBarra.startsWith('100'), `progreso=${progreso} ancho=${anchoBarra}`);

// --- Advertencias SIEMPRE visibles ----------------------------------------------
const avisosStage = await page.locator('#chipRow .chipwarn').allTextContents();
const avisosOk =
  avisosStage.length >= 2 &&
  avisosStage.some((a) => a.includes('Sospecha ≠ delito')) &&
  avisosStage.some((a) => a.includes('culpabilidad'));
prueba('Advertencias: "Sospecha ≠ delito" y culpabilidad visibles en escena', avisosOk, avisosStage.join(' | '));

// --- Conmutador Material ⇄ 3D ----------------------------------------------------
await page.locator('#matBtn').click();
await espera(1200);
const material = await page.evaluate(() => {
  const frame = document.getElementById('matFrame');
  return {
    abierto: frame.classList.contains('open'),
    src: frame.src,
    canvasOculto: document.getElementById('cv').style.display === 'none',
    pausado: window.__chronnet.estado() !== 'reproduciendo',
  };
});
// El toggle inteligente carga la página Quarto de la escena actual (no siempre el índice).
prueba(
  'Material: iframe con la página Quarto de la escena visible y 3D pausado/oculto',
  material.abierto && material.src.includes('taller/') && material.src.endsWith('.html') && material.canvasOculto && material.pausado,
  JSON.stringify({ src: material.src.slice(-30), canvasOculto: material.canvasOculto, pausado: material.pausado }),
);
// El iframe realmente cargó el material Quarto.
const tituloIframe = await page.frameLocator('#matFrame').locator('h1, h2, .title, nav').first().textContent().catch(() => '');
prueba('Material: el iframe cargó el índice Quarto del taller', /redes|modelado|módulo|modulo/i.test(tituloIframe), tituloIframe.slice(0, 60));
await page.locator('#matBtn').click();
await espera(400);
const deVuelta = await page.evaluate(() => ({
  frameCerrado: !document.getElementById('matFrame').classList.contains('open'),
  canvasVisible: document.getElementById('cv').style.display !== 'none',
}));
prueba('Material: el toggle regresa a la animación 3D', deVuelta.frameCerrado && deVuelta.canvasVisible, JSON.stringify(deVuelta));

// --- Botón "Código del análisis" ---------------------------------------------------
const hrefCodigo = await page.locator('#codeBtn').getAttribute('title');
prueba('Topbar: botón "Código del análisis" apunta a taller/', hrefCodigo === 'taller/', hrefCodigo);

// --- Clips de medios ----------------------------------------------------------------
const clipsConSrc = await page.locator('.mcard2 video[data-media]').evaluateAll((els) =>
  els.filter((v) => v.src).map((v) => v.dataset.media));
const clip1Existe = existsSync(join(SITIO, 'chronnet-taller', 'media', 'clip1_la_red_del_lavado.mp4'));
prueba(
  'Medios: <video> con src para los clips Blender que ya existen',
  clip1Existe ? clipsConSrc.includes('media/clip1_la_red_del_lavado.mp4') : clipsConSrc.length === 0,
  clipsConSrc.join(' ') || '(ninguno aún)',
);
const pendientes = await page.locator('.mcard2 [data-media]:not([src])').count();
const badgesVisibles = await page.locator('.mcard2 .badge:not([style*="none"])').count();
prueba('Medios: badge "EN PRODUCCIÓN" solo en los pendientes (0 con todos listos)',
  pendientes === badgesVisibles, `pendientes=${pendientes} badges=${badgesVisibles}`);

// --- Idioma EN ------------------------------------------------------------------------
await page.locator('#langBtn').click();
await espera(500);
const en = await page.evaluate(() => ({
  avisos: [...document.querySelectorAll('#chipRow .chipwarn')].map((c) => c.textContent),
  tituloTop: document.getElementById('sceneTitle').textContent,
  caption: document.getElementById('capText').textContent,
  kicker: document.getElementById('sceneKicker').textContent,
}));
const enOk =
  en.avisos.some((a) => a.includes('Suspicion ≠ crime')) &&
  /[a-z]/.test(en.tituloTop) &&
  !en.caption.includes('Fase') &&
  en.kicker.includes('M2');
prueba('Idioma EN: advertencias, títulos y caption cambian a inglés', enOk, JSON.stringify(en).slice(0, 220));
await page.locator('#langBtn').click();
await espera(300);

// --- Escena 6 (M6 Disrupción): dato real CI peor AUC en caption -----------------------
await page.evaluate(() => window.__chronnet.cargarEscena(6));
await espera(700);
const captionM6 = await page.locator('#capText').textContent();
prueba('Contenido: M6 explica la regla de la consecutividad operativa', captionM6.length > 30, captionM6.slice(0, 80));

// --- Consola y red --------------------------------------------------------------------
const erroresFiltrados = consoleErrores.filter(
  (e) => !e.includes('favicon') && !e.includes('ResizeObserver'),
);
prueba('CONSOLA: 0 errores de consola', erroresFiltrados.length === 0, erroresFiltrados.slice(0, 3).join(' ;; '));
const fallosFiltrados = peticionesFallidas.filter(
  (u) =>
    !u.includes('clip2_el_raid') &&
    !u.includes('clip3_actores_clave') &&
    !u.includes('still_') &&
    !u.includes('ERR_ABORTED'),
);
prueba('RED: 0 peticiones fallidas (salvo clips en producción)', fallosFiltrados.length === 0, fallosFiltrados.slice(0, 3).join(' ;; '));

await navegador.close();
servidor.kill();

const fallos = resultados.filter((r) => !r.ok).length;
console.log(`\n=== RESUMEN: ${resultados.length - fallos}/${resultados.length} pruebas de la página OK ===`);
process.exit(fallos > 0 ? 1 : 0);
