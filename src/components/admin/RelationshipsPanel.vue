<template>
  <div class="panel">
    <div>
      <h2 class="section-title">RELACIONES</h2>
      <p class="section-subtitle">Crear y gestionar relaciones entre nodos</p>
    </div>

    <div class="tabs" style="margin-top:24px">
      <button v-for="t in relTabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key">
        {{ t.label }}
      </button>
    </div>

    <!-- WATCHED -->
    <div v-if="activeTab === 'watched'" class="rel-section">
      <h3 class="rel-title">Usuario vio pelicula (WATCHED)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Username *</label><input v-model="watched.username" /></div>
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="watched.movieTitle" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Fecha vista</label><input v-model="watched.watchedAt" type="date" /></div>
          <div class="form-group"><label>Completado (%)</label><input v-model.number="watched.completionPct"
              type="number" min="0" max="100" /></div>
        </div>
        <div class="form-group"><label>Dispositivo</label><input v-model="watched.deviceType"
            placeholder="Ej: mobile" /></div>
      </div>
      <RelSubmit :loading="loadingMap.watched" :error="errorMap.watched" :success="successMap.watched"
        @submit="createWatched" />
    </div>

    <!-- RATED -->
    <div v-if="activeTab === 'rated'" class="rel-section">
      <h3 class="rel-title">Usuario califico pelicula (RATED)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Username *</label><input v-model="rated.username" /></div>
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="rated.movieTitle" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Rating (0-10)</label><input v-model.number="rated.rating" type="number" min="0"
              max="10" step="0.1" /></div>
          <div class="form-group"><label>Fecha calificacion</label><input v-model="rated.ratedAt" type="date" /></div>
        </div>
        <div class="form-group" style="padding-top:18px">
          <label
            style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:14px;cursor:pointer">
            <input type="checkbox" v-model="rated.isVerified" style="width:auto" /> Verificado
          </label>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.rated" :error="errorMap.rated" :success="successMap.rated"
        @submit="createRated" />
    </div>

    <!-- WATCHLIST -->
    <div v-if="activeTab === 'watchlist'" class="rel-section">
      <h3 class="rel-title">Usuario agrego a lista (WATCHLIST)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Username *</label><input v-model="watchlist.username" /></div>
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="watchlist.movieTitle" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Fecha</label><input v-model="watchlist.date" type="date" /></div>
          <div class="form-group"><label>Prioridad</label><input v-model.number="watchlist.priority" type="number"
              min="1" max="5" /></div>
        </div>
        <div class="form-group"><label>Notas</label><textarea v-model="watchlist.notes" rows="2" /></div>
      </div>
      <RelSubmit :loading="loadingMap.watchlist" :error="errorMap.watchlist" :success="successMap.watchlist"
        @submit="createWatchlist" />
    </div>

    <!-- FOLLOWS -->
    <div v-if="activeTab === 'follows'" class="rel-section">
      <h3 class="rel-title">Usuario sigue a usuario (FOLLOWS)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Username origen *</label><input v-model="follows.fromUsername" /></div>
          <div class="form-group"><label>Username destino *</label><input v-model="follows.toUsername" /></div>
        </div>
        <div class="form-group"><label>Fecha</label><input v-model="follows.date" type="date" /></div>
        <div style="display:flex;gap:20px">
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="follows.isMutual" style="width:auto" /> Mutuo
          </label>
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="follows.isFavorite" style="width:auto" /> Favorito
          </label>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.follows" :error="errorMap.follows" :success="successMap.follows"
        @submit="createFollows" />
    </div>

    <!-- PREFERS -->
    <div v-if="activeTab === 'prefers'" class="rel-section">
      <h3 class="rel-title">Usuario prefiere genero (PREFERS)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Username *</label><input v-model="prefers.username" /></div>
          <div class="form-group"><label>Nombre genero *</label><input v-model="prefers.genreName" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Score preferencia</label><input v-model.number="prefers.preferenceScore"
              type="number" step="0.1" /></div>
          <div class="form-group"><label>Actualizado en</label><input v-model="prefers.updatedAt" type="date" /></div>
        </div>
        <div class="form-group"><label>Descripcion</label><input v-model="prefers.description" /></div>
      </div>
      <RelSubmit :loading="loadingMap.prefers" :error="errorMap.prefers" :success="successMap.prefers"
        @submit="createPrefers" />
    </div>

    <!-- MOVIE_GENRE -->
    <div v-if="activeTab === 'movieGenre'" class="rel-section">
      <h3 class="rel-title">Pelicula pertenece a genero (MOVIE_GENRE)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="movieGenre.movieTitle" /></div>
          <div class="form-group"><label>Nombre genero *</label><input v-model="movieGenre.genreName" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Peso</label><input v-model.number="movieGenre.weight" type="number"
              step="0.1" /></div>
          <div class="form-group"><label>Fecha</label><input v-model="movieGenre.date" type="date" /></div>
        </div>
        <div class="form-group" style="padding-top:2px">
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="movieGenre.isMain" style="width:auto" /> Genero principal
          </label>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.movieGenre" :error="errorMap.movieGenre" :success="successMap.movieGenre"
        @submit="createMovieGenre" />
    </div>

    <!-- MOVIE_ACTOR -->
    <div v-if="activeTab === 'movieActor'" class="rel-section">
      <h3 class="rel-title">Pelicula tiene actor (MOVIE_ACTOR)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="movieActor.movieTitle" /></div>
          <div class="form-group"><label>Nombre actor *</label><input v-model="movieActor.actorName" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Rol</label><input v-model="movieActor.role" placeholder="Ej: Protagonista" />
          </div>
          <div class="form-group"><label>Tiempo en pantalla (min)</label><input v-model.number="movieActor.screenTime"
              type="number" /></div>
        </div>
        <div class="form-group" style="padding-top:2px">
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="movieActor.isLead" style="width:auto" /> Actor principal
          </label>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.movieActor" :error="errorMap.movieActor" :success="successMap.movieActor"
        @submit="createMovieActor" />
    </div>

    <!-- MOVIE_DIRECTOR -->
    <div v-if="activeTab === 'movieDirector'" class="rel-section">
      <h3 class="rel-title">Pelicula tiene director (MOVIE_DIRECTOR)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Titulo pelicula *</label><input v-model="movieDirector.movieTitle" /></div>
          <div class="form-group"><label>Nombre director *</label><input v-model="movieDirector.directorName" /></div>
        </div>
        <div class="form-group"><label>Fecha</label><input v-model="movieDirector.date" type="date" /></div>
        <div style="display:flex;gap:20px">
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="movieDirector.isProducer" style="width:auto" /> Productor
          </label>
          <label
            style="display:flex;align-items:center;gap:8px;font-size:14px;text-transform:none;letter-spacing:0;cursor:pointer">
            <input type="checkbox" v-model="movieDirector.isMainDirector" style="width:auto" /> Director principal
          </label>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.movieDirector" :error="errorMap.movieDirector" :success="successMap.movieDirector"
        @submit="createMovieDirector" />
    </div>

    <!-- SIMILAR_TO -->
    <div v-if="activeTab === 'similarTo'" class="rel-section">
      <h3 class="rel-title">Pelicula similar a pelicula (SIMILAR_TO)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Pelicula A *</label><input v-model="similarTo.movieTitleA" /></div>
          <div class="form-group"><label>Pelicula B *</label><input v-model="similarTo.movieTitleB" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Score de similitud</label><input v-model.number="similarTo.similarityScore"
              type="number" step="0.01" min="0" max="1" /></div>
          <div class="form-group"><label>Fecha</label><input v-model="similarTo.date" type="date" /></div>
        </div>
        <div class="form-group"><label>Basado en</label><input v-model="similarTo.basedOn"
            placeholder="Ej: genre, director, tags" /></div>
      </div>
      <RelSubmit :loading="loadingMap.similarTo" :error="errorMap.similarTo" :success="successMap.similarTo"
        @submit="createSimilarTo" />
    </div>

    <!-- WORKED_WITH -->
    <div v-if="activeTab === 'workedWith'" class="rel-section">
      <h3 class="rel-title">Actor trabajo con director (WORKED_WITH)</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Nombre actor *</label><input v-model="workedWith.actorName" /></div>
          <div class="form-group"><label>Nombre director *</label><input v-model="workedWith.directorName" /></div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label>Primer ano colaboracion</label><input
              v-model.number="workedWith.firstCollabYear" type="number" placeholder="Ej: 2010" /></div>
          <div class="form-group"><label>Peliculas juntos</label><input v-model.number="workedWith.moviesCount"
              type="number" /></div>
          <div class="form-group"><label>Rating promedio</label><input v-model.number="workedWith.avgRating"
              type="number" step="0.1" /></div>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.workedWith" :error="errorMap.workedWith" :success="successMap.workedWith"
        @submit="createWorkedWith" />
    </div>

    <!-- UPDATE REL PROPS -->
    <div v-if="activeTab === 'updateRelProps'" class="rel-section">
      <h3 class="rel-title">Actualizar propiedades de relacion</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
        Aplica a una o multiples relaciones que coincidan con el filtro.
      </p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Label origen *</label><input v-model="upRel.fromLabel"
              placeholder="Ej: User" /></div>
          <div class="form-group"><label>Label destino *</label><input v-model="upRel.toLabel"
              placeholder="Ej: Movie" /></div>
        </div>
        <div class="form-group"><label>Tipo de relacion *</label><input v-model="upRel.relType"
            placeholder="Ej: WATCHED" /></div>
        <div class="form-row">
          <div class="form-group"><label>Filtro - propiedad</label><input v-model="upRel.filterKey"
              placeholder="Ej: username" /></div>
          <div class="form-group"><label>Filtro - valor</label><input v-model="upRel.filterValue"
              placeholder="Ej: john" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Propiedad a actualizar</label><input v-model="upRel.propKey"
              placeholder="Ej: isVerified" /></div>
          <div class="form-group"><label>Nuevo valor</label><input v-model="upRel.propValue" placeholder="Ej: true" />
          </div>
        </div>
      </div>
      <RelSubmit :loading="loadingMap.updateRelProps" :error="errorMap.updateRelProps"
        :success="successMap.updateRelProps" @submit="doUpdateRelProps" />
    </div>

    <!-- DELETE REL PROPS -->
    <div v-if="activeTab === 'deleteRelProps'" class="rel-section">
      <h3 class="rel-title">Eliminar propiedades de relacion</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Label origen *</label><input v-model="dpRel.fromLabel"
              placeholder="Ej: User" /></div>
          <div class="form-group"><label>Label destino *</label><input v-model="dpRel.toLabel"
              placeholder="Ej: Movie" /></div>
        </div>
        <div class="form-group"><label>Tipo de relacion *</label><input v-model="dpRel.relType"
            placeholder="Ej: WATCHED" /></div>
        <div class="form-row">
          <div class="form-group"><label>Filtro - propiedad</label><input v-model="dpRel.filterKey"
              placeholder="Ej: username" /></div>
          <div class="form-group"><label>Filtro - valor</label><input v-model="dpRel.filterValue"
              placeholder="Ej: john" /></div>
        </div>
        <div class="form-group">
          <label>Propiedades a eliminar (separadas por coma)</label>
          <input v-model="dpRel.propsStr" placeholder="Ej: deviceType, completionPct" />
        </div>
      </div>
      <RelSubmit :loading="loadingMap.deleteRelProps" :error="errorMap.deleteRelProps"
        :success="successMap.deleteRelProps" @submit="doDeleteRelProps" />
    </div>

    <!-- DELETE REL -->
    <div v-if="activeTab === 'deleteRel'" class="rel-section">
      <h3 class="rel-title" style="color:var(--red)">Eliminar relacion</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
        Elimina una relacion especifica entre dos nodos. Se requiere al menos un campo de filtro.
      </p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group"><label>Label nodo origen *</label><input v-model="delRel.fromLabel"
              placeholder="Ej: User" /></div>
          <div class="form-group"><label>Label nodo destino *</label><input v-model="delRel.toLabel"
              placeholder="Ej: Movie" /></div>
        </div>
        <div class="form-group"><label>Tipo de relacion *</label><input v-model="delRel.relType"
            placeholder="Ej: WATCHED" /></div>
        <div class="form-group"><label>Filtro - propiedad</label><input v-model="delRel.filterKey"
            placeholder="Ej: username" /></div>
        <div class="form-group"><label>Filtro - valor</label><input v-model="delRel.filterValue"
            placeholder="Ej: john" /></div>
      </div>
      <div style="margin-top:16px">
        <p v-if="errorMap.deleteRel" class="error-msg" style="margin-bottom:10px">{{ errorMap.deleteRel }}</p>
        <p v-if="successMap.deleteRel" class="success-msg" style="margin-bottom:10px">{{ successMap.deleteRel }}</p>
        <button class="btn btn-danger" :disabled="!canDeleteRel || loadingMap.deleteRel" @click="doDeleteRel">
          <span v-if="loadingMap.deleteRel" class="spinner" style="width:14px;height:14px;margin:0" />
          <span v-else>Eliminar relacion</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { userApi, movieApi, genreApi, actorApi, directorApi, relationshipApi } from '@/services/api'

