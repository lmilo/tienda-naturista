# Auditoría externa — Dulces Raíces

**Fecha:** 2026-09-11 · **Alcance:** proyecto completo · **Modo:** solo lectura
**Benchmark:** mercado genérico (WCAG 2.2 AA, OWASP ASVS L1, Core Web Vitals, convenciones Vite/JS). El proyecto está fuera de `~/Documents/Lab/`, así que no aplica `ENGINEERING_STANDARDS.md`.
**Auditor:** externo, sin participación en las decisiones de diseño.

---

## 1. Resumen ejecutivo

Sitio estático de catálogo (4 páginas, Vite + JS vanilla, ~2.100 líneas). La capa visual y de contenido está por encima del promedio de su categoría: sistema de tokens coherente, dark mode bien calibrado, imágenes normalizadas y cero dependencias de runtime — el JS del sitio pesa 7,7 KB gzip.

El problema es que la calidad se concentró en lo visible y no en lo que lo sostiene. Hay **un XSS reflejado explotable y verificado** en la ficha de producto. El CSS **declara WCAG AA en su propia cabecera y falla 10 de 20 combinaciones** de color medidas en tema claro. No existe **ninguna** red de seguridad: cero tests, cero CI, cero linter, cero typecheck. La cadena de build arrastra **4 vulnerabilidades** (3 high) sobre un Vite con 3 versiones mayores de atraso. Y el sitio **no tiene datos estructurados ni Open Graph**, que es justo lo que la propuesta comercial le vendió a la clienta.

**Veredicto:** producto presentable para validar diseño con la clienta, no apto para publicar sin cerrar C1, I1 e I4.

---

## 2. Mapa del sistema

```
index / catalogo / producto / nosotros .html   4 entradas, cada una con su <script type=module>
src/js/
  store.js     70 ln   datos de tienda, catálogo, formato de precio, helpers de marca
  ui.js       191 ln   chrome compartido: tema, toasts, to-top, nav, reveals, tarjeta de producto
  product.js  212 ln   ficha: render, visor (parálaje/zoom/vistas), relacionados
  catalog.js   58 ln   filtros por categoría, estado vacío
  home.js      23 ln   destacados + franja de marcas
  icons.js     35 ln   28 iconos SVG inline
src/styles/main.css   882 ln   sistema completo (tokens crudos → semánticos → componentes)
src/data/products.json          16 productos, 4 categorías
public/img/productos/<handle>/  frasco-480 / frasco-960 / ficha  (48 webp)
raw/productos/                  15 JPEG originales (3,4 MB), sin trackear
```

- **Dependencias:** una sola (`vite ^5.4.0`, instalado 5.4.21). Sin dependencias de runtime.
- **Build:** 5 chunks JS, CSS 32,8 KB (7,4 gzip). `dist` total 3,84 MB, de los cuales 3,53 MB son imágenes.
- **Ausentes:** tests, CI, ESLint, Prettier, TypeScript/jsconfig, `.editorconfig`, `.nvmrc`/`engines`, `robots.txt`, `sitemap.xml`, `LICENSE`.

---

## 3. Scorecard

| Dimensión | Estado | Benchmark | Comentario |
|---|:--:|---|---|
| Seguridad | 🔴 | OWASP ASVS L1 | XSS reflejado explotable + 4 CVE en la cadena de build |
| Accesibilidad | 🔴 | WCAG 2.2 AA | 10/20 contrastes fallan en claro; ARIA de pestañas incompleto |
| Testing / CI | 🔴 | — | No existe ninguna verificación automática |
| SEO / discoverability | 🔴 | Datos estructurados, OG | Cero JSON-LD, OG, canonical, sitemap en un negocio local |
| Dependencias | 🟡 | Semver al día | Vite 5.4.21 vs 8.3.0 (3 majors) |
| Arquitectura / código | 🟡 | DRY, SRP | Chrome duplicado ×4; 3 fuentes de verdad para color; código muerto |
| Performance | 🟡 | Core Web Vitals | Primera carga 90 KB (muy bien); miniaturas de 227 KB para 100 px |
| UI / UX | 🟢 | Nielsen | Estados completos, jerarquía sólida, responsive real |
| Contenido | 🟢 | Veracidad | Sin claims falsos ni testimonios inventados |

