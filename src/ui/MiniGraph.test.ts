import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { radialLayout } from './miniGraphLayout'
import MiniGraph from './MiniGraph.vue'
import type { Group, NodeLabel } from '@/types'

function group(type: string, label: NodeLabel, n: number, total = n): Group {
  return {
    type,
    direction: 'out',
    total,
    items: Array.from({ length: n }, (_, i) => ({ label, key: `${type}-${i}`, props: {} })),
  }
}

describe('radialLayout', () => {
  it('sin vecinos devuelve nodes vacío y overflow 0', () => {
    expect(radialLayout([], 220)).toEqual({ nodes: [], overflow: 0 })
  })

  it('con 30 vecinos en 3 grupos dibuja 12 y overflow 18', () => {
    const r = radialLayout([group('A', 'Genre', 10), group('B', 'Actor', 10), group('C', 'User', 10)], 220)
    expect(r.nodes).toHaveLength(12)
    expect(r.overflow).toBe(18)
  })

  it('cuenta en overflow lo que el grupo no trajo', () => {
    const r = radialLayout([group('WATCHED', 'User', 12, 34)], 220)
    expect(r.nodes).toHaveLength(12)
    expect(r.overflow).toBe(22)
  })

  it('cada grupo con items aparece al menos una vez', () => {
    const r = radialLayout([group('A', 'Genre', 20), group('B', 'Actor', 1), group('C', 'User', 1)], 220)
    const types = new Set(r.nodes.map((n) => n.relType))
    expect(types).toEqual(new Set(['A', 'B', 'C']))
  })

  it('es determinista', () => {
    const g = [group('A', 'Genre', 5), group('B', 'Actor', 9)]
    expect(radialLayout(g, 220)).toEqual(radialLayout(g, 220))
  })

  it('ningún par de nodos a menos de 24 px con size 220', () => {
    const r = radialLayout([group('A', 'Genre', 20), group('B', 'Actor', 20)], 220)
    for (let i = 0; i < r.nodes.length; i++)
      for (let j = i + 1; j < r.nodes.length; j++) {
        const d = Math.hypot(r.nodes[i].x - r.nodes[j].x, r.nodes[i].y - r.nodes[j].y)
        expect(d).toBeGreaterThanOrEqual(24)
      }
  })
})

describe('MiniGraph', () => {
  it('clic en un vecino emite open y muestra +N', async () => {
    const w = mount(MiniGraph, {
      props: { center: { label: 'Movie', key: 'Duna' }, groups: [group('HAS_GENRE', 'Genre', 2, 5)] },
    })
    expect(w.text()).toContain('+3')
    const first = w.findAll('a')[0]
    expect(first.attributes('aria-label')).toBe('HAS_GENRE: HAS_GENRE-0')
    await first.trigger('click')
    expect(w.emitted('open')?.[0]).toEqual([{ label: 'Genre', key: 'HAS_GENRE-0' }])
  })
})

describe('MiniGraph con relaciones mutuas', () => {
  it('no repite keys cuando el mismo vecino está en "out" e "in"', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mutual: Group[] = [
      { type: 'FOLLOWS', direction: 'out', total: 1, items: [{ label: 'User', key: 'ana', props: {} }] },
      { type: 'FOLLOWS', direction: 'in', total: 1, items: [{ label: 'User', key: 'ana', props: {} }] },
    ]
    const w = mount(MiniGraph, { props: { center: { label: 'User', key: 'luis' }, groups: [group('HAS_GENRE', 'Genre', 2)] } })
    await w.setProps({ groups: mutual })
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Duplicate keys'))).toBe(false)
    warn.mockRestore()
  })
})
