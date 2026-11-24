import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { graphApi, userApi } from './api'

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

const lastCall = () => fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit]

describe('graphApi', () => {
  it('neighbors codifica la clave', async () => {
    await graphApi.neighbors('Movie', 'Spider-Man: Un nuevo día')
    expect(lastCall()[0]).toMatch(/\/api\/graph\/Movie\/Spider-Man%3A%20Un%20nuevo%20d%C3%ADa\/neighbors\?limit=12$/)
  })

  it('deleteRelationship manda DELETE con el cuerpo esperado', async () => {
    await graphApi.deleteRelationship('RATED', { label: 'User', key: 'ana' }, { label: 'Movie', key: 'Duna' })
    const [url, init] = lastCall()
    expect(url).toMatch(/\/api\/graph\/relationships$/)
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(init.body as string)).toEqual({
      type: 'RATED',
      from: { label: 'User', key: 'ana' },
      to: { label: 'Movie', key: 'Duna' },
    })
  })

  it('search arma labels=Movie,Actor', async () => {
    fetchMock.mockResolvedValueOnce(new Response('[]'))
    await graphApi.search('sp', ['Movie', 'Actor'])
    expect(lastCall()[0]).toMatch(/\/api\/search\?q=sp&labels=Movie%2CActor&limit=10$/)
  })

  it('patchNode y deleteNode usan la clave codificada', async () => {
    await graphApi.patchNode('Movie', 'A/B', { avgRating: 4.5 })
    expect(lastCall()[0]).toMatch(/\/api\/graph\/Movie\/A%2FB$/)
    expect(lastCall()[1].method).toBe('PATCH')
    await graphApi.deleteNode('User', 'jorge.vasquez')
    expect(lastCall()[1].method).toBe('DELETE')
  })
})

describe('userApi.activity', () => {
  it('pide la actividad del usuario', async () => {
    await userApi.activity('jorge.vasquez')
    expect(lastCall()[0]).toMatch(/\/api\/users\/jorge\.vasquez\/activity$/)
  })
})
