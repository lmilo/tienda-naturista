import catalog from '../data/products.json'

/** Cambiar aquí al pasar a dominio propio. */
export const SITE_URL = 'https://dulcesraices.netlify.app'

export const SHOP = {
  name: 'Dulces Raíces',
  tagline: 'Sana tradición',
  whatsapp: '573228904164', // 322 890 4164
  whatsappDisplay: '322 890 4164',
  phoneAlt: '313 814 0089',
  address: 'Carrera 29 #15-34, Bomboná · Pasto, Nariño',
  addressQuery: 'Carrera 29 15-34 Bombona Pasto Narino',
  instagram: 'https://www.instagram.com/dulces.raices01/',
  facebook: 'https://www.facebook.com/profile.php?id=100063656336746',
  instagramHandle: 'dulces.raices01',
}

export const { products, categories } = catalog

/**
 * Escapa texto para interpolarlo en HTML.
 * El catálogo lo edita la tienda a mano: sin esto, un `<` en una descripción
 * rompe el marcado, y cualquier dato que venga de fuera se vuelve inyectable.
 */
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  )

export const categoryName = (handle) =>
  categories.find((c) => c.handle === handle)?.name ?? handle

// Color andino por categoría (del árbol de la vida) — identidad de marca.
const CATEGORY_COLORS = {
  capilar: '#9B6FB0',
  esencias: '#2F8C8C',
  piel: '#E0A02E',
  bienestar: '#5B8C3E',
  suplementos: '#4A7DB0',
  jabones: '#D77A2B',
  aromaterapia: '#C5462E',
  tradicional: '#6B4423',
}
/** Mismo tono, oscurecido hasta 4.5:1 sobre crema. Para texto y fondos con texto blanco. */
const CATEGORY_INK = {
  capilar: '#89629C',
  esencias: '#297C7C',
  piel: '#93691E',
  bienestar: '#507C37',
  suplementos: '#3F6E9E',
  jabones: '#9E5920',
  aromaterapia: '#B03F29',
  tradicional: '#6B4423',
}
export const categoryColor = (handle) => CATEGORY_COLORS[handle] ?? '#6B4423'
export const categoryInk = (handle) => CATEGORY_INK[handle] ?? '#5B3A22'

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
})

export const PRICE_ON_REQUEST = 'Consultar por WhatsApp'
export const PRICE_SHORT = 'Consultar precio'

/** Los precios los define la tienda; mientras no estén, se consultan por WhatsApp. */
export const formatPrice = (value) =>
  typeof value === 'number' ? COP.format(value) : PRICE_ON_REQUEST

export const hasPrice = (p) => typeof p.price === 'number'

export const imageOf = (p, size = 480) => `/img/productos/${p.handle}/foto-${size}.webp`

/** Arma un link de WhatsApp con mensaje prearmado. */
export const waLink = (message) =>
  `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`

/** Mensaje de pedido para un producto. */
export const productMessage = (p) => {
  const linea = hasPrice(p) ? `Precio: ${formatPrice(p.price)}\n\n¿Está disponible?` : '¿Está disponible y cuál es el precio?'
  return `¡Hola Dulces Raíces! 🌿 Me interesa este producto:\n\n*${p.title}* (${p.presentation})\n${linea}`
}

export const generalMessage =
  '¡Hola Dulces Raíces! 🌿 Quisiera más información sobre sus productos naturales.'

export const getProduct = (handle) => products.find((p) => p.handle === handle)

/** Marcas del catálogo, de la más surtida a la menos. Se recalcula sola al cambiar products.json. */
export const brands = () => {
  const map = new Map()
  for (const p of products) {
    if (!p.brand) continue
    const b = map.get(p.brand) ?? { name: p.brand, count: 0, category: p.category }
    b.count += 1
    map.set(p.brand, b)
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
