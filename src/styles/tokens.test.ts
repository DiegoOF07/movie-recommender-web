import { describe, expect, it } from 'vitest'
import css from './tokens.css?raw'

describe('tokens Revelado', () => {
  it('define la paleta base del spec', () => {
    expect(css).toContain('--bg: #120d0c')
    expect(css).toContain('--safelight: #ff5a36')
    expect(css).toContain('--amber: #e8a33d')
  })

  it('define un color por tipo de nodo', () => {
    for (const n of ['movie', 'user', 'genre', 'actor', 'director']) expect(css).toContain(`--node-${n}:`)
  })

  it('desactiva el movimiento con prefers-reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
