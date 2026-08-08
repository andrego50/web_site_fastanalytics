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

| `andres-perez-coronado.html` | Redirección al sitio personal (https://andrego50.github.io) |
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

### Demo v7 (2026-07-31)
- Narrador principal regenerado con edge-tts **es-CO-GonzaloNeural** (intro + escenas 1-4): voz neural colombiana natural, reemplaza Kokoro em_alex. Fases (f0-f8) y agentes (ag0-ag5) se mantienen en Kokoro.
- Hero simplificado: tagline protagonista, selector de lineas en franja inferior, sin tarjetas de rol ni cadena explicativa.
- Textos internos de graficas recortados a etiquetas cortas.

### Demo v8 (2026-07-31) — Trilingüe ES/EN/FR
- Selector de idioma (ES/EN/FR) en el header; persistencia en localStorage (`fa-lang`).
- Narracion EN/FR: 40 clips edge-tts en `assets/demo/narr/en/` y `assets/demo/narr/fr/`.
  Voces: EN narrador GuyNeural, Gaby AriaNeural, agentes JennyNeural · FR narrador HenriNeural,
  Gaby DeniseNeural, agentes EloiseNeural. ES se mantiene en `narr/` raiz.
- `setLang(l)` traduce ~90 textos estaticos (data-i18n), nombres/descripciones/speech de las
  9 fases y 6 agentes, re-renderiza paneles activos en silencio y ajusta SpeechSynthesis
  (es-ES/en-US/fr-FR). Micro-etiquetas dentro de graficas SVG quedan en ES.

### Logos v3 (2026-08-01) — Mascotas FLUX
- Los 5 logos del ecosistema regenerados con FLUX schnell (GPU local, script
  `/mnt/modelos/comfygen/gen_logos.py`, 3 candidatos por personaje).
- Estilo: mascota escudo flat con carita, casco+brujula (Alejo), headset (Cathe),
  fedora+lupa (Mile), antena con ondas (Gus), flecha ascendente (Gaby).
- Exportados como PNG 512x512 con mascara circular transparente:
  `assets/images/logos/{nombre}-v3.png`. Referencias actualizadas en demo y home
  (los v2 SVG quedan como respaldo).

### Logos v4 (2026-08-01) — Multicolor + manada
- Logos regenerados con FLUX (`gen_logos2.py`): color principal + 2-3 acentos
  (ej. Alejo teal+navy+naranja, Gaby naranja+teal). PNG `-v4.png` en demo y home.
- Hero: los 5 logos ya no van en linea vertical sino en formacion de cuna
  (manada) convergiendo con flechas al punto "Tu ciudad" del mapa.

### Audio y música (2026-08-01, commit 7b7f1da)
- Eliminada la voz TTS duplicada de los pasos (hablaba encima de la narracion mp3);
  el respaldo TTS solo actua si el mp3 realmente no carga (error 2/4), nunca por AbortError.
- Videos de pasos: de banda fija 200px (se veian cortados en desktop) a aspect-ratio 16/9.
- Arco musical por escena (MusicGen, musicgen-venv): m1-suspenso (escenas 0-1),
  m2-construccion (PMU), m3-confianza (Eneagono), m4-jubilo (cierre).


## Logos v5 (1 ago 2026)
- Estilo premium, insignia circular blanca consistente, multicolor (dominante + acentos).
- Gaby redisenada: visor analitico + grafico de barras. Nuevo logo Veteranos (boina + baston de mando) en index.
- Commit cfdbe3c. Archivo local: finales-v5/ y candidatos-flux-v5/ en el respaldo de logos.

## Demo: fixes audiovisuales + layout (1 ago 2026)
- Quick-lines XL; celular de llamada CatheAsiste junto al de Alejo (paso 1 sin video); evidencia cinematografica enfatizada.
- Eliminado video "Contexto"; red criminal y mapa de situacion con marco cinematografico; video v-moto-extorsion.mp4 (FLUX+LTXV) en panel Redes Criminales.
- Bloque de productos reemplazado por los 4 pasos (Escucha/Investiga/Coordina/Predice). Cadena de flujo incluye CatheAsiste y MileInvestiga.
- Nota "Cifras ilustrativas de contexto para el piloto" en stats.
- Audio/musica: desbloqueo con primer gesto (autoplay), narracion pendiente reintentada, setSceneMusic reintenta play. Verificado Playwright web+movil x ES/EN/FR: scene1-4, f3, ag1, m1-m4 todos 200/206 y reproduciendo.
- Commits: 797626f, 55ede9d.

## 2026-08-02 — Reestructura index + ajustes demo
- index.html: fix ancla rota #agenda -> #contacto (boton "Agenda una demo").
- Productos agrupados en 3 lineas con encabezados i18n: Seguridad ciudadana / Analitica e investigacion / Formacion y comunidad (.case-group-header en styles.css v7).
- Secciones Resultados + Prensa fusionadas en franja de credibilidad unica (.cred-divider).
- Nav simplificado: Servicios, Ecosistema, Resultados, Investigacion, Contacto.
- Copy: eliminadas todas las menciones a Barranquilla -> "suroccidente de la ciudad" (ES/EN/FR).
- Hero aligerado: sin badge redundante, subtitulo corto, alerta sin repetir ubicacion.
- Veteranos: nuevo logo veterana-v2.png (version femenina, cabello recogido).
- demo-seguridad-urbana.html: eliminada tarjeta final "Predecimos/3 pasos"; CTA final -> index.html#contacto.
- Verificado web + movil (Playwright): 0 errores JS, scrollY=0 al cargar, narracion escena 1-4 y musica OK.

## 2026-08-02 (tarde) — Index compacto y visual
- Reescritura del index: 98KB -> 40KB. Seccion servicios eliminada; social movida al footer.
- Productos: tarjetas compactas (logo circular + nombre + 1 linea + link) en 3 grupos, grid 3/2 cols.
- Investigacion y Cursos convertidas en franjas compactas (.strip). Prensa reducida a chips de fuentes.
- Logos nuevos v9 (estilo v8): chronnet-v9.png, ceci-v9.png, tavo-v9.png. AlejoSeguro -> alejoseguro-v8.png. Mile-IA -> mileinvestiga-v8.png. Demo -> favicon.svg (eneagono). Veteranos -> veterana-v2.png (aprobada, no anime).
- styles.css v8: .pc-card, .pc-group, .strip-row.
- Verificado web + movil + EN: 0 errores, scrollY=0, 9 tarjetas OK.
- Audio demo: flag musicMuted respeta el mute del usuario (clic en eneagono/cambio de escena ya no reactiva la musica). Ducking: musica baja a 0.045 mientras habla la narradora y vuelve a 0.13 (antes base 0.22).

## 2026-08-07 — Suite de colaboración auto-hospedada (túnel "colab")
- Nuevo túnel Cloudflare `colab` (f6530162-45fd-4fb8-a174-4f38e3412129), contenedor `colab-tunnel` (--network host, user 1000:1000, config ~/.cloudflared/config-colab.yml).
- **nube.fastanalytics.co** → Nextcloud 31 (~/colab/nextcloud, puerto 127.0.0.1:8200) + OnlyOffice Document Server (8201, hostname público docs.fastanalytics.co, JWT activo). App ONLYOFFICE conectada (DocumentServerInternalUrl=http://onlyoffice, StorageUrl=http://app).
- **meet.fastanalytics.co** → Jitsi Meet stable-10431 (~/colab/jitsi, web 127.0.0.1:8202, JVB UDP 10101 porque Asterisk de CatheAsiste ocupa 10000-10100). Auth interna + invitados; moderador: andres. P2P (1 a 1) funciona ya; llamadas grupales requieren port-forward UDP 10101 en el router.
- **agenda.fastanalytics.co** → Cal.com (~/colab/calcom, 127.0.0.1:8203, postgres dedicado, migraciones aplicadas, registro público cerrado). Usuario: andres.
- index.html: botón "Agenda una demo" en footer con embed popup de Cal.com (data-cal-link andres/30min) + CSS .footer-cta-row. Trilingüe.

## 2026-08-07 (2) — Colab: HDD + LibreOffice (Collabora)
- Datos de la suite movidos del SSD al HDD **/mnt/datos2/colab/** (bind mounts; compose files intactos en ~/colab): nextcloud/{db,html,data}, calcom/pgdata, jitsi-cfg (CONFIG en .env). SSD queda solo para sistema.
- OnlyOffice reemplazado por **Collabora Online (LibreOffice, 100% open source)** en el mismo hostname docs.fastanalytics.co (puerto 127.0.0.1:8201). Nextcloud: app onlyoffice eliminada, richdocuments 8.8.2 instalada (wopi_url público + callback interno http://collabora:9980). Admin consola Collabora: admin / (clave en bóveda de credenciales).

## 2026-08-07 (3) — Cal.com envía correos como hola@fastanalytics.co
- SMTP de iCloud+ (misma config del docker veteranos): smtp.mail.me.com:587 STARTTLS, usuario andres.perezc@icloud.com (clave de app), From: hola@fastanalytics.co / "FastAnalytics". Auth verificada OK.

## 2026-08-07 (4) — Pruebas end-to-end suite colab
- Cal.com: onboarding completado (email verificado, zona America/Bogota, nombre Andrés Pérez), horario L-V 9-18, eventos "Demo FastAnalytics" (andres/demo, 30 min) y "Reunión 15 min" (andres/15min), con Host+_user_eventtype (requerido por schema nuevo).
- Credencial jitsi_video creada y código del contenedor parchado: enlaces de reunión ahora salen como https://meet.fastanalytics.co/cal/<uuid> (antes meet.jit.si). OJO: si se actualiza la imagen calcom/cal.com hay que reaplicar el parche.
- Reservas de prueba vía web y API OK (status accepted). Correos de confirmación enviados a andres.perezc@icloud.com vía SMTP iCloud.
- Jitsi: prejoin OK (dispositivos detectados), BOSH OK, prosody/jicofo/jvb autenticados. Media P2P pendiente de prueba real 2 dispositivos.
- Nextcloud: WebDAV público OK (upload 201), Collabora discovery interno y público 200, richdocuments 8.8.2 activa.
- index.html: embed Cal.com corregido a data-cal-link="andres/demo".

## 2026-08-08 — Mini demo hook + Cathe en hero + accesos admin
- **Mini demo (hook)**: video de 55 s generado con IA (8 clips LTXV 121f@24fps estirados a narración + voz Kokoro em_alex + música cinematic-theme duck 0.16 + subtítulos quemados) en assets/demo/mini-demo.mp4 (4,6 MB). Pantalla inicial #hookOverlay en demo-seguridad-urbana.html: "Ver la introducción" / "Entrar directamente al demo" (trilingüe, claves introH/introP/introPlay/introSkip/introEnter en I18N en/fr). Al terminar el video el botón se convierte en "Entrar al caso real".
- **Hero index.html**: chip hero-cathe con logo catheastiste-v8.png ("Todo empieza con Cathe...") bajo los CTAs.
- **Contacto**: fila footer-admin-row con accesos rápidos admin — 📅 Agendar (agenda.fastanalytics.co/andres/demo), 📄 Crear documentos (nube.fastanalytics.co), 🎥 Videollamada (meet.fastanalytics.co).
- NOTA infra: LTXV en este ComfyUI usa LTXVImgToVideo(positive,negative,vae,image,strength)+SamplerCustom(add_noise,noise_seed) y clip t5xxl_fp8_e4m3fn — el script gen_video_ltxv.py de la skill quedó desactualizado; usar /tmp/run_ltxv2.py como referencia. ComfyUI SaveAnimatedWEBP no lo decodifica ffmpeg del sistema: extraer frames con PIL.
- fa-vllm pausado para generación y restaurado (Up, 14264 MiB, startup complete, API 200).

## 2026-08-08 (2) — Mini demo v2
- Narradora FEMENINA (Kokoro ef_dora; em_alex era masculina).
- Guion reescrito: describe FUNCIONES sin nombrar productos (reporte ciudadano con foto/video/audio/geo = Alejo; asistente 24/7 chat/voz = Cathe; 20+ modelos rostros/placas/red = Mile; 6 agentes centro de mando = Gus; eneágono 9 fases = Gaby). Nombres solo al final.
- Cierre: tarjeta PIL card-suite.png con los 5 logos v8 + "Escucha · Investiga · Coordina · Predice" + CTA, con zoompan 9,1s.
- Instrucciones de navegación explícitas (eneágono/botones, narración por escena, caso en dos actos).
- Música ÉPICA orquestal (tambores de guerra + metales, 22s en loop, generada con plugin audio_generation) en assets? -> /tmp/mini/epic-theme.mp3 (origen), mezclada vol 0.20.
- Salida: assets/demo/mini-demo-v2.mp4 (66,4 s, 6,0 MB). demo-seguridad-urbana.html apunta a v2.

## 2026-08-08 (3) — Demo: las 4 líneas primero
- Botón "Vivir el caso completo" eliminado del hero (la experiencia lineal ya no es lo primero).
- Nuevo: fila de chips (.line-chip, colores por línea) con 01 Escucha / 02 Investiga / 03 Coordina / 04 Predice justo bajo el subtítulo del hero — visibles en el primer pantallazo en móvil y desktop. Cada chip llama goLine() como las tarjetas grandes.
- El grid visual de 4 tarjetas queda como refuerzo (sin título propio) y debajo el enlace secundario "O vive la experiencia completa, escena por escena →" (data-i18n ctaFull, trilingüe).

### 2026-08-08 (4) — Mini demo v3: mezcla de audio corregida
- Queja: la musica tapaba la narracion. Reensamblado como mini-demo-v3.mp4.
- Voz +1.25x y musica epica con sidechaincompress (ducking: la musica baja sola cuando habla la narradora, threshold 0.02 ratio 8) + alimiter 0.95.
- Solo se remezclo el audio (video copiado sin reencode, subtitulos intactos).
- demo-seguridad-urbana.html ahora referencia mini-demo-v3.mp4.

### 2026-08-08 (5) — Rediseno del ingreso al demo
- Hook overlay: el mini video (v3) ahora se ve de una con poster (hook-poster.jpg) y boton play grande encima: UN clic reproduce (controles nativos tras iniciar). Eliminado el boton intermedio "Ver la introduccion".
- Hero: los chips de texto se reemplazaron por las 4 tarjetas con IMAGEN de cada linea (Escucha/Investiga/Coordina/Predice) como visual principal del ingreso; el SVG del mapa salio del hero.
- La antigua grilla duplicada de tarjetas bajo el hero se elimino; el enlace "experiencia completa" quedo centrado bajo el hero.

### 2026-08-08 (6) — Mini demo v4: balance voz/musica definitivo
- v3 seguia con musica fuerte al subir volumen. v4: musica a volume=0.09 (≈3.5x mas baja que v3), voz a 1.5 + dynaudnorm (nivelacion automatica), ducking mas agresivo (threshold 0.01, ratio 12).
- demo referencia mini-demo-v4.mp4.

### 2026-08-08 (7) — Mini demo v5: ducking corregido
- En v4 la musica volvia a subir a mitad de frase (release 350ms muy corto). v5: release 1200ms, threshold 0.008, ratio 20, sin dynaudnorm; voz 1.6. Verificado: RMS de la mezcla = RMS de la voz sola durante el habla (musica imperceptible bajo la narracion).

### 2026-08-08 (8) — Mini demo v6 + CatheAsiste en productos
- v6: subtitulos REGENERADOS con tiempos reales de cada clip de narracion (el srt viejo usaba duraciones estimadas y se desalineaba progresivamente ~5.6s al final). Verificado frame a frame (3s/10s/25s/48s/62s).
- Musica bajada a 0.05 (puro fondo) con ducking release 1200ms.
- CatheAsiste: se quito el chip del hero y se agrego como PRIMERA tarjeta del grupo Seguridad ciudadana en #casos ("Todo empieza con Cathe: escucha a la ciudadania por chat y voz, 24/7"), trilingue, logo catheastiste-v8.png, link mailto demo.

### 2026-08-08 (9) — Contraste footer oscuro
- Los chips admin y el boton "Agenda una demo" heredaban --text (#1A1A2E, oscuro) sobre el footer --bg-dark: texto invisible. Reglas .footer-scoped: texto #E2E8F0, borde rgba blanco, hover naranja/teal.

### 2026-08-08 (10) — Cuentas colab unificadas con correo corporativo
- Nextcloud: email de 'andres' = andres.perezc@fastanalytics.co; clave temporal FastTemp2026! (cambiar en Configuracion > Seguridad). Login WebDAV verificado (207).
- Cal.com: users.email = andres.perezc@fastanalytics.co; nuevo hash bcrypt en UserPassword (FastTemp2026!). Login verificado (302 callback).
- Jitsi: prosodyctl register andres meet.jitsi con FastTemp2026! (Jitsi no maneja correo).
- Nextcloud SMTP configurado (smtp.mail.me.com:587 STARTTLS, hola@fastanalytics.co, misma app-password iCloud de Veteranos) -> invitaciones de documentos compartidos llegan por correo. user:welcome enviado sin errores.

### 2026-08-08 (11) — Nextcloud: usuario = correo corporativo
- Creado usuario "andres.perezc@fastanalytics.co" (grupo admin, clave temporal FastTemp2026!).
- occ files:transfer-ownership andres -> nuevo usuario; archivos en carpeta "Transferred from andres on 2026-08-08...".
- Cuenta vieja "andres" DESHABILITADA. Login WebDAV con correo verificado (207).
