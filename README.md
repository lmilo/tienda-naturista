# Dulces Raíces — Mockup de catálogo

Mockup de diseño (Fase 1) para **Dulces Raíces**, tienda artesanal y naturista de Pasto, Nariño.
Catálogo navegable, sin checkout: cada producto lleva a un pedido por **WhatsApp**.

> Versión preliminar de diseño para validar con la clienta. Las imágenes son provisionales
> (placeholders de color por categoría) y se reemplazan por las fotos reales. El logo es una
> versión SVG provisional hasta tener el archivo oficial.

## Stack
- **Vite** + HTML/CSS/JS vanilla, sin frameworks.
- Mobile-first. Tipografías: Fraunces (títulos) + Mulish (texto).
- Datos de productos en `src/data/products.json` (esquema preparado para migrar a Shopify en Fase 3).

## Cómo correrlo en local

Requisitos: Node 18+ (gestionado con `mise`).

```bash
npm install      # instala dependencias (solo Vite)
npm run dev      # arranca el servidor de desarrollo
```

Vite imprime una URL, normalmente **http://localhost:5173**. Ábrela en el navegador.
El servidor recarga solo al guardar cambios.

Otros comandos:
```bash
npm run build    # genera la versión final en /dist
npm run preview  # sirve /dist para revisar el build
```

## Estructura
```
index.html        → Inicio (hero, destacados, categorías)
catalogo.html     → Catálogo con filtros por categoría
producto.html     → Ficha de producto (?p=handle) + relacionados
nosotros.html     → Quiénes somos + valores + contacto
src/
  data/products.json   → catálogo (editar aquí para cambiar productos/precios)
  js/store.js          → datos de la tienda (WhatsApp, dirección, redes) + helpers
  js/ui.js             → comportamiento compartido + tarjeta de producto
  js/{home,catalog,product}.js → lógica por página
  styles/main.css      → sistema de diseño completo (tokens + componentes)
public/img/       → logo y patrón andino (greca), provisionales
```

## Editar contenido
- **Productos / precios:** `src/data/products.json`.
- **WhatsApp, dirección, redes:** `src/js/store.js` (constante `SHOP`).
- **Colores / tipografía:** variables CSS al inicio de `src/styles/main.css`.
