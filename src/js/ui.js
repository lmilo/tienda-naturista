import '../styles/main.css'
import { SHOP, formatPrice, waLink, productMessage, generalMessage, categoryName, categoryColor } from './store.js'
import { categoryIcon } from './icons.js'

/* ---------- Comportamiento global compartido ---------- */
function initChrome() {
  // Año del footer
  const y = document.querySelector('[data-year]')
  if (y) y.textContent = new Date().getFullYear()

  // Link de WhatsApp flotante + cualquier CTA general
  document.querySelectorAll('[data-wa-general]').forEach((el) => {
    el.href = waLink(generalMessage)
  })

  // Menú móvil
  const toggle = document.querySelector('.nav__toggle')
  const links = document.querySelector('.nav__links')
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open')
      toggle.setAttribute('aria-expanded', String(open))
    })
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('is-open'))
    )
  }

  // Marcar enlace activo
  const path = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('.nav__links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('is-active')
  })

  // Reveal al hacer scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible')),
    { threshold: 0.12 }
  )
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
}

/* ---------- Tarjeta de producto ---------- */
export function productCardHTML(p) {
  return `
    <article class="product-card reveal" data-cat="${p.category}" style="--swatch:${p.swatch};--cat:${categoryColor(p.category)}">
      <a class="product-card__media" href="producto.html?p=${p.handle}" aria-label="${p.title}">
        <span class="media-ph">${categoryIcon[p.category] || ''}</span>
        ${p.image ? `<img class="media-img" src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.remove()" />` : ''}
        <span class="product-card__cat">${categoryName(p.category)}</span>
      </a>
      <div class="product-card__body">
        <h3 class="product-card__title">${p.title}</h3>
        <p class="product-card__pres">${p.presentation}</p>
        <p class="product-card__desc">${p.shortDescription}</p>
        <div class="product-card__foot">
          <span class="price">${formatPrice(p.price)}</span>
          <a class="product-card__link" href="producto.html?p=${p.handle}">Ver más</a>
        </div>
      </div>
    </article>`
}

export function renderCards(container, list) {
  container.innerHTML = list.map(productCardHTML).join('')
  // revelado escalonado dentro de la fila visible
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('is-visible')
        io.unobserve(e.target)
      }),
    { threshold: 0.12 }
  )
  container.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`
    io.observe(el)
  })
}

export { SHOP, formatPrice, waLink, productMessage, generalMessage, categoryName }
document.addEventListener('DOMContentLoaded', initChrome)
