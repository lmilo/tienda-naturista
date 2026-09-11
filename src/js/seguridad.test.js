import { describe, it, expect } from 'vitest'
import { esc } from './store.js'

/**
 * Regresión del hallazgo C1 de la auditoría: el parámetro ?p= entraba sin
 * escapar a innerHTML y un enlace fabricado ejecutaba JS en el origen.
 */
describe('escapado de HTML', () => {
  it('neutraliza las cargas que rompen el marcado', () => {
    const cargas = [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      '"><svg onload=alert(1)>',
      "'; alert(1); //",
    ]
    for (const carga of cargas) {
      const salida = esc(carga)
      expect(salida).not.toContain('<')
      expect(salida).not.toContain('>')
      expect(salida).not.toContain('"')
    }
  })

  it('deja intacto el texto normal del catálogo', () => {
    expect(esc('Shampoo Romero & Quina')).toBe('Shampoo Romero &amp; Quina')
    expect(esc('Esencia Floral Sin Estrés')).toBe('Esencia Floral Sin Estrés')
    expect(esc('30 ml (1 fl. oz.)')).toBe('30 ml (1 fl. oz.)')
  })

  it('tolera null y undefined sin escupir la palabra', () => {
    expect(esc(null)).toBe('')
    expect(esc(undefined)).toBe('')
  })
})

describe('validación del handle de la URL', () => {
  const HANDLE_RE = /^[a-z0-9-]{1,64}$/

  it('acepta los handles reales del catálogo', () => {
    for (const h of ['crema-hidratante-de-arroz', 'siete-hierbas-sin-sal', 'a-petit-esencia-floral']) {
      expect(HANDLE_RE.test(h), h).toBe(true)
    }
  })

  it('rechaza cualquier cosa con marcado, espacios o longitud absurda', () => {
    const malos = [
      '<img src=x onerror=alert(1)>',
      '../../etc/passwd',
      'con espacios',
      'MAYÚSCULAS',
      '',
      'a'.repeat(65),
    ]
    for (const h of malos) {
      expect(HANDLE_RE.test(h), h).toBe(false)
    }
  })
})
