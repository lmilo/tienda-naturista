import { renderCards } from './ui.js'
import { products, categories, categoryColor, esc } from './store.js'

const grid = document.querySelector('#catalog-grid')
const filterBar = document.querySelector('#filters')
const empty = document.querySelector('#catalog-empty')
const count = document.querySelector('#catalog-count')

const known = new Set(categories.map((c) => c.handle))
const requested = new URLSearchParams(location.search).get('cat')
let active = requested && known.has(requested) ? requested : 'todos'

function build() {
  const all = [{ handle: 'todos', name: 'Todos' }, ...categories]
  filterBar.innerHTML = all
    .map((c) => {
      const n = c.handle === 'todos' ? products.length : products.filter((p) => p.category === c.handle).length
      return `<button class="filter-chip${c.handle === active ? ' is-active' : ''}" data-cat="${c.handle}"
        style="--cat:${c.handle === 'todos' ? 'var(--cacao-600)' : categoryColor(c.handle)}"
        aria-pressed="${c.handle === active}">${esc(c.name)}<span class="filter-chip__n">${n}</span></button>`
    })
    .join('')

  filterBar.querySelectorAll('.filter-chip').forEach((b) =>
    b.addEventListener('click', () => {
      active = b.dataset.cat
      filterBar.querySelectorAll('.filter-chip').forEach((x) => {
        const on = x === b
        x.classList.toggle('is-active', on)
        x.setAttribute('aria-pressed', String(on))
      })
      const url = new URL(location.href)
      active === 'todos' ? url.searchParams.delete('cat') : url.searchParams.set('cat', active)
      history.replaceState({}, '', url)
      paint()
    })
  )
}

function paint() {
  const list = active === 'todos' ? products : products.filter((p) => p.category === active)
  renderCards(grid, list)
  empty.hidden = list.length > 0
  if (count) {
    count.textContent = list.length === 1 ? '1 producto' : `${list.length} productos`
  }
}

if (grid) {
  // Un ?cat= desconocido no debe dejar la página en blanco
  if (requested && !known.has(requested)) {
    const url = new URL(location.href)
    url.searchParams.delete('cat')
    history.replaceState({}, '', url)
  }
  build()
  paint()
}