---

## 4. Hallazgos

### 🔴 Críticos

**[C1] XSS reflejado en la ficha de producto** · Seguridad · *Improper Output Encoding*

**Evidencia — verificado, carga ejecutada en navegador:**
`src/js/product.js:5` toma el parámetro sin validar y `:21` lo interpola en `innerHTML`:
```js
const handle = new URLSearchParams(location.search).get('p')
// ...
root.innerHTML = `... <code>${handle}</code> ...`   // línea 21
```
Prueba ejecutada contra `http://localhost:5173/`:
```
producto.html?p=<img src=x onerror="window.__xss=true">
→ { "xssEjecutado": true, "imgInyectada": true }
```

**Impacto:** cualquier enlace fabricado ejecuta JS arbitrario en el origen del sitio. En un sitio cuyo canal es WhatsApp — donde los enlaces se reenvían sin inspección — el vector es realista: robo de `localStorage`, redirección a un WhatsApp falso, suplantación del botón de pedido. La ironía es que `catalog.js:10-11` **sí** hace lo correcto con su propio parámetro:
```js
const known = new Set(categories.map((c) => c.handle))
let active = requested && known.has(requested) ? requested : 'todos'
```
El mismo criterio aplicado en `product.js` habría evitado el bug.

**Fix** (el mínimo: nunca interpolar entrada del usuario como HTML):
```js
// product.js — el handle solo se usa como texto, jamás como marcado
root.innerHTML = `...<code data-handle></code>...`
root.querySelector('[data-handle]').textContent = handle   // textContent, no innerHTML
```
Y como defensa en profundidad, validar antes de renderizar:
```js
const VALID = /^[a-z0-9-]{1,64}$/
const handle = (new URLSearchParams(location.search).get('p') ?? '').toLowerCase()
const safe = VALID.test(handle) ? handle : null
```
**Esfuerzo:** S

---

### 🟡 Importantes

**[I1] El CSS promete WCAG AA y falla la mitad de los contrastes** · Accesibilidad

**Evidencia:** `src/styles/main.css:4` declara literalmente `Legibilidad alta (público ~50 años, WCAG AA)`. Ratios calculados sobre los tokens reales:

| Combinación | Ratio | Requiere |
|---|---:|---:|
| `.filter-chip.is-active` blanco sobre mostaza `#E0A02E` | **2,27:1** | 4,5:1 |
| `.product-card__brand` mostaza sobre blanco | **2,27:1** | 4,5:1 |
| `.btn--wa` blanco sobre verde `#1FA855` | **3,09:1** | 4,5:1 |
| `.price--ask` verde sobre tarjeta blanca | **3,09:1** | 4,5:1 |
| `.product-card__brand` uva / teal / hoja sobre blanco | 3,97–4,00:1 | 4,5:1 |

10 de 20 combinaciones medidas fallan, **todas en tema claro**. El tema oscuro pasa las 5 que le tocan — está mejor calibrado que el principal.

**Impacto:** el público declarado es de ~50 años, justo la franja donde la sensibilidad al contraste cae. El caso más grave (`btn--wa`, 3,09:1) es el botón de conversión del negocio. Los chips de filtro activos a 2,27:1 son prácticamente ilegibles en pantalla con brillo bajo o a la luz del día.

