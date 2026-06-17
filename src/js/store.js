import catalog from '../data/products.json'

export const SHOP = {
  name: 'Dulces Raíces',
  tagline: 'Sana tradición',
  whatsapp: '573228904164', // 322 890 4164
  whatsappDisplay: '322 890 4164',
  phoneAlt: '313 814 0089',
  address: 'Carrera 29 #15-34, Bomboná · Pasto, Nariño',
  instagram: 'https://www.instagram.com/dulces.raices01/',
  facebook: 'https://www.facebook.com/profile.php?id=100063656336746',
  instagramHandle: 'dulces.raices01',
}

export const { products, categories } = catalog

export const categoryName = (handle) =>
  categories.find((c) => c.handle === handle)?.name ?? handle

// Color andino por categoría (del árbol de la vida) — identidad de marca.
const CATEGORY_COLORS = {
  aceites: '#C5462E',
  esencias: '#9B6FB0',
  belleza: '#E0A02E',
  herbal: '#5B8C3E',
  artesanias: '#2F8C8C',
}
export const categoryColor = (handle) => CATEGORY_COLORS[handle] ?? '#6B4423'

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
})
export const formatPrice = (value) => COP.format(value)

/** Arma un link de WhatsApp con mensaje prearmado. */
export const waLink = (message) =>
  `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`

/** Mensaje de pedido para un producto. */
export const productMessage = (p) =>
  `¡Hola Dulces Raíces! 🌿 Me interesa este producto:\n\n*${p.title}* (${p.presentation})\nPrecio: ${formatPrice(p.price)}\n\n¿Está disponible?`

export const generalMessage =
  '¡Hola Dulces Raíces! 🌿 Quisiera más información sobre sus productos naturales.'

export const getProduct = (handle) => products.find((p) => p.handle === handle)