const RelSubmit = {
  props: ['loading', 'error', 'success'],
  emits: ['submit'],
  template: `
    <div style="margin-top:16px">
      <p v-if="error" class="error-msg" style="margin-bottom:10px">{{ error }}</p>
      <p v-if="success" class="success-msg" style="margin-bottom:10px">{{ success }}</p>
      <button class="btn btn-primary" :disabled="loading" @click="$emit('submit')">
        <span v-if="loading" class="spinner" style="width:14px;height:14px;margin:0" />
        <span v-else>Crear relacion</span>
      </button>
    </div>
  `,
}

const relTabs = [
  { key: 'watched', label: 'WATCHED' },
  { key: 'rated', label: 'RATED' },
  { key: 'watchlist', label: 'WATCHLIST' },
  { key: 'follows', label: 'FOLLOWS' },
  { key: 'prefers', label: 'PREFERS' },
  { key: 'movieGenre', label: 'MOVIE_GENRE' },
  { key: 'movieActor', label: 'MOVIE_ACTOR' },
  { key: 'movieDirector', label: 'MOVIE_DIRECTOR' },
  { key: 'similarTo', label: 'SIMILAR_TO' },
  { key: 'workedWith', label: 'WORKED_WITH' },
  { key: 'deleteRel', label: 'Eliminar' },
  { key: 'updateRelProps', label: 'Editar props rel' },
  { key: 'deleteRelProps', label: 'Eliminar props rel' },
]

