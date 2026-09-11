import { renderCards, observeReveals } from './ui.js'
import { products, brands, categoryColor, esc } from './store.js'

const featured = products.filter((p) => p.featured)
const grid = document.querySelector('#featured-grid')
if (grid) renderCards(grid, featured)

const brandGrid = document.querySelector('#brands-grid')
if (brandGrid) {
  brandGrid.innerHTML = brands()
    .map(
      (b) => `
      <article class="brand-card reveal" style="--cat:${categoryColor(b.category)}">
        <h3 class="brand-card__name">${esc(b.name)}</h3>
        <p class="brand-card__n">${b.count} ${b.count === 1 ? 'producto' : 'productos'}</p>
      </article>`
    )
    .join('')
  brandGrid.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`
  })
  observeReveals(brandGrid)
}
