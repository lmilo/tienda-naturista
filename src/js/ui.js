import '../styles/main.css'
import {
  SHOP, formatPrice, hasPrice, waLink, productMessage, generalMessage,
  categoryName, categoryColor, categoryInk, imageOf, esc, PRICE_SHORT,
} from './store.js'
import { icons } from './icons.js'

const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Tema claro / oscuro ---------- */
const THEME_KEY = 'dr-theme'

export function applyTheme(mode) {
  const root = document.documentElement
  if (mode === 'auto') root.removeAttribute('data-theme')
  else root.dataset.theme = mode
  try {
    mode === 'auto' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, mode)
  } catch {
    // Modo privado o cookies bloqueadas: el tema no persiste entre visitas
    // y el sitio sigue funcionando. No hay nada que reportar al visitante.
  }
}

function currentTheme() {
  if (document.documentElement.dataset.theme) return document.documentElement.dataset.theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]')
  if (!btn) return
  const paint = () => {
    const dark = currentTheme() === 'dark'
    btn.innerHTML = dark ? icons.sun : icons.moon
    btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro')
    btn.setAttribute('title', btn.getAttribute('aria-label'))
  }
  paint()
  btn.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')
    paint()
  })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) paint()
  })
}

/* ---------- Avisos flotantes ---------- */
export function toast(message, kind = 'ok') {
  let host = document.querySelector('.toasts')
  if (!host) {
    host = document.createElement('div')
    host.className = 'toasts'
    host.setAttribute('role', 'status')
    host.setAttribute('aria-live', 'polite')
    document.body.appendChild(host)
  }
  const el = document.createElement('div')
  el.className = `toast toast--${kind}`
  el.innerHTML = `<span class="toast__icon">${kind === 'ok' ? icons.check : icons.alert}</span><span>${esc(message)}</span>`
  host.appendChild(el)
  requestAnimationFrame(() => el.classList.add('is-in'))
  setTimeout(() => {
    el.classList.remove('is-in')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
  }, 3200)
}

/* ---------- Copiar al portapapeles ---------- */
function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', async (ev) => {
      ev.preventDefault()
      const value = el.dataset.copy
      try {
        await navigator.clipboard.writeText(value)
        toast('Copiado: ' + value)
      } catch {
        toast('No se pudo copiar. Selecciona el texto a mano.', 'warn')
      }
    })
  })
}

/* ---------- Volver arriba ---------- */
function initToTop() {
  const btn = document.querySelector('[data-to-top]')
  if (!btn) return
  btn.innerHTML = icons.arrowUp
  const onScroll = () => btn.classList.toggle('is-in', window.scrollY > window.innerHeight * 0.8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: prefersStill() ? 'auto' : 'smooth' })
  )
}

/* ---------- Cabecera que reacciona al scroll ---------- */
function initHeader() {
  const header = document.querySelector('.site-header')
  if (!header) return
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

/* ---------- Revelado al entrar en pantalla ---------- */
const revealIO = new IntersectionObserver(
  (entries, obs) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('is-visible')
      obs.unobserve(e.target)
    }),
  { threshold: 0.12, rootMargin: '0px 0px -40px' }
)

export function observeReveals(scope = document) {
  scope.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealIO.observe(el))
}

/* ---------- Comportamiento global compartido ---------- */
function initChrome() {
  const y = document.querySelector('[data-year]')
  if (y) y.textContent = new Date().getFullYear()

  document.querySelectorAll('[data-wa-general]').forEach((el) => {
    el.href = waLink(generalMessage)
  })

  // Enlaces que dependen de los datos de la tienda, antes repetidos en cada página
  const mapsQuery = encodeURIComponent(SHOP.addressQuery)
  const enlaces = {
    '[data-ig]': SHOP.instagram,
    '[data-fb]': SHOP.facebook,
    '[data-maps-search]': `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    '[data-maps-dir]': `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
  }
  for (const [sel, href] of Object.entries(enlaces)) {
    document.querySelectorAll(sel).forEach((el) => el.setAttribute('href', href))
  }

  // Menú móvil
  const toggle = document.querySelector('.nav__toggle')
  const links = document.querySelector('.nav__links')
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('is-open', open)
      toggle.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      document.body.classList.toggle('is-locked', open)
    }
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('is-open')))
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)))
    document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false))
  }

  // Enlace activo
  const path = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('.nav__links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('is-active')
  })

  initTheme()
  initHeader()
  initToTop()
  initCopy()
  observeReveals()
}

/* ---------- Tarjeta de producto ---------- */
export function productCardHTML(p) {
  const precio = hasPrice(p)
    ? `<span class="price">${formatPrice(p.price)}</span>`
    : `<span class="price price--ask">${PRICE_SHORT}</span>`
  return `
    <article class="product-card reveal" data-cat="${p.category}" style="--cat:${categoryColor(p.category)};--cat-ink:${categoryInk(p.category)}">
      <a class="product-card__media" href="producto.html?p=${p.handle}" aria-label="Ver ${esc(p.title)}">
        <img class="media-img" src="${imageOf(p, 480)}"
             srcset="${imageOf(p, 480)} 480w, ${imageOf(p, 960)} 960w"
             sizes="(max-width: 560px) 92vw, (max-width: 900px) 45vw, 290px"
             alt="${esc(p.title)}" width="480" height="480" loading="lazy" decoding="async" />
        <span class="product-card__cat">${esc(categoryName(p.category))}</span>
      </a>
      <div class="product-card__body">
        ${p.brand ? `<p class="product-card__brand">${esc(p.brand)}</p>` : ''}
        <h3 class="product-card__title">${esc(p.title)}</h3>
        <p class="product-card__pres">${esc(p.presentation)}</p>
        <p class="product-card__desc">${esc(p.shortDescription)}</p>
        <div class="product-card__foot">
          ${precio}
          <a class="product-card__link" href="producto.html?p=${p.handle}">Ver más</a>
        </div>
      </div>
    </article>`
}

export function renderCards(container, list) {
  container.innerHTML = list.map(productCardHTML).join('')
  // El escalonado debe seguir las columnas reales: en móvil hay una sola y
  // un módulo fijo de 4 retrasaba tarjetas que ya estaban en pantalla.
  const columnas = getComputedStyle(container).gridTemplateColumns.split(' ').length || 1
  container.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % columnas) * 70}ms`
  })
  observeReveals(container)
}

export { SHOP, formatPrice, hasPrice, waLink, productMessage, generalMessage, categoryName, imageOf }
document.addEventListener('DOMContentLoaded', initChrome)
