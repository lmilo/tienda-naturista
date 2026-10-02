import { renderCards, observeReveals } from './ui.js'
import { products, categories, brands, categoryColor, categoryInk, esc } from './store.js'

const featured = products.filter((p) => p.featured)
const grid = document.querySelector('#featured-grid')
if (grid) renderCards(grid, featured)

// Las categorías se pintan desde el catálogo: así el HTML no queda desfasado
// cada vez que la tienda suma o quita una.
const catGrid = document.querySelector('#cat-grid')
if (catGrid) {
  catGrid.innerHTML = categories
    .map((c) => {
      const n = products.filter((p) => p.category === c.handle).length
      return `<a class="cat-card reveal" href="catalogo.html?cat=${c.handle}" style="--accent:${categoryColor(c.handle)}">
        <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
        <span>Ver ${n} ${n === 1 ? 'producto' : 'productos'} →</span></a>`
    })
    .join('')
  observeReveals(catGrid)
}

const verTodos = document.querySelector('#ver-todos')
if (verTodos) verTodos.textContent = `Ver los ${products.length} productos`

const brandGrid = document.querySelector('#brands-grid')
if (brandGrid) {
  // Con 29 marcas la franja ocuparía ocho filas: se muestran las más surtidas
  // y el resto se resume en una línea.
  const TOPE = 12
  const todas = brands()
  const visibles = todas.slice(0, TOPE)
  const resto = todas.length - visibles.length

  brandGrid.innerHTML = visibles
    .map(
      (b) => `
      <article class="brand-card reveal" style="--cat:${categoryColor(b.category)};--cat-ink:${categoryInk(b.category)}">
        <h3 class="brand-card__name">${esc(b.name)}</h3>
        <p class="brand-card__n">${b.count} ${b.count === 1 ? 'producto' : 'productos'}</p>
      </article>`
    )
    .join('')
  brandGrid.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`
  })
  const pie = document.querySelector('#brands-more')
  if (pie && resto > 0) pie.textContent = `y ${resto} marcas más en el local`
  observeReveals(brandGrid)
}
