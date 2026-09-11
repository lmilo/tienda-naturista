import { resolve } from 'path'
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
      partialDirectory: resolve(__dirname, 'src/partials'),
      context: (pagePath) => paginas[pagePath] ?? paginas['/index.html'],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalogo: resolve(__dirname, 'catalogo.html'),
        producto: resolve(__dirname, 'producto.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
      },
    },
  },
})
