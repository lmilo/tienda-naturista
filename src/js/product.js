import { renderCards, waLink, productMessage, formatPrice, hasPrice, categoryName, toast, observeReveals } from './ui.js'
import { getProduct, products, imageOf, sheetOf, sheetThumbOf, categoryColor, categoryInk, esc, PRICE_ON_REQUEST } from './store.js'
import { icons } from './icons.js'

const HANDLE_RE = /^[a-z0-9-]{1,64}$/
const rawHandle = new URLSearchParams(location.search).get('p') ?? ''
const handle = HANDLE_RE.test(rawHandle) ? rawHandle : null
const product = handle && getProduct(handle)
const root = document.querySelector('#product-root')
const related = document.querySelector('#related')
const productCta = document.querySelector('#product-cta')

if (!product) {
  document.title = 'Producto no encontrado · Dulces Raíces'
  if (related) related.hidden = true
  if (productCta) productCta.hidden = true
  root.innerHTML = `
    <div class="container">
      <div class="state state--error">
        <span class="state__icon">${icons.alert}</span>
        <h1 class="state__title">No encontramos ese producto</h1>
        <p class="state__text">
          ${handle ? 'El enlace apunta a <code data-handle></code>, que ya no está en el catálogo.' : 'El enlace llegó sin una referencia de producto válida.'}
          Puede que lo hayamos retirado o que la dirección esté incompleta.
        </p>
        <div class="state__actions">
          <a class="btn btn--primary" href="catalogo.html">Ver el catálogo</a>
          <a class="btn btn--ghost" href="#" data-wa-general target="_blank" rel="noopener">Preguntar por WhatsApp</a>
        </div>
      </div>
    </div>`
  // textContent, nunca innerHTML: el valor viene de la URL.
  const slot = root.querySelector('[data-handle]')
  if (slot) slot.textContent = handle
} else {
  document.title = `${product.title} · Dulces Raíces`
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', `${product.title}${product.brand ? ' de ' + product.brand : ''} · ${product.presentation}. ${product.shortDescription} Pedidos por WhatsApp en Pasto.`)

  const precio = hasPrice(product)
    ? `<span class="product__price">${formatPrice(product.price)}</span>`
    : `<span class="product__price product__price--ask">${PRICE_ON_REQUEST}</span>`

  root.innerHTML = `
    <nav class="breadcrumb container" aria-label="Migas de pan">
      <a href="index.html">Inicio</a>
      <span aria-hidden="true">/</span>
      <a href="catalogo.html?cat=${product.category}">${esc(categoryName(product.category))}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(product.title)}</span>
    </nav>
    <div class="container">
      <div class="product" style="--cat:${categoryColor(product.category)};--cat-ink:${categoryInk(product.category)}">
        <div class="product__gallery">
          <figure class="viewer" data-viewer tabindex="0" aria-label="Vista del producto. Actívalo para ampliar.">
            <div class="viewer__stage">
              <img class="viewer__img is-active" data-view="frasco"
                   src="${imageOf(product, 960)}" alt="${esc(product.title)}"
                   width="960" height="960" fetchpriority="high" decoding="async" />
              <img class="viewer__img" data-view="ficha"
                   src="${sheetOf(product)}" alt="Información del fabricante sobre ${esc(product.title)}"
                   loading="lazy" decoding="async" />
            </div>
            <span class="viewer__hint">${icons.zoom}<span>Clic para ampliar</span></span>
          </figure>
          <div class="viewer__thumbs" role="group" aria-label="Vistas del producto">
            <button type="button" class="thumb is-active" data-go="frasco" aria-pressed="true">
              <img src="${imageOf(product, 480)}" alt="" width="480" height="480" loading="lazy" />
              <span>Producto</span>
            </button>
            <button type="button" class="thumb" data-go="ficha" aria-pressed="false">
              <img src="${sheetThumbOf(product)}" alt="" width="200" height="300" loading="lazy" />
              <span>Beneficios</span>
            </button>
          </div>
        </div>

        <div class="product__info">
          <p class="eyebrow product__cat">${esc(categoryName(product.category))}</p>
          <h1 class="product__title">${esc(product.title)}</h1>
          ${product.brand ? `<p class="product__brand">de <strong>${esc(product.brand)}</strong></p>` : ''}
          <p class="product__meta">${precio}<span class="product__pres">${esc(product.presentation)}</span></p>
          <p class="product__desc">${esc(product.description)}</p>

          <ul class="product__benefits">
            ${product.benefits.map((b) => `<li>${icons.check}<span>${esc(b)}</span></li>`).join('')}
          </ul>

          <div class="product__use">
            <h4>Modo de uso</h4>
            <p>${esc(product.use)}</p>
          </div>

          <div class="product__tags">
            ${product.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>

          <div class="product__actions">
            <a class="btn btn--wa btn--lg" href="${waLink(productMessage(product))}" target="_blank" rel="noopener">
              ${icons.whatsapp} Pedir por WhatsApp
            </a>
            <a class="btn btn--ghost btn--lg" href="catalogo.html">Seguir viendo</a>
          </div>
          <p class="product__note">Te respondemos por WhatsApp para confirmar disponibilidad, precio y entrega. La asesoría es gratuita.</p>
        </div>
      </div>
    </div>`

  initViewer()
  observeReveals()
}