**Fix:** oscurecer los acentos solo para uso tipográfico, manteniendo los vivos para superficies decorativas:
```css
:root {
  /* acentos de superficie (barras, puntos, fondos) */
  --mostaza: #E0A02E;
  /* variantes legibles para texto sobre claro — verificar cada una a ≥4.5:1 */
  --mostaza-ink: #8A5D00;   /* 4,6:1 sobre blanco */
  --uva-ink:     #7A4E93;
  --teal-ink:    #1F6B6B;
  --hoja-ink:    #3F6B27;
  --wa-ink:      #12703A;   /* para texto; el verde vivo queda para el fondo del botón */
}
```
El `.btn--wa` con fondo verde y texto blanco es un caso aparte: o se oscurece el fondo a `#178043` (4,7:1) o se acepta como excepción documentada de color de marca.
**Esfuerzo:** M

---

**[I2] Sin ninguna verificación automática** · Testing / DX

**Evidencia:** `find` no encuentra `*.test.*` ni `*.spec.*`; no existen `.eslintrc*`, `eslint.config.js`, `.prettierrc*`, `tsconfig.json`, `jsconfig.json`, `.github/workflows`. `package.json` expone solo `dev`, `build`, `preview`.

**Impacto:** nada impide que vuelva a entrar un XSS como C1, un contraste fuera de norma o un handle roto en el JSON. Cada cambio se valida a ojo. En un proyecto de una sola persona esto se sostiene; en cuanto entre alguien más, o pasen tres meses, deja de sostenerse.

**Fix mínimo con rendimiento inmediato** — un test de integridad del catálogo, que es el archivo que la clienta va a editar:
```js
// src/data/products.test.js  (vitest)
import { describe, it, expect } from 'vitest'
import catalog from './products.json'
import { existsSync } from 'node:fs'

const cats = new Set(catalog.categories.map((c) => c.handle))

describe('catálogo', () => {
  it('no repite handles', () => {
    const h = catalog.products.map((p) => p.handle)
    expect(new Set(h).size).toBe(h.length)
  })
  it('toda categoría existe', () => {
    for (const p of catalog.products) expect(cats).toContain(p.category)
  })
  it('cada producto tiene sus 3 imágenes', () => {
    for (const p of catalog.products)
      for (const f of ['frasco-480.webp', 'frasco-960.webp', 'ficha.webp'])
        expect(existsSync(`public/img/productos/${p.handle}/${f}`), `${p.handle}/${f}`).toBe(true)
  })
})
```
Más un workflow que corra `build` + `test` + `npm audit --audit-level=high` en cada push.
**Esfuerzo:** M

---

**[I3] Vite 3 majors atrás con 4 vulnerabilidades en la cadena de build** · Dependencias

**Evidencia:**
```
vite  5.4.21 → latest 8.3.0
esbuild <=0.24.2   moderate  GHSA-67mh-4wv8-2f99  (el dev server responde a cualquier origen)
nanoid  <=3.3.17   high      GHSA-28wg-ghj8-5hjv
postcss <=8.5.22   high      GHSA-fxqj-rqcc-2cmp  (path traversal vía sourceMappingURL)
```
`nanoid` y `postcss` se resuelven con `npm audit fix` sin ruptura. `esbuild` exige subir Vite (breaking).

**Impacto:** son devDependencies, así que no viajan al sitio publicado — el riesgo real es para la máquina del desarrollador, y el de `esbuild` es concreto si se levanta `vite dev` en una red compartida. No es urgente, pero tres majores de atraso en un proyecto de 4 meses es deuda que solo encarece.
**Esfuerzo:** S (los dos `fix`) / M (subir Vite)

---

**[I4] Cero SEO técnico en un proyecto cuyo objetivo declarado es aparecer en Google** · SEO

**Evidencia:** en las 4 páginas, 0 ocurrencias de `og:title`, `og:image`, `og:description`, `twitter:card`, `application/ld+json`, `rel="canonical"`. No hay `robots.txt` ni `sitemap.xml`.