const activeTab = ref('watched')

type TabKey = 'watched' | 'rated' | 'watchlist' | 'follows' | 'prefers' | 'movieGenre' | 'movieActor' | 'movieDirector' | 'similarTo' | 'workedWith' | 'deleteRel' |'updateRelProps'|'deleteRelProps'

const loadingMap = reactive<Record<TabKey, boolean>>({
  watched: false, rated: false, watchlist: false, follows: false, prefers: false,
  movieGenre: false, movieActor: false, movieDirector: false, similarTo: false, workedWith: false, deleteRel: false, updateRelProps: false, deleteRelProps: false,
})
const errorMap = reactive<Record<TabKey, string>>({
  watched: '', rated: '', watchlist: '', follows: '', prefers: '',
  movieGenre: '', movieActor: '', movieDirector: '', similarTo: '', workedWith: '', deleteRel: '', updateRelProps: '', deleteRelProps: '',
})
const successMap = reactive<Record<TabKey, string>>({
  watched: '', rated: '', watchlist: '', follows: '', prefers: '',
  movieGenre: '', movieActor: '', movieDirector: '', similarTo: '', workedWith: '', deleteRel: '', updateRelProps: '', deleteRelProps: '',
})

const upRel = ref({ fromLabel: '', toLabel: '', relType: '', filterKey: '', filterValue: '', propKey: '', propValue: '' })
const dpRel = ref({ fromLabel: '', toLabel: '', relType: '', filterKey: '', filterValue: '', propsStr: '' })