/* ---------- Visor: cambio de vista, inclinación y lupa ---------- */
function initViewer() {
  const viewer = document.querySelector('[data-viewer]')
  if (!viewer) return
  const stage = viewer.querySelector('.viewer__stage')
  const still = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Cambio entre frasco e infografía
  const views = [...viewer.querySelectorAll('.viewer__img')]
  const thumbs = [...document.querySelectorAll('.thumb')]
  const show = (name) => {
    views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === name))
    thumbs.forEach((t) => {
      const on = t.dataset.go === name
      t.classList.toggle('is-active', on)
      t.setAttribute('aria-pressed', String(on))
    })
    viewer.classList.toggle('is-sheet', name === 'ficha')
    reset()
  }
  thumbs.forEach((t) => t.addEventListener('click', () => show(t.dataset.go)))

  // Inclinación con parálaje
  const TILT_Y = 17      // grados máximos de giro horizontal
  const TILT_X = 11      // grados máximos de cabeceo
  const DEPTH = 14       // px que el envase se adelanta al inclinarse
  const PERSPECTIVE = 1100
  const SHADOW_SHIFT = 26 // px que la sombra se corre en sentido contrario

  const reset = () => { stage.style.transform = '' }
  const tilt = (px, py) => {
    if (still.matches || viewer.classList.contains('is-zoom')) return
    const ry = (px - 0.5) * TILT_Y
    const rx = (0.5 - py) * TILT_X
    stage.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${DEPTH}px)`
    viewer.style.setProperty('--shadow-x', `${(px - 0.5) * -SHADOW_SHIFT}px`)
  }

  viewer.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    const r = viewer.getBoundingClientRect()
    tilt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  })
  viewer.addEventListener('pointerleave', reset)

  // Giroscopio en móvil, solo si el visitante lo concede
  const motionBtn = document.querySelector('[data-motion]')
  if (motionBtn) {
    const listen = () => {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma == null || e.beta == null) return
        tilt(0.5 + Math.max(-1, Math.min(1, e.gamma / 45)) / 2,
             0.5 + Math.max(-1, Math.min(1, (e.beta - 45) / 45)) / 2)
      })
      motionBtn.hidden = true
    }
    const needsPermission = typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    if (!needsPermission && 'ondeviceorientation' in window) motionBtn.hidden = true
    else if (needsPermission) {
      motionBtn.hidden = false
      motionBtn.addEventListener('click', async () => {
        try {
          const r = await DeviceOrientationEvent.requestPermission()
          r === 'granted' ? listen() : toast('Permiso de movimiento denegado.', 'warn')
        } catch { toast('Este dispositivo no permite el giro.', 'warn') }
      })
    }
  }

  // Lupa. La escala va en línea igual que la inclinación: así una no pisa
  // a la otra y no depende de qué regla gane en la cascada.
  const ZOOM = 2.1
  const zoom = (on) => {
    viewer.classList.toggle('is-zoom', on)
    stage.style.transform = on ? `scale(${ZOOM})` : ''
    if (!on) stage.style.transformOrigin = ''
  }
  viewer.addEventListener('click', () => {
    zoom(!viewer.classList.contains('is-zoom'))
  })
  viewer.addEventListener('pointermove', (e) => {
    if (!viewer.classList.contains('is-zoom')) return
    const r = viewer.getBoundingClientRect()
    stage.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
  })
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(!viewer.classList.contains('is-zoom')) }
    if (e.key === 'Escape') zoom(false)
  })

  // Si una imagen no carga, se retira la vista en vez de dejar el hueco roto
  views.forEach((img) => {
    img.addEventListener('error', () => {
      const t = thumbs.find((x) => x.dataset.go === img.dataset.view)
      if (t) t.remove()
      img.remove()
      if (img.classList.contains('is-active')) show('frasco')
    })
  })
}

/* ---------- Relacionados ---------- */
const relGrid = document.querySelector('#related-grid')
if (relGrid && product) {
  const list = products
    .filter((p) => p.category === product.category && p.handle !== product.handle)
    .concat(products.filter((p) => p.category !== product.category && p.featured))
    .slice(0, 4)
  renderCards(relGrid, list)
}
