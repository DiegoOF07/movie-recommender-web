import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Neighborhood } from '@/types'

const api = vi.hoisted(() => ({
  graphApi: {
    neighbors: vi.fn(),
    deleteRelationship: vi.fn(async () => ({ deleted: 1 })),
    deleteNode: vi.fn(async () => ({ deletedRelationships: 0 })),
    patchNode: vi.fn(async () => ({})),
    search: vi.fn(async () => []),
  },
}))
vi.mock('@/services/api', async (orig) => ({ ...(await orig<object>()), ...api }))

import NodePanel from './NodePanel.vue'

const TITLE = 'Spider-Man: Un nuevo día'
const hood: Neighborhood = {
  node: { label: 'Movie', key: TITLE, props: { title: TITLE, avgRating: 4.2, releaseDate: '2026-07-31', durationMin: 128, classification: 'PG-13' } },
  groups: [
    { type: 'WATCHED', direction: 'in', total: 30, items: [{ label: 'User', key: 'jorge.vasquez', props: {} }, { label: 'User', key: 'ana.mendez', props: {} }] },
    { type: 'HAS_GENRE', direction: 'out', total: 2, items: [{ label: 'Genre', key: 'Acción', props: {} }, { label: 'Genre', key: 'Aventura', props: {} }] },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  api.graphApi.neighbors.mockResolvedValue(structuredClone(hood))
})

async function setup() {
  const w = mount(NodePanel, { props: { label: 'Movie', nodeKey: TITLE }, attachTo: document.body })
  await flushPromises()
  return w
}

describe('NodePanel', () => {
  it('muestra los grupos con total y el texto "y N más"', async () => {
    const w = await setup()
    const text = w.text()
    expect(text).toContain('Vieron')
    expect(text).toContain('30')
    expect(text).toContain('y 28 más')
    expect(text).toContain('Géneros')
  })

  it('muestra también las relaciones posibles sin conexiones', async () => {
    const w = await setup()
    expect(w.text()).toContain('Reparto')
    expect(w.text()).toContain('Dirección')
  })

  it('quitar un chip de un grupo "in" llama deleteRelationship con from/to correctos', async () => {
    const w = await setup()
    await w.get('button[aria-label="Quitar jorge.vasquez"]').trigger('click')
    await w.get('[data-test="confirm"]').trigger('click')
    await flushPromises()
    expect(api.graphApi.deleteRelationship).toHaveBeenCalledWith(
      'WATCHED',
      { label: 'User', key: 'jorge.vasquez' },
      { label: 'Movie', key: TITLE },
    )
  })

  it('el mensaje de borrar suma los totales', async () => {
    const w = await setup()
    await w.get('[data-test="delete-node"]').trigger('click')
    expect(w.text()).toContain(`Se borrará ${TITLE} y sus 32 conexiones`)
  })

  it('clic en un vecino del mini grafo emite open', async () => {
    const w = await setup()
    await w.get('svg a').trigger('click')
    expect(w.emitted('open')?.[0]?.[0]).toMatchObject({ label: expect.any(String), key: expect.any(String) })
  })

  it('guardar propiedades no manda la clave', async () => {
    const w = await setup()
    await w.get('[data-test="edit-props"]').trigger('click')
    await w.get('input[name="avgRating"]').setValue('4.5')
    await w.get('[data-test="save-props"]').trigger('submit')
    await flushPromises()
    const props = (api.graphApi.patchNode.mock.calls[0] as unknown[])[2] as Record<string, unknown>
    expect(props).not.toHaveProperty('title')
    expect(props.avgRating).toBe(4.5)
  })
})
