import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import catalog from './products.json'

const categorias = new Set(catalog.categories.map((c) => c.handle))
const IMAGENES = ['frasco-480.webp', 'frasco-960.webp', 'ficha.webp', 'ficha-160.webp']

/**
 * products.json lo edita la tienda a mano. Estos tests cubren las formas de
 * romperlo que no dan error en consola: el sitio compila igual y falla en
 * silencio delante de la clienta.
 */
describe('catálogo', () => {
  it('no repite handles', () => {
    const handles = catalog.products.map((p) => p.handle)
    expect(new Set(handles).size).toBe(handles.length)
  })

  it('usa handles con forma de slug', () => {
    for (const p of catalog.products) {
      expect(p.handle, p.title).toMatch(/^[a-z0-9-]{1,64}$/)
    }
  })

  it('asigna a cada producto una categoría que existe', () => {
    for (const p of catalog.products) {
      expect(categorias, p.handle).toContain(p.category)
    }
  })

  it('trae los campos que la ficha da por hecho', () => {
    for (const p of catalog.products) {
      for (const campo of ['title', 'category', 'presentation', 'shortDescription', 'description', 'use']) {
        expect(p[campo], `${p.handle}.${campo}`).toBeTruthy()
      }
      expect(Array.isArray(p.benefits) && p.benefits.length, `${p.handle}.benefits`).toBeTruthy()
      expect(Array.isArray(p.tags), `${p.handle}.tags`).toBe(true)
    }
  })

  it('deja el precio en null o en un número, nunca en texto', () => {
    for (const p of catalog.products) {
      expect(p.price === null || typeof p.price === 'number', p.handle).toBe(true)
    }
  })

  it('tiene las cuatro imágenes de cada producto en disco', () => {
    for (const p of catalog.products) {
      for (const img of IMAGENES) {
        expect(existsSync(`public/img/productos/${p.handle}/${img}`), `${p.handle}/${img}`).toBe(true)
      }
    }
  })

  it('no deja ninguna categoría vacía', () => {
    for (const c of catalog.categories) {
      const n = catalog.products.filter((p) => p.category === c.handle).length
      expect(n, `la categoría ${c.handle} no tiene productos`).toBeGreaterThan(0)
    }
  })

  it('marca al menos un destacado para la portada', () => {
    expect(catalog.products.some((p) => p.featured)).toBe(true)
  })
})
