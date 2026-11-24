import { actorApi, directorApi, genreApi, movieApi, userApi } from '@/services/api'
import type { Column } from '@/ui/DataTable.vue'
import type { Actor, Director, Genre, Movie, NodeLabel, User } from '@/types'

// rating: calificación de un usuario (0.5–5 en pasos de 0.5); average: promedio (0–5, cualquier decimal)
export type FieldType = 'text' | 'textarea' | 'number' | 'rating' | 'average' | 'date' | 'bool' | 'list'

export interface Field {
  key: string
  label: string
  type: FieldType
  required?: boolean
}

type Values = Record<string, unknown>

export interface NodeType {
  label: string
  plural: string
  key: string
  columns: Column[]
  fields: Field[]
  list: () => Promise<Values[]>
  create: (v: Values) => Promise<unknown>
}

export interface RelType {
  from: NodeLabel
  to: NodeLabel
  outLabel: string
  inLabel: string
  fields: Field[]
  create: (fromKey: string, toKey: string, v: Values) => Promise<unknown>
}

const today = () => new Date().toISOString().slice(0, 10)
const year = (v: unknown) => String(v ?? '').slice(0, 4) || '—'
const stars = (v: unknown) => (typeof v === 'number' ? `★ ${v.toFixed(1)}` : '—')
const yesNo = (v: unknown) => (v ? 'Sí' : 'No')
const list = (v: unknown) => (Array.isArray(v) ? v.join(', ') : '—')

export function defaultValues(fields: Field[]): Values {
  const v: Values = {}
  for (const f of fields) {
    if (f.type === 'date') v[f.key] = today()
    else if (f.type === 'bool') v[f.key] = false
    else if (f.type === 'list') v[f.key] = []
    else if (f.type === 'number' || f.type === 'rating' || f.type === 'average') v[f.key] = null
    else v[f.key] = ''
  }
  return v
}

export const NODE_TYPES: Record<NodeLabel, NodeType> = {
  Movie: {
    label: 'Película',
    plural: 'Películas',
    key: 'title',
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'releaseDate', label: 'Año', width: '70px', format: year },
      { key: 'avgRating', label: 'Promedio', width: '100px', format: stars },
      { key: 'classification', label: 'Clasif.', width: '80px' },
    ],
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'releaseDate', label: 'Estreno', type: 'date' },
      { key: 'durationMin', label: 'Duración (min)', type: 'number' },
      { key: 'avgRating', label: 'Calificación promedio', type: 'average' },
      { key: 'classification', label: 'Clasificación', type: 'text' },
      { key: 'languages', label: 'Idiomas', type: 'list' },
      { key: 'tags', label: 'Etiquetas', type: 'list' },
      { key: 'synopsis', label: 'Sinopsis', type: 'textarea' },
      { key: 'posterUrl', label: 'URL del póster', type: 'text' },
      { key: 'backdropUrl', label: 'URL del fondo', type: 'text' },
    ],
    list: () => movieApi.getAll() as unknown as Promise<Values[]>,
    create: (v) => movieApi.create(v as unknown as Movie),
  },
  User: {
    label: 'Usuario',
    plural: 'Usuarios',
    key: 'username',
    columns: [
      { key: 'username', label: 'Usuario' },
      { key: 'country', label: 'País', width: '140px' },
      { key: 'age', label: 'Edad', width: '70px' },
      { key: 'favoriteGenres', label: 'Géneros favoritos', format: list },
    ],
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'email', label: 'Correo', type: 'text' },
      { key: 'age', label: 'Edad', type: 'number' },
      { key: 'joinDate', label: 'Fecha de registro', type: 'date' },
      { key: 'country', label: 'País', type: 'text' },
      { key: 'favoriteGenres', label: 'Géneros favoritos', type: 'list' },
    ],
    list: () => userApi.getAll() as unknown as Promise<Values[]>,
    create: (v) => userApi.create(v as unknown as User),
  },
  Genre: {
    label: 'Género',
    plural: 'Géneros',
    key: 'name',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'classification', label: 'Tipo', width: '120px' },
      { key: 'popularityScore', label: 'Popularidad', width: '110px', format: (v) => (typeof v === 'number' ? v.toFixed(0) : '—') },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'classification', label: 'Tipo', type: 'text' },
      { key: 'popularityScore', label: 'Popularidad', type: 'number' },
      { key: 'subgenres', label: 'Subgéneros', type: 'list' },
    ],
    list: () => genreApi.getAll() as unknown as Promise<Values[]>,
    create: (v) => genreApi.create(v as unknown as Genre),
  },
  Actor: {
    label: 'Actor',
    plural: 'Actores',
    key: 'name',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'nationality', label: 'Nacionalidad', width: '160px' },
      { key: 'birthDate', label: 'Nacimiento', width: '110px', format: year },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'birthDate', label: 'Nacimiento', type: 'date' },
      { key: 'nationality', label: 'Nacionalidad', type: 'text' },
      { key: 'isActive', label: 'En activo', type: 'bool' },
      { key: 'awardsWon', label: 'Premios', type: 'number' },
      { key: 'profileUrl', label: 'URL de la foto', type: 'text' },
    ],
    list: () => actorApi.getAll() as unknown as Promise<Values[]>,
    create: (v) => actorApi.create(v as unknown as Actor),
  },
  Director: {
    label: 'Director',
    plural: 'Directores',
    key: 'name',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'nationality', label: 'Nacionalidad', width: '160px' },
      { key: 'moviesCount', label: 'Películas', width: '90px' },
      { key: 'oscarWinner', label: 'Óscar', width: '70px', format: yesNo },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'birthDate', label: 'Nacimiento', type: 'date' },
      { key: 'nationality', label: 'Nacionalidad', type: 'text' },
      { key: 'oscarWinner', label: 'Ganó un Óscar', type: 'bool' },
      { key: 'moviesCount', label: 'Películas dirigidas', type: 'number' },
      { key: 'profileUrl', label: 'URL de la foto', type: 'text' },
    ],
    list: () => directorApi.getAll() as unknown as Promise<Values[]>,
    create: (v) => directorApi.create(v as unknown as Director),
  },
}

