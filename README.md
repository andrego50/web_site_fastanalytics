# FastAnalytics — Sitio web

Sitio público de **FastAnalytics S.A.S.** — IA espaciotemporal para anticipación de riesgos
(seguridad ciudadana, salud, movilidad, fraude). Publicado en **GitHub Pages**:
[fastanalytics.co](https://fastanalytics.co)

## Estructura

| Archivo | Descripción |
|---|---|
| `index.html` | Landing principal: hero oscuro gov-tech, servicios, productos, resultados, prensa, investigación, cursos, contacto |
| `demo-seguridad-urbana.html` | Demo inmersiva del ecosistema de seguridad ciudadana (AlejoSeguro → GusCoordina → GabyPredice), narrada en dos roles: comerciante (Acto 1) y comandante (Acto 2) |
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