function doUpdateRelProps() {
  const filter: Record<string, unknown> = {}
  if (upRel.value.filterKey) filter[upRel.value.filterKey] = upRel.value.filterValue
  callApi('updateRelProps', () => relationshipApi.updateProps({
    fromLabel: upRel.value.fromLabel,
    toLabel: upRel.value.toLabel,
    relType: upRel.value.relType,
    filter,
    properties: { [upRel.value.propKey]: upRel.value.propValue },
  }))
}

function doDeleteRelProps() {
  const filter: Record<string, unknown> = {}
  if (dpRel.value.filterKey) filter[dpRel.value.filterKey] = dpRel.value.filterValue
  const propNames = dpRel.value.propsStr.split(',').map(s => s.trim()).filter(Boolean)
  callApi('deleteRelProps', () => relationshipApi.deleteProps({
    fromLabel: dpRel.value.fromLabel,
    toLabel: dpRel.value.toLabel,
    relType: dpRel.value.relType,
    filter,
    propNames,
  }))
}

async function callApi(key: TabKey, fn: () => Promise<unknown>) {
  loadingMap[key] = true; errorMap[key] = ''; successMap[key] = ''
  try {
    await fn()
    successMap[key] = 'Relacion creada exitosamente.'
  } catch (e: unknown) {
    errorMap[key] = e instanceof Error ? e.message : 'Error'
  } finally { loadingMap[key] = false }
}