// Cada relación con sus textos en las dos direcciones y la función de la API que la crea
export const REL_TYPES: Record<string, RelType> = {
  WATCHED: {
    from: 'User', to: 'Movie', outLabel: 'Vio', inLabel: 'Vieron',
    fields: [
      { key: 'watchedAt', label: 'Fecha', type: 'date', required: true },
      { key: 'completionPct', label: '% visto', type: 'number' },
      { key: 'deviceType', label: 'Dispositivo', type: 'text' },
    ],
    create: (u, m, v) => userApi.createWatched({ username: u, movieTitle: m, watchedAt: String(v.watchedAt), completionPct: Number(v.completionPct ?? 100), deviceType: String(v.deviceType || 'web') }),
  },
  RATED: {
    from: 'User', to: 'Movie', outLabel: 'Calificó', inLabel: 'Calificaron',
    fields: [
      { key: 'rating', label: 'Calificación', type: 'rating', required: true },
      { key: 'ratedAt', label: 'Fecha', type: 'date', required: true },
      { key: 'isVerified', label: 'Verificada', type: 'bool' },
    ],
    create: (u, m, v) => userApi.createRated({ username: u, movieTitle: m, rating: Number(v.rating), ratedAt: String(v.ratedAt), isVerified: Boolean(v.isVerified) }),
  },
  ADDED_TO_WATCHLIST: {
    from: 'User', to: 'Movie', outLabel: 'Quiere ver', inLabel: 'En la lista de',
    fields: [
      { key: 'date', label: 'Fecha', type: 'date', required: true },
      { key: 'priority', label: 'Prioridad (1–3)', type: 'number' },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
    create: (u, m, v) => userApi.createWatchlist({ username: u, movieTitle: m, date: String(v.date), priority: Number(v.priority ?? 1), notes: String(v.notes ?? '') }),
  },
  FOLLOWS: {
    from: 'User', to: 'User', outLabel: 'Sigue a', inLabel: 'Seguidores',
    fields: [
      { key: 'date', label: 'Desde', type: 'date', required: true },
      { key: 'isFavorite', label: 'Favorito', type: 'bool' },
    ],
    create: (a, b, v) => userApi.createFollows({ fromUsername: a, toUsername: b, date: String(v.date), isMutual: false, isFavorite: Boolean(v.isFavorite) }),
  },
  PREFERS: {
    from: 'User', to: 'Genre', outLabel: 'Géneros preferidos', inLabel: 'Lo prefieren',
    fields: [
      { key: 'preferenceScore', label: 'Preferencia (0–1)', type: 'number', required: true },
      { key: 'updatedAt', label: 'Fecha', type: 'date', required: true },
      { key: 'description', label: 'Nota', type: 'text' },
    ],
    create: (u, g, v) => userApi.createPrefers({ username: u, genreName: g, preferenceScore: Number(v.preferenceScore ?? 0.5), updatedAt: String(v.updatedAt), description: String(v.description ?? '') }),
  },
  HAS_GENRE: {
    from: 'Movie', to: 'Genre', outLabel: 'Géneros', inLabel: 'Películas',
    fields: [
      { key: 'isMain', label: 'Género principal', type: 'bool' },
      { key: 'weight', label: 'Peso (0–1)', type: 'number' },
      { key: 'date', label: 'Fecha', type: 'date', required: true },
    ],
    create: (m, g, v) => genreApi.createMovieGenre({ movieTitle: m, genreName: g, isMain: Boolean(v.isMain), weight: Number(v.weight ?? 0.5), date: String(v.date) }),
  },
  FEATURES_ACTOR: {
    from: 'Movie', to: 'Actor', outLabel: 'Reparto', inLabel: 'Actuó en',
    fields: [
      { key: 'role', label: 'Personaje', type: 'text' },
      { key: 'isLead', label: 'Protagonista', type: 'bool' },
      { key: 'screenTime', label: 'Minutos en pantalla', type: 'number' },
    ],
    create: (m, a, v) => actorApi.createMovieActor({ movieTitle: m, actorName: a, role: String(v.role ?? ''), isLead: Boolean(v.isLead), screenTime: Number(v.screenTime ?? 0) }),
  },
  DIRECTED_BY: {
    from: 'Movie', to: 'Director', outLabel: 'Dirección', inLabel: 'Dirigió',
    fields: [
      { key: 'date', label: 'Fecha', type: 'date', required: true },
      { key: 'isProducer', label: 'También produjo', type: 'bool' },
      { key: 'isMainDirector', label: 'Director principal', type: 'bool' },
    ],
    create: (m, d, v) => directorApi.createMovieDirector({ movieTitle: m, directorName: d, date: String(v.date), isProducer: Boolean(v.isProducer), isMainDirector: Boolean(v.isMainDirector) }),
  },
  SIMILAR_TO: {
    from: 'Movie', to: 'Movie', outLabel: 'Similar a', inLabel: 'Parecidas a esta',
    fields: [
      { key: 'similarityScore', label: 'Similitud (0–1)', type: 'number', required: true },
      { key: 'basedOn', label: 'Basado en', type: 'text' },
      { key: 'date', label: 'Fecha', type: 'date', required: true },
    ],
    create: (a, b, v) => movieApi.createSimilarTo({ movieTitleA: a, movieTitleB: b, similarityScore: Number(v.similarityScore ?? 0.5), basedOn: String(v.basedOn || 'manual'), date: String(v.date) }),
  },
  WORKED_WITH: {
    from: 'Actor', to: 'Director', outLabel: 'Trabajó con', inLabel: 'Dirigió a',
    fields: [
      { key: 'firstCollabYear', label: 'Primera colaboración (año)', type: 'number' },
      { key: 'moviesCount', label: 'Películas juntos', type: 'number' },
      { key: 'avgRating', label: 'Promedio juntos', type: 'average' },
    ],
    create: (a, d, v) => actorApi.createWorkedWith({ actorName: a, directorName: d, firstCollabYear: Number(v.firstCollabYear ?? new Date().getFullYear()), moviesCount: Number(v.moviesCount ?? 1), avgRating: Number(v.avgRating ?? 0) }),
  },
}

export function relGroupLabel(type: string, direction: 'out' | 'in'): string {
  const r = REL_TYPES[type]
  if (!r) return type.toLowerCase()
  return direction === 'out' ? r.outLabel : r.inLabel
}
