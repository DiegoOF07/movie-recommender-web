import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const api = vi.hoisted(() => ({
  recommendationApi: { collaborative: vi.fn(), similarMovies: vi.fn(), byGenre: vi.fn(), byDirector: vi.fn() },
  movieApi: { getAll: vi.fn(async () => []) },
}))
vi.mock('@/services/api', () => api)
vi.mock('@/stores/activity', () => ({ useActivity: () => ({ load: vi.fn(async () => {}) }) }))
vi.mock('@/stores/auth', () => ({ auth: { username: 'ana' } }))

import DashboardView from './DashboardView.vue'

const movie = (title: string) => ({ title, posterUrl: '', backdropUrl: '' })

describe('DashboardView', () => {
  it('una respuesta lenta de otra pestaña no pisa la pestaña activa', async () => {
    let releaseCollab!: (v: unknown) => void
    api.recommendationApi.collaborative.mockReturnValueOnce(new Promise((r) => (releaseCollab = r)))
    api.recommendationApi.byGenre.mockResolvedValueOnce([movie('De género')])
    const w = mount(DashboardView, {
      global: { stubs: { Navbar: true, FriendsPanel: true, MovieCard: { props: ['movie'], template: '<p class="m">{{ movie.title }}</p>' } } },
    })
    await w.get('#tab-genre').trigger('click')
    await flushPromises()
    releaseCollab([movie('Colaborativa vieja')])
    await flushPromises()
    const titles = w.findAll('#recs-panel .m').map((m) => m.text())
    expect(titles).toEqual(['De género'])
  })
})
