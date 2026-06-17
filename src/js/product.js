import { renderCards, waLink, productMessage, formatPrice, categoryName } from './ui.js'
import { getProduct, products } from './store.js'
import { categoryIcon } from './icons.js'

const handle = new URLSearchParams(location.search).get('p')
const product = handle && getProduct(handle)
const root = document.querySelector('#product-root')

if (!product) {
  root.innerHTML = `
    <div class="section" style="text-align:center">
      <h1 class="section-head__h">No encontramos ese producto</h1>
      <p style="color:var(--ink-soft);margin:1rem 0 1.6rem">Puede que ya no esté disponible o el enlace sea incorrecto.</p>
      <a class="btn btn--primary" href="catalogo.html">Ver el catálogo</a>
    </div>`
} else {
  document.title = `${product.title} · Dulces Raíces`
  root.innerHTML = `
    <nav class="breadcrumb container">
      <a href="index.html">Inicio</a> / <a href="catalogo.html">Catálogo</a> / ${product.title}
    </nav>
    <div class="container">
      <div class="product">
        <div class="product__media" style="--swatch:${product.swatch}">
          <span class="media-ph">${categoryIcon[product.category] || ''}</span>
          ${product.image ? `<img class="media-img" src="${product.image}" alt="${product.title}" onerror="this.remove()" />` : ''}
        </div>
        <div class="product__info">
          <p class="eyebrow product__cat">${categoryName(product.category)}</p>
          <h1 class="product__title">${product.title}</h1>
          <p><span class="product__price">${formatPrice(product.price)}</span><span class="product__pres">· ${product.presentation}</span></p>
          <p class="product__desc">${product.description}</p>
          <div class="product__use">
            <h4>Modo de uso</h4>
            <p>${product.use}</p>
          </div>
          <div class="product__tags">
            ${product.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="product__actions">
            <a class="btn btn--wa btn--lg" href="${waLink(productMessage(product))}" target="_blank" rel="noopener">
              ${pedirIcon()} Pedir por WhatsApp
            </a>
            <a class="btn btn--ghost btn--lg" href="catalogo.html">Seguir viendo</a>
          </div>
          <p class="product__note">Te respondemos por WhatsApp para coordinar pago y entrega. Asesoría gratuita.</p>
        </div>
      </div>
    </div>`
}

// Relacionados
const relGrid = document.querySelector('#related-grid')
if (relGrid && product) {
  const related = products
    .filter((p) => p.category === product.category && p.handle !== product.handle)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, 4)
  renderCards(relGrid, related)
}

function pedirIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zM6.597 20.13c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 0 0 1.523 5.27l-.999 3.648 3.965-.617z"/></svg>`
}
