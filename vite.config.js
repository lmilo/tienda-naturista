import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'

const paginas = {
  '/index.html':    { visitanosHref: 'index.html#visitanos' },
  '/catalogo.html': { visitanosHref: 'index.html#visitanos' },
  '/producto.html': { visitanosHref: 'index.html#visitanos' },
  // Nosotros tiene su propia sección de contacto con ese ancla
  '/nosotros.html': { visitanosHref: '#visitanos' },
}

export default defineConfig({
  root: '.',
  plugins: [
    handlebars({
      partialDirectory: resolve(import.meta.dirname, 'src/partials'),
      context: (pagePath) => paginas[pagePath] ?? paginas['/index.html'],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        catalogo: resolve(import.meta.dirname, 'catalogo.html'),
        producto: resolve(import.meta.dirname, 'producto.html'),
        nosotros: resolve(import.meta.dirname, 'nosotros.html'),
      },
    },
  },
})
