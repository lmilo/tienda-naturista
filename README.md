# Dulces Raíces — catálogo web

Sitio de catálogo para **Dulces Raíces**, tienda naturista de Pasto, Nariño.
Navegable, sin checkout: cada producto lleva a un pedido por **WhatsApp**.

Publicado en [dulcesraices.netlify.app](https://dulcesraices.netlify.app).

> **La tienda selecciona, no fabrica.** El catálogo son marcas comerciales
> (Funat, Natural Shot, Natural Saint, Capibell, Beautyline, Kiss Beauty,
> Flora, Fito Médica) que la tienda revende y sobre las que asesora. Los
> textos del sitio están escritos desde ese posicionamiento: si algún día
> hay línea propia, hay que revisarlos.

## Stack

- **Vite 8** + HTML/CSS/JS vanilla. Cero dependencias de runtime.
- Mobile-first. Tipografías **Fraunces** (títulos) y **Mulish** (texto), self-host.
- Datos en `src/data/products.json` (esquema preparado para migrar a Shopify).
- Sin dominios externos: ni fuentes, ni analítica, ni CDN.

## Correr en local

Requiere Node ≥ 20.19 (ver `.nvmrc`, gestionado con `mise`).

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | genera `/dist` |
| `npm run preview` | sirve `/dist` |
| `npm test` | tests del catálogo y de seguridad |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run check` | lint + tests + build, lo mismo que corre el CI |

## Estructura

```
index.html        Inicio: hero, destacados, categorías, visítanos, marcas
catalogo.html     Catálogo con filtros por categoría
producto.html     Ficha (?p=handle): visor, beneficios, relacionados
nosotros.html     Historia, valores, contacto

src/
  data/products.json   catálogo — editar aquí productos y precios
  data/catalogo.test.js
  partials/            header y footer, inyectados en build
  js/store.js          datos de la tienda, helpers, esc(), colores por categoría
  js/ui.js             chrome compartido: tema, toasts, nav, reveals, tarjeta
  js/{home,catalog,product}.js
  js/icons.js          iconos SVG inline
  styles/main.css      sistema de diseño (tokens crudos → semánticos → componentes)

public/img/productos/<handle>/
  frasco-480.webp  frasco-960.webp   envase recortado sobre fondo de marca
  ficha.webp       ficha-160.webp    infografía del fabricante y su miniatura

raw/productos/    originales que envió la tienda — fuente del pipeline de imágenes
```

## Editar contenido

- **Productos y precios:** `src/data/products.json`. Corre `npm test` después:
  valida handles, categorías, campos obligatorios y que las imágenes existan.
- **WhatsApp, dirección, redes:** constante `SHOP` en `src/js/store.js`.
- **Dominio:** constante `SITE_URL` en `src/js/store.js` (canonical, OG, JSON-LD).
- **Colores y tipografía:** tokens al inicio de `src/styles/main.css`.

### Precios

Hoy todos los productos tienen `price: null` y el sitio muestra «Consultar
precio». Al poner un número aparece formateado en pesos, sin tocar nada más.

## Pipeline de imágenes

Las fotos que envió la tienda **no son fotos de producto**: son infografías de
marketing del fabricante, cada una con su propia paleta. Puestas tal cual, el
catálogo queda como un collage multicolor.

El procesamiento que se les aplicó:

1. **Recorte del envase** con [`rembg`](https://github.com/danielgatis/rembg)
   (modelo `isnet-general-use`; `u2net` funcionó mejor en las dos imágenes de
   baja resolución). Un caso —la caja verde de Funat— no lo resolvió ningún
   modelo, porque su cuerpo blanco se funde con el fondo claro: se recortó con
   un polígono ajustado a sus aristas.
2. **Normalización:** cada envase se compone sobre un lienzo cuadrado con el
   crema de marca `#FBF6EC`, misma línea de base y sombra de contacto, para que
   el grid se lea como una serie fotográfica.
3. **Exportación** a WebP en cuatro tamaños.

`rembg` no es dependencia del proyecto: se instala aparte solo si hay que
reprocesar imágenes (`pip install "rembg[cpu]" onnxruntime`, descarga ~170 MB
de modelo). Los originales quedan en `raw/productos/` para poder rehacerlo.

## Calidad

- **Accesibilidad:** WCAG 2.2 AA verificado en las 20 combinaciones de color de
  ambos temas. Salto al contenido, foco visible, `prefers-reduced-motion`.
- **Seguridad:** todo lo que se interpola en HTML pasa por `esc()`; el
  parámetro `?p=` se valida contra la forma de un slug. Cabeceras (CSP,
  Referrer-Policy, Permissions-Policy) en `netlify.toml`.
- **SEO:** JSON-LD `HealthAndBeautyBusiness`, Open Graph, canonical, sitemap.
- El diagnóstico completo está en `AUDITORIA-2026-09-11.md`.

## Pendiente

- **Precios**, cuando la tienda los defina.
- **Fotos nuevas** de Romero & Quina y Tónico Capilar: sus originales eran de
  315×620 y 293×371, y el recorte se ve blando.
- **Reseñas reales de Google.** La sección de testimonios se retiró: no se
  publican testimonios inventados.
- `propuesta/` describe a la tienda como fabricante artesanal, lo que ya no
  corresponde con el sitio.