**Impacto:** este es el hallazgo con mayor costo de oportunidad. La propuesta comercial (`propuesta/index.html`) le vende a la clienta *«Que la página la encuentre Google: la armamos pensada para aparecer en las búsquedas de tu zona»* y *«aparecer en el mapa y en las búsquedas locales»*. Sin `LocalBusiness` en JSON-LD, Google no tiene de dónde leer dirección, horario ni teléfono, y la ficha de Google Business queda desconectada del sitio. Sin OG, cada enlace compartido por WhatsApp —el canal de venta— se ve como texto pelado en vez de tarjeta con logo.

**Fix:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "Dulces Raíces",
  "description": "Tienda naturista en Pasto: cuidado capilar, esencias florales y cuidado de la piel.",
  "address": { "@type": "PostalAddress", "streetAddress": "Carrera 29 #15-34, Bomboná",
               "addressLocality": "Pasto", "addressRegion": "Nariño", "addressCountry": "CO" },
  "telephone": "+57 322 890 4164",
  "url": "https://<dominio>/",
  "image": "https://<dominio>/icon-512.png",
  "sameAs": ["https://www.instagram.com/dulces.raices01/"]
}
</script>
<meta property="og:title" content="Dulces Raíces · Tienda naturista en Pasto" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://<dominio>/og.jpg" />
<meta property="og:type" content="website" />
```
Requiere dominio definido. Para las fichas, añadir `Product` con `offers` cuando existan precios.
**Esfuerzo:** M

---

**[I5] Las miniaturas sirven la infografía a tamaño completo** · Performance

**Evidencia:** `src/js/product.js:65` usa la misma imagen en la miniatura que en el visor:
```js
<button class="thumb" data-go="ficha" ...>
  <img src="${sheetOf(product)}" alt="" loading="lazy" />
