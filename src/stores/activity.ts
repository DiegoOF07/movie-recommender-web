import { reactive } from 'vue'
import { graphApi, userApi } from '@/services/api'
import { useToast } from '@/ui/toast'
import type { NodeRef } from '@/types'

// Lo que el usuario vio y calificó, leído del grafo; las tarjetas lo comparten
const state = reactive({
  username: '',
  loaded: false,
  watched: new Set<string>(),
  ratings: {} as Record<string, number>,
  pending: new Set<string>(),
})

const today = () => new Date().toISOString().slice(0, 10)
const pair = (title: string): [NodeRef, NodeRef] => [
  { label: 'User', key: state.username },
  { label: 'Movie', key: title },
]

// Si mientras tanto se pidió la actividad de otro usuario, la respuesta vieja se descarta
let loadRequest = 0

async function load(username: string) {
  const id = ++loadRequest
  state.username = username
  state.loaded = false
  try {
    const a = await userApi.activity(username)
    if (id !== loadRequest) return
    state.watched = new Set(a.watched)
    state.ratings = { ...a.ratings }
    state.loaded = true
  } catch {
    if (id !== loadRequest) return
    state.watched = new Set()
    state.ratings = {}
    useToast().show('No se pudo leer tu actividad; recarga la página para marcar o calificar.', 'error')
  }
}

// Si algo falla a mitad de camino, se relee el grafo para no mostrar un estado inventado
async function guarded(title: string, fn: () => Promise<void>) {
  if (!state.loaded) {
    useToast().show('Tu actividad no está cargada todavía.', 'error')
    return
  }
  state.pending.add(title)
  try {
    await fn()
  } catch (e) {
    useToast().show(`No se pudo guardar: ${e instanceof Error ? e.message : 'error'}`, 'error')
    await load(state.username)
  } finally {
    state.pending.delete(title)
  }
}

function markWatched(title: string) {
  return guarded(title, async () => {
    await userApi.createWatched({
      username: state.username,
      movieTitle: title,
      watchedAt: today(),
      completionPct: 100,
      deviceType: 'web',
    })
    state.watched.add(title)
  })
}

function unwatch(title: string) {
  return guarded(title, async () => {
    await graphApi.deleteRelationship('WATCHED', ...pair(title))
    await graphApi.deleteRelationship('RATED', ...pair(title))
    state.watched.delete(title)
    delete state.ratings[title]
  })
}

function rate(title: string, value: number) {
  return guarded(title, async () => {
    await graphApi.deleteRelationship('RATED', ...pair(title))
    delete state.ratings[title]
    if (value > 0) {
      await userApi.createRated({
        username: state.username,
        movieTitle: title,
        rating: value,
        ratedAt: today(),
        isVerified: false,
      })
      state.ratings[title] = value
    }
  })
}

export function useActivity() {
  return {
    load,
    markWatched,
    unwatch,
    rate,
    isWatched: (title: string) => state.watched.has(title),
    rating: (title: string) => state.ratings[title] ?? 0,
    pending: (title: string) => state.pending.has(title),
  }
}