const watched = ref({ username: '', movieTitle: '', watchedAt: '', completionPct: 100, deviceType: '' })
const rated = ref({ username: '', movieTitle: '', rating: 5, ratedAt: '', isVerified: false })
const watchlist = ref({ username: '', movieTitle: '', date: '', priority: 1, notes: '' })
const follows = ref({ fromUsername: '', toUsername: '', date: '', isMutual: false, isFavorite: false })
const prefers = ref({ username: '', genreName: '', preferenceScore: 5, updatedAt: '', description: '' })
const movieGenre = ref({ movieTitle: '', genreName: '', isMain: false, weight: 1.0, date: '' })
const movieActor = ref({ movieTitle: '', actorName: '', role: '', isLead: false, screenTime: 0 })
const movieDirector = ref({ movieTitle: '', directorName: '', date: '', isProducer: false, isMainDirector: true })
const similarTo = ref({ movieTitleA: '', movieTitleB: '', similarityScore: 0.5, basedOn: '', date: '' })
const workedWith = ref({ actorName: '', directorName: '', firstCollabYear: 2000, moviesCount: 1, avgRating: 0 })
const delRel = ref({ fromLabel: '', toLabel: '', relType: '', filterKey: '', filterValue: '' })

const canDeleteRel = computed(() =>
  delRel.value.fromLabel.trim() && delRel.value.toLabel.trim() && delRel.value.relType.trim() && delRel.value.filterKey.trim() && delRel.value.filterValue.trim()
)

const createWatched = () => callApi('watched', () => userApi.createWatched(watched.value))
const createRated = () => callApi('rated', () => userApi.createRated(rated.value))
const createWatchlist = () => callApi('watchlist', () => userApi.createWatchlist(watchlist.value))
const createFollows = () => callApi('follows', () => userApi.createFollows(follows.value))
const createPrefers = () => callApi('prefers', () => userApi.createPrefers(prefers.value))
const createMovieGenre = () => callApi('movieGenre', () => genreApi.createMovieGenre(movieGenre.value))
const createMovieActor = () => callApi('movieActor', () => actorApi.createMovieActor(movieActor.value))
const createMovieDirector = () => callApi('movieDirector', () => directorApi.createMovieDirector(movieDirector.value))
const createSimilarTo = () => callApi('similarTo', () => movieApi.createSimilarTo(similarTo.value))
const createWorkedWith = () => callApi('workedWith', () => actorApi.createWorkedWith(workedWith.value))

async function doDeleteRel() {
  const filter: Record<string, unknown> = {}
  if (delRel.value.filterKey && delRel.value.filterValue) filter[delRel.value.filterKey] = delRel.value.filterValue
  await callApi('deleteRel', () => relationshipApi.deleteOne({
    fromLabel: delRel.value.fromLabel,
    toLabel: delRel.value.toLabel,
    relType: delRel.value.relType,
    filter,
  }))
}
</script>

<style scoped>
.panel {
  padding: 28px;
  max-width: 1100px;
  margin: 0 auto;
}

.tabs {
  overflow-x: auto;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 28px;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.rel-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.rel-title {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}
</style>