```
`sheetOf()` devuelve `ficha.webp`, entre 24 y 227 KB, renderizada a ~100 px. Las 16 fichas suman 2,58 MB de los 3,84 MB del `dist`.

**Impacto:** en la ficha de producto se descargan ~200 KB extra solo para pintar una miniatura de 100 px. En 4G de Pasto y móviles modestos —el perfil real de la clientela— es medio segundo regalado. No afecta a la home ni al catálogo, que están bien optimizados.

**Fix:** generar `ficha-160.webp` en el mismo script de imágenes y usarla en la miniatura, o bien `srcset` con `sizes="100px"`.
**Esfuerzo:** S

---

**[I6] El chrome de la página está duplicado literalmente en 4 archivos** · Arquitectura · *Shotgun Surgery*

**Evidencia:** header (19 líneas) y footer (35 líneas) idénticos en `index.html`, `catalogo.html`, `producto.html`, `nosotros.html`. Un cambio de menú, de teléfono o de enlace obliga a tocar 4 archivos. Durante el desarrollo ya hubo que aplicar cambios con un script de reemplazo sobre los 4 — señal de que el patrón ya está cobrando su costo.

**Impacto:** es el defecto con mayor probabilidad de producir una inconsistencia real (un dato de contacto actualizado en 3 de 4 páginas).

**Fix:** Vite soporta parciales HTML con `vite-plugin-html` o, sin plugin, montar el chrome desde `ui.js` con un `<template>`. Alternativa idiomática: mover a un generador estático mínimo (`.html` → `.njk`/`.eta`). Dado el tamaño, un solo plugin de include resuelve sin cambiar el stack.
**Esfuerzo:** M

---

**[I7] Patrón de pestañas ARIA incompleto** · Accesibilidad

**Evidencia:** `src/js/product.js:59-68` declara `role="tablist"` y `role="tab"` con `aria-selected`, pero no existe ningún `role="tabpanel"`, ni `aria-controls`, ni `id` que los enlace, ni gestión de flechas ← →.

**Impacto:** un lector de pantalla anuncia «pestaña 1 de 2, seleccionada» y el usuario no encuentra el panel que esa pestaña controla, porque no está declarado. Un ARIA a medias confunde más que no ponerlo.

**Fix:** o se completa el patrón (`aria-controls` + `role="tabpanel"` + `tabindex` gestionado + navegación por flechas), o se baja a botones honestos con `aria-pressed`, que es lo que realmente son:
```html
<button class="thumb" data-go="frasco" aria-pressed="true">
```
**Esfuerzo:** S

---

**[I8] README describe un proyecto que ya no existe** · DX

**Evidencia:** `README.md:3-8,45` habla de *«tienda artesanal»*, *«placeholders de color por categoría»*, *«El logo es una versión SVG provisional»* y documenta `public/img/ → logo y patrón andino, provisionales`. Nada de eso es cierto: el posicionamiento cambió a tienda que revende marcas, las imágenes son fotos procesadas y el logo es el definitivo. Tampoco menciona `raw/`, ni el pipeline de imágenes, ni la dependencia de `rembg`.

**Impacto:** quien retome el proyecto —o la propia clienta— parte de premisas falsas. El pipeline de imágenes, que es la pieza menos obvia del repo, no está documentado en ninguna parte.
**Esfuerzo:** S

---

### 🟢 Menores

| # | Hallazgo | Evidencia | Fix |
|---|---|---|---|
| M1 | Código muerto | 11 de 28 iconos sin referencia (`jar, weave, pin, phone, clock, sprout, heart, mountain, copy, close, hand`); `categoryIcon` exportado y no importado por nadie; `swatch` inyectado como `--swatch` en cada tarjeta pero **ningún** selector CSS lo lee; campo `id` sin uso en los 16 productos | Borrar. El CSS los arrastra a cada build |
| M2 | Tres fuentes de verdad para el color de categoría | `store.js:21-26` (`CATEGORY_COLORS`), `index.html` (4 `--accent:#...` hardcodeados), `products.json` (16 `swatch`) | Dejar solo `CATEGORY_COLORS` y derivar el resto |
| M3 | Números mágicos en el visor | `product.js:134-137`: `* 17`, `* 11`, `1100px`, `translateZ(14px)`, `* -26` | Constantes nombradas, como ya se hizo con `ZOOM` en `:174` |
| M4 | `catch` vacío silencia fallos de storage | `ui.js:17` | Aceptable para `localStorage`, pero conviene un comentario que lo justifique |
| M5 | El escalonado del revelado asume 4 columnas | `ui.js:185` `(i % 4) * 70` — en móvil hay 1 columna, así que el retardo no corresponde a la fila real | Derivar de `getComputedStyle(grid).gridTemplateColumns` o aceptar y documentar |
| M6 | Sin enlace de salto al contenido | 0/4 páginas | `<a class="skip" href="#main">Saltar al contenido</a>` |
| M7 | El filtro no se anuncia a lectores de pantalla | `catalog.js:41` repinta el grid sin región viva | `aria-live="polite"` en el contador `#catalog-count` |
| M8 | Versión de Node no fijada | sin `engines` en `package.json`, sin `.nvmrc`/`.mise.toml` | `"engines": { "node": ">=18" }` |
| M9 | Fuentes de Google desde CDN de terceros | 4/4 páginas hacia `fonts.googleapis.com` / `fonts.gstatic.com` | Self-host con `@fontsource` elimina el salto de dominio y la fuga de IP del visitante |
| M10 | 3,4 MB de originales sin decidir | `raw/productos/` sin trackear | Versionar (es el material de la clienta) o mover fuera del repo — pero decidirlo |

---

## 5. Redundancias

| Qué se duplica | Dónde | Propuesta |
|---|---|---|
| Header + footer completos | los 4 `.html` (54 líneas × 4) | Include de Vite o montaje desde `ui.js` |
| Color por categoría | `store.js`, `index.html`, `products.json` | Única fuente en `store.js` |
| Iconos SVG | `icons.js` (28) y copias inline en los HTML (hero, trust, visit, contacto) | Los del chrome estático pueden quedarse inline; eliminar los 11 muertos de `icons.js` |
| Bloque `<script type="module">` de enlaces sociales | `index.html:233-237`, `catalogo.html`, `producto.html`, `nosotros.html` | Mover a `ui.js`, que ya corre en las 4 |
| Mensaje de precio a consultar | `PRICE_ON_REQUEST` y `PRICE_SHORT` en `store.js:33-34` | Justificado (uno es etiqueta corta de tarjeta), pero conviene comentarlo |

