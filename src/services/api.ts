import type {
  User, Movie, Genre, Actor, Director,
  WatchedRel, RatedRel, WatchlistRel, FollowsRel, PrefersRel,
  MovieGenreRel, MovieActorRel, MovieDirectorRel, SimilarToRel, WorkedWithRel,
  NodePropsUpdate, RelPropsUpdate, DeleteRelPayload,
} from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}

// Movies
export const movieApi = {
  getAll: (filters?: { classification?: string; minRating?: number }) => {
    const params = new URLSearchParams()
    if (filters?.classification) params.set('classification', filters.classification)
    if (filters?.minRating !== undefined) params.set('minRating', String(filters.minRating))
    const qs = params.toString() ? `?${params}` : ''
    return request<Movie[]>(`/api/movies${qs}`)
  },
  getOne: (title: string) => request<Movie>(`/api/movies/${encodeURIComponent(title)}`),
  create: (m: Movie) => request<{ status: string }>('/api/movies', { method: 'POST', body: JSON.stringify(m) }),
  updateProps: (payload: NodePropsUpdate) => request<{ status: string }>('/api/movies/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (title: string, props: string[]) => request<{ status: string }>(`/api/movies/props/${encodeURIComponent(title)}`, { method: 'DELETE', body: JSON.stringify({ props }) }),
  deleteOne: (title: string) => request<{ status: string }>(`/api/movies/${encodeURIComponent(title)}`, { method: 'DELETE' }),
  deleteMany: (filters: Record<string, unknown>) => request<{ status: string }>('/api/movies', { method: 'DELETE', body: JSON.stringify(filters) }),
  aggregateByGenre: () => request<{ genre: string; count: number }[]>('/api/movies/aggregate/genre'),
  createSimilarTo: (rel: SimilarToRel) => request<{ status: string }>('/api/movies/relations/similar-to', { method: 'POST', body: JSON.stringify(rel) }),
}

// Users
export const userApi = {
  getAll: (filters?: { country?: string }) => {
    const params = new URLSearchParams()
    if (filters?.country) params.set('country', filters.country)
    const qs = params.toString() ? `?${params}` : ''
    return request<User[]>(`/api/users${qs}`)
  },
  getOne: (username: string) => request<User>(`/api/users/${encodeURIComponent(username)}`),
  create: (u: User) => request<{ status: string }>('/api/users', { method: 'POST', body: JSON.stringify(u) }),
  updateProps: (payload: NodePropsUpdate) => request<{ status: string }>('/api/users/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (username: string, props: string[]) => request<{ status: string }>(`/api/users/props/${encodeURIComponent(username)}`, { method: 'DELETE', body: JSON.stringify({ props }) }),
  deleteOne: (username: string) => request<{ status: string }>(`/api/users/${encodeURIComponent(username)}`, { method: 'DELETE' }),
  deleteMany: (filters: Record<string, unknown>) => request<{ status: string }>('/api/users', { method: 'DELETE', body: JSON.stringify(filters) }),
  aggregateByCountry: () => request<{ country: string; count: number }[]>('/api/users/aggregate/country'),
  createWatched: (rel: WatchedRel) => request<{ status: string }>('/api/users/relations/watched', { method: 'POST', body: JSON.stringify(rel) }),
  createRated: (rel: RatedRel) => request<{ status: string }>('/api/users/relations/rated', { method: 'POST', body: JSON.stringify(rel) }),
  createWatchlist: (rel: WatchlistRel) => request<{ status: string }>('/api/users/relations/watchlist', { method: 'POST', body: JSON.stringify(rel) }),
  createFollows: (rel: FollowsRel) => request<{ status: string }>('/api/users/relations/follows', { method: 'POST', body: JSON.stringify(rel) }),
  createPrefers: (rel: PrefersRel) => request<{ status: string }>('/api/users/relations/prefers', { method: 'POST', body: JSON.stringify(rel) }),
}

// Genres
export const genreApi = {
  getAll: () => request<Genre[]>('/api/genres'),
  getOne: (name: string) => request<Genre>(`/api/genres/${encodeURIComponent(name)}`),
  create: (g: Genre) => request<{ status: string }>('/api/genres', { method: 'POST', body: JSON.stringify(g) }),
  updateProps: (payload: NodePropsUpdate) => request<{ status: string }>('/api/genres/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (name: string, props: string[]) => request<{ status: string }>(`/api/genres/props/${encodeURIComponent(name)}`, { method: 'DELETE', body: JSON.stringify({ props }) }),
  deleteOne: (name: string) => request<{ status: string }>(`/api/genres/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  deleteMany: (filters: Record<string, unknown>) => request<{ status: string }>('/api/genres', { method: 'DELETE', body: JSON.stringify(filters) }),
  createMovieGenre: (rel: MovieGenreRel) => request<{ status: string }>('/api/genres/relations/movie-genre', { method: 'POST', body: JSON.stringify(rel) }),
}

// Actors
export const actorApi = {
  getAll: (filters?: { nationality?: string; isActive?: boolean }) => {
    const params = new URLSearchParams()
    if (filters?.nationality) params.set('nationality', filters.nationality)
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive))
    const qs = params.toString() ? `?${params}` : ''
    return request<Actor[]>(`/api/actors${qs}`)
  },
  getOne: (name: string) => request<Actor>(`/api/actors/${encodeURIComponent(name)}`),
  create: (a: Actor) => request<{ status: string }>('/api/actors', { method: 'POST', body: JSON.stringify(a) }),
  updateProps: (payload: NodePropsUpdate) => request<{ status: string }>('/api/actors/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (name: string, props: string[]) => request<{ status: string }>(`/api/actors/props/${encodeURIComponent(name)}`, { method: 'DELETE', body: JSON.stringify({ props }) }),
  deleteOne: (name: string) => request<{ status: string }>(`/api/actors/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  deleteMany: (filters: Record<string, unknown>) => request<{ status: string }>('/api/actors', { method: 'DELETE', body: JSON.stringify(filters) }),
  createMovieActor: (rel: MovieActorRel) => request<{ status: string }>('/api/actors/relations/movie-actor', { method: 'POST', body: JSON.stringify(rel) }),
  createWorkedWith: (rel: WorkedWithRel) => request<{ status: string }>('/api/actors/relations/worked-with', { method: 'POST', body: JSON.stringify(rel) }),
}

// Directors
export const directorApi = {
  getAll: (filters?: { oscarWinner?: boolean }) => {
    const params = new URLSearchParams()
    if (filters?.oscarWinner !== undefined) params.set('oscarWinner', String(filters.oscarWinner))
    const qs = params.toString() ? `?${params}` : ''
    return request<Director[]>(`/api/directors${qs}`)
  },
  getOne: (name: string) => request<Director>(`/api/directors/${encodeURIComponent(name)}`),
  create: (d: Director) => request<{ status: string }>('/api/directors', { method: 'POST', body: JSON.stringify(d) }),
  updateProps: (payload: NodePropsUpdate) => request<{ status: string }>('/api/directors/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (name: string, props: string[]) => request<{ status: string }>(`/api/directors/props/${encodeURIComponent(name)}`, { method: 'DELETE', body: JSON.stringify({ props }) }),
  deleteOne: (name: string) => request<{ status: string }>(`/api/directors/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  deleteMany: (filters: Record<string, unknown>) => request<{ status: string }>('/api/directors', { method: 'DELETE', body: JSON.stringify(filters) }),
  createMovieDirector: (rel: MovieDirectorRel) => request<{ status: string }>('/api/directors/relations/movie-director', { method: 'POST', body: JSON.stringify(rel) }),
}

// Recommendations
export const recommendationApi = {
  collaborative: (username: string, limit = 10) =>
    request<Movie[]>(`/api/recommendations/${encodeURIComponent(username)}/collaborative?limit=${limit}`),
  similarMovies: (username: string, limit = 10) =>
    request<Movie[]>(`/api/recommendations/${encodeURIComponent(username)}/similar-movies?limit=${limit}`),
  byGenre: (username: string, limit = 10) =>
    request<Movie[]>(`/api/recommendations/${encodeURIComponent(username)}/by-genre?limit=${limit}`),
  byDirector: (username: string, limit = 10) =>
    request<Movie[]>(`/api/recommendations/${encodeURIComponent(username)}/by-director?limit=${limit}`),
}

// Relationships
export const relationshipApi = {
  updateProps: (payload: RelPropsUpdate) =>
    request<{ status: string }>('/api/relationships/props', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProps: (payload: RelPropsUpdate & { propNames: string[] }) =>
    request<{ status: string }>('/api/relationships/props', { method: 'DELETE', body: JSON.stringify(payload) }),
  deleteOne: (payload: DeleteRelPayload) =>
    request<{ status: string }>('/api/relationships/one', { method: 'DELETE', body: JSON.stringify(payload) }),
  deleteMany: (payload: DeleteRelPayload) =>
    request<{ status: string }>('/api/relationships/many', { method: 'DELETE', body: JSON.stringify(payload) }),
}
