import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const { rows, listOf } = vi.hoisted(() => ({
  rows: [{ title: 'La Odisea', avgRating: 4 }, { title: 'Spider-Man: Un nuevo día', avgRating: 4.2 }],
  listOf: (n: number) => async () => Array.from({ length: n }, (_, i) => ({ name: `x${i}` })),
}))

vi.mock('@/admin/schema', () => {
  const t = (plural: string, key: string, list: () => Promise<unknown[]>) => ({
    label: plural, plural, key, columns: [{ key, label: 'Nombre' }], fields: [], list, create: async () => ({}),
  })
  return {
    NODE_TYPES: {
      Movie: t('Películas', 'title', async () => rows),
      User: t('Usuarios', 'username', listOf(3)),
      Genre: t('Géneros', 'name', listOf(2)),
      Actor: t('Actores', 'name', listOf(5)),
      Director: t('Directores', 'name', listOf(1)),
    },
    REL_TYPES: {},
    relGroupLabel: (t: string) => t,
    defaultValues: () => ({}),
  }
})
vi.mock('@/services/api', () => ({ graphApi: { search: vi.fn(async () => []) } }))

import AdminView from './AdminView.vue'

async function setup(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/admin/:label?/:key?', name: 'admin', component: AdminView }],
  })
  router.push(path)
  await router.isReady()
  const w = mount(AdminView, {
    global: { plugins: [router], stubs: { NodePanel: { props: ['label', 'nodeKey'], template: '<div data-test="panel">{{ label }}:{{ nodeKey }}</div>' } } },
  })
  await flushPromises()
  return { w, router }
}

describe('AdminView', () => {
  it('muestra los cinco tipos con su conteo', async () => {
    const { w } = await setup('/admin/Movie')
    const nav = w.get('[data-test="types"]').text()
    expect(nav).toContain('Películas')
    expect(nav).toContain('2')
    expect(nav).toContain('Actores')
    expect(nav).toContain('5')
  })

  it('elegir una fila lleva a la ficha con la clave en la ruta', async () => {
    const { w, router } = await setup('/admin/Movie')
    await w.findAll('tbody tr')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.params).toMatchObject({ label: 'Movie', key: 'Spider-Man: Un nuevo día' })
    expect(w.get('[data-test="panel"]').text()).toBe('Movie:Spider-Man: Un nuevo día')
  })

  it('una etiqueta desconocida vuelve a películas', async () => {
    const { router } = await setup('/admin/Nope')
    expect(router.currentRoute.value.params.label).toBe('Movie')
  })
})