---

## 6. Orden de ataque

**Quick wins** (alto impacto / bajo esfuerzo)
1. **C1** — escapar el `handle`. Media hora y cierra la única vulnerabilidad explotable.
2. **I3 parcial** — `npm audit fix` resuelve `nanoid` y `postcss` sin ruptura.
3. **I5** — generar `ficha-160.webp`; el script de imágenes ya existe.
4. **I8** — actualizar el README, incluyendo el pipeline de `rembg` que hoy no está documentado.
5. **M1/M2** — borrar código muerto y unificar colores.

**Estratégicas** (requieren decisión o rato largo)
6. **I1** — recalibrar acentos para texto. Toca el sistema de color completo; hacerlo de una vez y verificar con una tabla de ratios.
7. **I4** — SEO técnico. Bloqueado hasta que haya dominio; es lo que la propuesta ya prometió.
8. **I2** — Vitest para el catálogo + workflow de CI.
9. **I6** — desduplicar el chrome.
10. **I3 completo** — subir Vite a 8.x.

---

## 7. Lo que está bien

- **Peso.** Primera carga de 90 KB con 0 dependencias de runtime. El JS propio son 7,7 KB gzip. La mayoría de sitios de este tipo arrancan con un framework de 40 KB para pintar cuatro páginas estáticas.
- **Sistema de color en dos capas.** Paleta cruda → tokens semánticos → componentes. Es lo que permitió añadir dark mode sin tocar los componentes, y el tema oscuro pasa todos los contrastes medidos.
- **Dark mode sin parpadeo.** El script inline que lee `localStorage` antes de pintar está bien resuelto, y respeta `prefers-color-scheme` como estado por defecto.
- **Estados de interfaz completos.** Error de producto inexistente, catálogo vacío, imagen que falla, confirmación de copiado. Es lo primero que se omite y aquí está.
- **`prefers-reduced-motion`** respetado, y con criterio: se anula la inclinación decorativa pero se preserva el zoom, que es utilidad.
- **Imágenes.** WebP con `srcset`/`sizes`, `width`/`height` contra CLS, `fetchpriority` en el hero, `loading="lazy"` en el resto.
- **Validación del parámetro de catálogo** (`catalog.js:10-11`) contra whitelist. Es exactamente el patrón que falta en `product.js` — el conocimiento estaba en el repo, solo no se aplicó de forma consistente.
- **Honestidad del contenido.** Sin testimonios inventados, sin métricas fabricadas, y con advertencia sanitaria en el producto de consumo interno.

---

## 8. Fuera de alcance / no verificado

- **No se midieron Core Web Vitals reales** (LCP/INP/CLS). La pestaña de pruebas tenía el compositor degradado —timeouts de CDP de 30-45 s, sin despacho de eventos de scroll— lo que invalida cualquier medición de rendimiento percibido. Las cifras de peso son de `dist`, no de campo.
- **No se auditó `propuesta/`** (documento comercial, no software). Nota al margen ya conocida: su texto contradice el posicionamiento actual del sitio.
- **Sin pentest.** La revisión de seguridad es ASVS L1 por lectura de código más una prueba de concepto puntual. No se probaron CSP, cabeceras de respuesta ni configuración de hosting, porque no hay despliegue.
- **Accesibilidad sin lector de pantalla real.** Los contrastes están calculados; el recorrido con NVDA/VoiceOver y la navegación completa por teclado quedan pendientes.
- **Hipótesis no confirmada:** el `hidden` sobre `.state`/`#related`/`#product-cta` depende del `display` del agente de usuario; si alguna regla futura les asigna `display`, dejarán de ocultarse. No ocurre hoy.
