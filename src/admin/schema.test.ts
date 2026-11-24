import { describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => {
  const fn = () => vi.fn(async () => ({}))
  return {
    movieApi: { getAll: fn(), create: fn(), createSimilarTo: fn() },
    userApi: { getAll: fn(), create: fn(), createWatched: fn(), createRated: fn(), createWatchlist: fn(), createFollows: fn(), createPrefers: fn() },
    genreApi: { getAll: fn(), create: fn(), createMovieGenre: fn() },
    actorApi: { getAll: fn(), create: fn(), createMovieActor: fn(), createWorkedWith: fn() },
    directorApi: { getAll: fn(), create: fn(), createMovieDirector: fn() },
  }
})
vi.mock('@/services/api', () => api)

import { NODE_TYPES, REL_TYPES, defaultValues, relGroupLabel } from './schema'

// Copia de las relaciones de la API (src/graph/schema.go)
const API_RELS: Record<string, [string, string]> = {
  WATCHED: ['User', 'Movie'],
  RATED: ['User', 'Movie'],
  ADDED_TO_WATCHLIST: ['User', 'Movie'],
  FOLLOWS: ['User', 'User'],
  PREFERS: ['User', 'Genre'],
  HAS_GENRE: ['Movie', 'Genre'],
  FEATURES_ACTOR: ['Movie', 'Actor'],
  DIRECTED_BY: ['Movie', 'Director'],
  SIMILAR_TO: ['Movie', 'Movie'],
  WORKED_WITH: ['Actor', 'Director'],
}

describe('admin schema', () => {
  it('hay 10 relaciones y sus from/to coinciden con la API', () => {
    expect(Object.keys(REL_TYPES).sort()).toEqual(Object.keys(API_RELS).sort())
    for (const [type, [from, to]] of Object.entries(API_RELS)) {
      expect([REL_TYPES[type].from, REL_TYPES[type].to]).toEqual([from, to])
    }
  })

  it('relGroupLabel usa español natural', () => {
    expect(relGroupLabel('WATCHED', 'in')).toBe('Vieron')
    expect(relGroupLabel('WATCHED', 'out')).toBe('Vio')
    expect(relGroupLabel('HAS_GENRE', 'out')).toBe('Géneros')
    expect(relGroupLabel('FEATURES_ACTOR', 'out')).toBe('Reparto')
  })

  it('ningún outLabel/inLabel contiene "_"', () => {
    for (const r of Object.values(REL_TYPES)) {
      expect(r.outLabel).not.toContain('_')
      expect(r.inLabel).not.toContain('_')
    }
  })

  it('RATED pide una calificación obligatoria', () => {
    const f = REL_TYPES.RATED.fields.find((x) => x.key === 'rating')
    expect(f).toMatchObject({ type: 'rating', required: true })
  })

  it('crear RATED manda la escala 0.5–5 sin multiplicar', async () => {
    await REL_TYPES.RATED.create('ana', 'Duna', { rating: 4.5, ratedAt: '2026-11-23', isVerified: false })
    expect(api.userApi.createRated).toHaveBeenCalledWith({ username: 'ana', movieTitle: 'Duna', rating: 4.5, ratedAt: '2026-11-23', isVerified: false })
  })

  it('las fechas tienen hoy como valor por defecto', () => {
    const v = defaultValues(REL_TYPES.WATCHED.fields)
    expect(v.watchedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('cada tipo de nodo tiene clave, plural y columnas', () => {
    expect(NODE_TYPES.Movie).toMatchObject({ key: 'title', plural: 'Películas' })
    expect(NODE_TYPES.User.key).toBe('username')
    for (const t of Object.values(NODE_TYPES)) expect(t.columns.length).toBeGreaterThan(0)
  })
})
