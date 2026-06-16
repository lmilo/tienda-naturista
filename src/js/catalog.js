import { renderCards } from './ui.js'
import { products, categories } from './store.js'

const grid = document.querySelector('#catalog-grid')
const filterBar = document.querySelector('#filters')
const empty = document.querySelector('#catalog-empty')

let active = new URLSearchParams(location.search).get('cat') || 'todos'

function build() {
  const all = [{ handle: 'todos', name: 'Todos' }, ...categories]
  filterBar.innerHTML = all
    .map(
      (c) =>
        `<button class="filter-chip${c.handle === active ? ' is-active' : ''}" data-cat="${c.handle}">${c.name}</button>`
    )
    .join('')
  filterBar.querySelectorAll('.filter-chip').forEach((b) =>
    b.addEventListener('click', () => {
      active = b.dataset.cat
      filterBar.querySelectorAll('.filter-chip').forEach((x) => x.classList.toggle('is-active', x === b))
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
}

if (grid) {
  build()
  paint()
}
