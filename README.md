# FastAnalytics — Sitio web

Sitio público de **FastAnalytics S.A.S.** — IA espaciotemporal para anticipación de riesgos
(seguridad ciudadana, salud, movilidad, fraude). Publicado en **GitHub Pages**:
[fastanalytics.co](https://fastanalytics.co)

## Estructura

| Archivo | Descripción |
|---|---|
| `index.html` | Landing principal: hero oscuro gov-tech, servicios, productos, resultados, prensa, investigación, cursos, contacto |
| `demo-seguridad-urbana.html` | Demo inmersiva cinematográfica del ecosistema de seguridad ciudadana, con selector por líneas (Escucha / Investiga / Coordina / Predice) y recorrido en dos roles: comerciante (Acto 1) y comandante (Acto 2) |

## Demo cinematográfica (v2, jul 2026)

El demo se reestructuró alrededor de cuatro líneas de acción, cada una con su personaje:

| Línea | Productos | Color |
|---|---|---|
| **Escucha** | AlejoSeguro (Telegram) + CatheAsiste (llamada de voz) | teal `#006D6D` / `#00BFA6` |
| **Investiga** | MileInvestiga (fraude financiero e investigación general) | azul `#3B9BD9` |
| **Coordina** | GusCoordina (PMU, 6 agentes) | violeta `#7C6CDC` |
| **Predice** | GabyPredice (Eneágono Decisional) | naranja `#D4883A` |

- **Selector por líneas** en la escena 0 (`goLine(scene, step)`): quien tiene poco tiempo
  salta directo a la línea que le interesa; el botón principal recorre el caso completo.
- **Música por escena**: `setSceneMusic(n)` cambia la pista según la escena
  (`escucha-ambient`, `cinematic-theme`, `tension-prediccion`).
- **Tráiler del ecosistema**: `assets/demo/trailer-ecosistema.mp4` (~11 s, 5 clips + score),
  embebido en el cierre del demo y listo para redes sociales.
- **Logos de la familia** en `assets/images/logos/*.svg`: escudo + carita (ADN AlejoSeguro),
  eneágono naranja como insignia de marca madre. Casco (Alejo), diadema (Cathe), fedora
  (Mile), antena (Gus), gráfico ascendente (Gaby).

### Pipeline de assets (GPU local del servidor)

Todos los videos, imágenes y música del demo se generan localmente en la GPU (RTX 5060 Ti)
con ComfyUI + FLUX + LTX-Video + MusicGen. Scripts en `/mnt/modelos/comfygen/`:

| Script | Qué hace |
|---|---|
| `gen_v2.py` | Imágenes FLUX txt2img vía API ComfyUI (escenas en paleta teal/naranja) |
| `gen_videos_v2.py` | Clips LTX img2video (49 frames) desde esas imágenes |
| `gen_music_v2.py` | Pistas con MusicGen (`facebook/musicgen-small`) |
| `webp2mp4.py` | Convierte los webp animados de ComfyUI a mp4 (ffmpeg del servidor no decodifica webp animado) |

**Nota técnica importante (bug Blackwell)**: ComfyUI 0.29 + PyTorch 2.7.1 falla en la
RTX 5060 Ti con `cuDNN Frontend error` porque `comfy/ops.py` prioriza
`SDPBackend.CUDNN_ATTENTION`. Parche aplicado en `comfy/ops.py` (backup:
`ops.py.bak_cudnn`) y lanzador `/mnt/modelos/ComfyUI/run_nocudnn.py` (fija
`PYTORCH_CUDA_ALLOC_CONF=backend:cudaMallocAsync` antes de importar torch — de lo
contrario falla el allocator).

| `andres-perez-coronado.html` | Perfil del fundador |
| `mapa-cundinamarca.html` | Mapa interactivo de Cundinamarca |
| `curso-redes-criminales.html` | Landing del curso de redes criminales |
| `chronnet/` | Demo interactiva de redes espacio-temporales (Chronnet) |
| `css/styles.css` | Estilos del sitio principal |
| `js/main.js` | i18n, navegación, carrusel, modal de agenda |
| `js/hero-network.js` | Canvas animado del hero (red de nodos) |

## Características clave

- **Hero híbrido gov-tech**: fondo oscuro, mapa animado de Colombia, tarjeta de alerta
  predictiva flotante, palabra rotativa en el titular (riesgos/delitos/fraudes/atentados)
  y CTA único a la agenda.
- **Trilingüe (ES/EN/FR)**: cualquier elemento con atributos `data-es` / `data-en` / `data-fr`
  se traduce con el selector de idioma (`js/main.js`). Todo texto nuevo debe incluir los tres.
- **Formulario "Agenda tu demo"**: modal (`#agendaModal` en `index.html`) que envía la
  solicitud por POST a `https://api.fastanalytics.co/demo-request`. El endpoint es un
  servicio aparte (repo `fastanalytics-api` en el servidor) que reenvía el correo a
  `hola@fastanalytics.co` vía iCloud SMTP. La API key **nunca** va en este repo (es público).
- **Demo inmersiva**: escenas guiadas con narración por voz, feed de reportes en vivo,
  radar animado, simulación de Telegram, PMU interactivo, Eneágono Decisional, resultados
  reales con enlaces de prensa y publicaciones científicas.
- **Responsive**: verificado sin desborde horizontal en móvil (390px) y desktop.

## Despliegue

GitHub Pages publica automáticamente la rama `main` al hacer push (tarda ~1 min).
El dominio se fija en `CNAME` (`fastanalytics.co`).

```bash
git add -A && git commit -m "..." && git push
```

## Pruebas locales

```bash
python3 -m http.server 52415
# http://localhost:52415/index.html
# http://localhost:52415/demo-seguridad-urbana.html
```

En previews locales, el formulario de agenda apunta a `http://<host>:8787/demo-request`
(servicio `fastanalytics-api` local) en lugar de la API de producción.

### Demo v3 (ago 2026): paneles cinematográficos + gráficas dinámicas
- **GusCoordina (PMU)**: cada agente muestra SU visualización al hacer clic — línea de tiempo de activación (Ingreso), confianza de cruce por fuente (Inteligencia), comparador de rutas (Simulación), onda de radio con picos de riesgo (Audio), semáforo por institución (Control), mapa de unidades en vivo (Pantalla).
- **GabyPredice (Eneágono)**: cada fase F0–F8 muestra SU gráfica — pilares de postura, cruce por fuente, donut de dimensiones, temas del grafo con centralidad, tendencia 12 semanas, línea+proyección con hotspots, línea de tiempo de memoria, criterios del comité (/5), semáforo IPDH.
- Paso "La IA investiga": strip **PIPELINE EN VIVO** con los modelos encendiéndose en secuencia.
- Paso "Respuesta coordinada": alerta con pulso luminoso, strip "Patrulla despachada", mapa con barrido radar y unidad moviéndose por la ruta segura.
- Gráfica predictiva principal v2: área bajo la curva, glow, línea HOY, hotspots H1–H3 pulsantes, badge de confianza.
- Nota técnica: las visualizaciones dinámicas inyectadas por JS usan estado final directo + animaciones SMIL `repeatCount="indefinite"` (SMIL con `begin` en el pasado no corre al inyectar tarde en el DOM).
- Referencias de ciudad neutralizadas: "el suroccidente de la ciudad" en todo el demo.

### Demo v5 (ago 2026): imágenes cinematográficas FLUX + una gráfica por nodo
- Paso 1 (Escucha): escena CCTV generada con FLUX (`assets/demo/cctv-escena.webp`) — calle nocturna, sospechoso + moto — con cajas de detección SVG animadas encima (ROSTRO/VEHÍCULO + línea de escaneo).
- Paso 2 (Investiga): fondo aéreo nocturno (`red-bg.webp`) bajo el grafo animado de la red criminal.
- Paso 3 (Respuesta): mapa táctico top-down (`mapa-tactico.webp`) bajo radar, hotspots y unidad en ruta.
- Generación: `/mnt/modelos/comfygen/gen_demo3.py` (FLUX schnell fp8 vía ComfyUI, requiere pausar fa-vllm por GPU).
- Eneágono: el panel estático de predicción se OCULTA al seleccionar un nodo (`anticiparPanel`); cada fase muestra UNA sola visualización sincronizada con su narración (F0 extracción, F1 +340%, F3 centralidad, F4 checkpoint, F5 proyección, etc.).

### Demo v6 (ago 2026): video de contexto propio + texto a la idea clave
- El iframe de YouTube del panel "Contexto" se reemplaza por `assets/demo/contexto-extorsion.mp4` (FLUX frame + LTX img2vid, `/mnt/modelos/comfygen/gen_contexto.py`): amanecer, comerciante encuentra el sobre en la persiana, moto alejándose — alineado con la narración de la Escena 1. Poster: `contexto-extorsion.webp`.
- Reducción global de texto: se eliminó la caja `detail` de los paneles de fases y agentes (queda `desc` de una línea + visualización + caso), descripciones y ejemplos recortados a la idea clave, intros de pasos y escenas resumidas, y las columnas de la escena final pasan de 8 a 4 bullets por producto.

### Narración profesional + logos completos (ago 2026, v4)
- **Narración con voz real**: 20 clips MP3 generados con **Kokoro-82M TTS** en el servidor (`/home/andrego50/gen_narr.py`, venv `/mnt/modelos/kokoro-venv`, CPU). 3 voces: narrador principal (em_alex), GabyPredice (ef_dora), agentes PMU (em_santa). Textos reescritos en tono cinematográfico. El demo usa `assets/demo/narr/*.mp3` con fallback automático a SpeechSynthesis. Kokoro OOM en GPU con vLLM activo → correr con `CUDA_VISIBLE_DEVICES=""`.
- **Logos nuevos**: `tavodebate.svg` (globos de debate naranja/teal), `veteranos.svg` (boina + estrella), `chronnet.svg` (constelación de red) en `assets/images/logos/`.
- **Versiones v2 modernas** de los 5 logos del ecosistema (`*-v2.svg`): relleno degradado sutil, cresta de eneágono corporativa, trazos refinados. **ACTIVADOS (ago 2026)**: los v2 reemplazan a los originales en el demo (AlejoSeguro, GusCoordina, GabyPredice + logos añadidos de MileInvestiga y CatheAsiste) y en la home (`index.html`, tarjetas de GabyPredice y GusCoordina). Las tarjetas de TavoDebate, Chronnet y Veteranos en la home ahora usan sus logos nuevos. Los SVG originales se conservan en `assets/images/logos/` por si se quiere volver atrás.
