export interface User {
  username: string
  email: string
  age: number
  joinDate: string
  country: string
  favoriteGenres: string[]
}

export interface Movie {
  title: string
  releaseDate: string
  durationMin: number
  avgRating: number
  classification: string
  languages: string[]
  tags: string[]
  synopsis: string
  posterUrl: string
  backdropUrl: string
  genres?: string[]
}

export interface Genre {
  name: string
  description: string
  classification: string
  popularityScore: number
  subgenres: string[]
}

export interface Actor {
  name: string
  birthDate: string
  nationality: string
  isActive: boolean
  awardsWon: number
  profileUrl: string
}

export interface Director {
  name: string
  birthDate: string
  nationality: string
  oscarWinner: boolean
  moviesCount: number
  profileUrl: string
}

export interface WatchedRel {
  username: string
  movieTitle: string
  watchedAt: string
  completionPct: number
  deviceType: string
}

export interface RatedRel {
  username: string
  movieTitle: string
  rating: number
  ratedAt: string
  isVerified: boolean
}

export interface WatchlistRel {
  username: string
  movieTitle: string
  date: string
  priority: number
  notes: string
}

export interface FollowsRel {
  fromUsername: string
  toUsername: string
  date: string
  isMutual: boolean
  isFavorite: boolean
}

export interface PrefersRel {
  username: string
  genreName: string
  preferenceScore: number
  updatedAt: string
  description: string
}

export interface MovieGenreRel {
  movieTitle: string
  genreName: string
  isMain: boolean
  weight: number
  date: string
}

export interface MovieActorRel {
  movieTitle: string
  actorName: string
  role: string
  isLead: boolean
  screenTime: number
}

export interface MovieDirectorRel {
  movieTitle: string
  directorName: string
  date: string
  isProducer: boolean
  isMainDirector: boolean
}

export interface SimilarToRel {
  movieTitleA: string
  movieTitleB: string
  similarityScore: number
  basedOn: string
  date: string
}

export interface WorkedWithRel {
  actorName: string
  directorName: string
  firstCollabYear: number
  moviesCount: number
  avgRating: number
}

export interface NodePropsUpdate {
  filter: Record<string, unknown>
  properties: Record<string, unknown>
}

export interface RelPropsUpdate {
  fromLabel: string
  toLabel: string
  relType: string
  filter: Record<string, unknown>
  properties: Record<string, unknown>
}

export interface DeleteRelPayload {
  fromLabel: string
  toLabel: string
  relType: string
  filter: Record<string, unknown>
}

export interface GenreAggregate {
  genre: string
  count: number
}

export interface CountryAggregate {
  country: string
  count: number
}

// Grafo
export type NodeLabel = 'Movie' | 'User' | 'Genre' | 'Actor' | 'Director'

export interface NodeRef {
  label: NodeLabel
  key: string
}

export interface Neighbor extends NodeRef {
  props: Record<string, unknown>
}

export interface Group {
  type: string
  direction: 'out' | 'in'
  total: number
  items: Neighbor[]
}

export interface Neighborhood {
  node: NodeRef & { props: Record<string, unknown> }
  groups: Group[]
}

export interface Activity {
  watched: string[]
  ratings: Record<string, number>
}
