# Dulces Raíces — catálogo web

Sitio de catálogo para **Dulces Raíces**, tienda naturista de Pasto, Nariño.
Navegable, sin checkout: cada producto lleva a un pedido por **WhatsApp**.

Publicado en [dulcesraices.netlify.app](https://dulcesraices.netlify.app).

> **La tienda selecciona y tiene línea propia.** Casi todo el catálogo son
> marcas comerciales (Funat, Natural Sant, Urbanatt, Athos, Fito Medic's…) que
> la tienda revende y sobre las que asesora. Desde el lote del 28-oct hay
> además aceites de **línea propia** con los teléfonos de la tienda en la
> etiqueta, bajo «Sanas Raíces» y «Dulces Raíces». Los textos dicen «nuestra
> línea», nunca «fabricamos»: no consta que los produzcan ellos.

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
  foto-480.webp  foto-960.webp   foto que envió la tienda, con su fondo original, en 2:3

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

Cada producto lleva **la foto que envió la tienda, con su fondo original**: no
se recorta el envase ni se inventa fondo. Si un lote trae foto nueva de un
producto que ya existe, la nueva reemplaza a la anterior.

Lo único que se normaliza es el marco, para que el grid sea parejo:

1. Lienzo **2:3** (480×720 y 960×1440, WebP).
2. Si la foto se aparta ≤ 6 % de 2:3, recorte centrado mínimo.
3. Si se aparta más (banners horizontales, fotos casi cuadradas), entra
   completa sobre el crema de marca `#FBF6EC`, sin recortar nada.

Los originales quedan en `raw/` para poder rehacerlo.

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
