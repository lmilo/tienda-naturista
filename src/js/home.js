import { renderCards } from './ui.js'
import { products } from './store.js'

const featured = products.filter((p) => p.featured)
const grid = document.querySelector('#featured-grid')
if (grid) renderCards(grid, featured)
