<template>
  <div class="dashboard">
    <Navbar />

    <div class="hero" :style="heroStyle">
      <div class="hero-overlay" />
      <div class="hero-content">
        <p class="hero-label">Bienvenido de vuelta</p>
        <h1 class="hero-username">{{ auth.username }}</h1>
        <p class="hero-sub">Aqui estan tus recomendaciones personalizadas</p>
      </div>
    </div>

    <main class="main">
      <div class="dashboard-layout">
        <!-- Left: recommendations + catalog -->
        <div class="content-col">
          <div class="rec-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="switchTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <Transition name="fade" mode="out-in">
            <div :key="activeTab">
              <div v-if="loading" class="loading-row">
                <div class="spinner" />
              </div>
              <div v-else-if="error" class="error-msg">{{ error }}</div>
              <div v-else-if="!movies.length" class="empty-rec">
                <div class="empty-rec-icon">&#9654;</div>
                <p class="empty-rec-title">Sin recomendaciones disponibles</p>
                <p class="empty-rec-sub">
                  Para recibir recomendaciones necesitas tener peliculas vistas, calificadas
                  o preferencias de genero registradas.
                </p>
              </div>
              <div v-else class="movies-grid">
                <MovieCard v-for="m in movies" :key="m.title" :movie="m" />
              </div>
            </div>
          </Transition>

          <section class="browse-section">
            <div class="section-header">
              <div>
                <h2 class="section-title">CATALOGO</h2>
                <p class="section-subtitle">Explorar todas las peliculas</p>
              </div>
              <div class="browse-filters">
                <input v-model="filterClassification" placeholder="Clasificacion..." style="width:160px" @keyup.enter="loadCatalog" />
                <input v-model="filterMinRating" type="number" min="0" max="10" step="0.1" placeholder="Rating minimo" style="width:140px" @keyup.enter="loadCatalog" />
                <button class="btn btn-primary btn-sm" @click="loadCatalog">Buscar</button>
                <button class="btn btn-ghost btn-sm" @click="clearFilters">Limpiar</button>
              </div>
            </div>

            <div v-if="catalogLoading" class="loading-row"><div class="spinner" /></div>
            <div v-else-if="!catalog.length" class="empty-state">Sin resultados.</div>
            <div v-else class="movies-grid">
              <MovieCard v-for="m in catalog" :key="m.title" :movie="m" />
            </div>
          </section>
        </div>

        <!-- Right: friends panel -->
        <aside class="aside-col">
          <FriendsPanel />
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import MovieCard from '@/components/MovieCard.vue'
import FriendsPanel from '@/components/FriendsPanel.vue'
import { auth } from '@/stores/auth'
import { recommendationApi, movieApi } from '@/services/api'
import type { Movie } from '@/types'

type TabKey = 'collaborative' | 'similar' | 'genre' | 'director'

const tabs = [
  { key: 'collaborative' as TabKey, label: 'Colaborativo' },
  { key: 'similar'       as TabKey, label: 'Similares' },
  { key: 'genre'         as TabKey, label: 'Por genero' },
  { key: 'director'      as TabKey, label: 'Por director' },
]

const activeTab = ref<TabKey>('collaborative')
const movies = ref<Movie[]>([])
const loading = ref(false)
const error = ref('')

const catalog = ref<Movie[]>([])
const catalogLoading = ref(false)
const filterClassification = ref('')
const filterMinRating = ref<string>('')

const heroStyle = computed(() => {
  const first = movies.value.find(m => m.backdropUrl) ?? catalog.value.find(m => m.backdropUrl)
  if (!first) return {}
  return { '--hero-bg': `url(${first.backdropUrl})` }
})

async function switchTab(key: TabKey) {
  activeTab.value = key
  await loadRecs()
}

async function loadRecs() {
  loading.value = true
  error.value = ''
  try {
    const fn = {
      collaborative: () => recommendationApi.collaborative(auth.username),
      similar:       () => recommendationApi.similarMovies(auth.username),
      genre:         () => recommendationApi.byGenre(auth.username),
      director:      () => recommendationApi.byDirector(auth.username),
    }[activeTab.value]
    movies.value = await fn()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error cargando recomendaciones'
    movies.value = []
  } finally {
    loading.value = false
  }
}

async function loadCatalog() {
  catalogLoading.value = true
  try {
    catalog.value = await movieApi.getAll({
      classification: filterClassification.value || undefined,
      minRating: filterMinRating.value ? Number(filterMinRating.value) : undefined,
    })
  } catch {
    catalog.value = []
  } finally {
    catalogLoading.value = false
  }
}

function clearFilters() {
  filterClassification.value = ''
  filterMinRating.value = ''
  loadCatalog()
}

onMounted(() => {
  loadRecs()
  loadCatalog()
})
</script>

<style scoped>
.dashboard { min-height: 100vh; }

.hero {
  position: relative;
  height: 300px;
  background: var(--hero-bg, var(--bg-surface)) center/cover no-repeat;
  display: flex; align-items: flex-end;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--bg-base) 0%, rgba(8,10,14,0.6) 50%, transparent 100%);
}
.hero-content { position: relative; z-index: 1; padding: 32px; }
.hero-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 4px; }
.hero-username { font-family: var(--font-display); font-size: 48px; letter-spacing: 0.06em; line-height: 1; }
.hero-sub { font-size: 14px; color: var(--text-secondary); margin-top: 6px; }

.main { padding: 28px 32px; max-width: 1600px; margin: 0 auto; }

.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  align-items: start;
}

.aside-col {
  position: sticky;
  top: 72px;
}

.rec-tabs {
  display: flex; gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}
.rec-tabs .tab-btn {
  padding: 10px 18px; font-size: 13px; font-weight: 500;
  background: none; border: none; color: var(--text-secondary);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s; cursor: pointer;
}
.rec-tabs .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.rec-tabs .tab-btn:hover:not(.active) { color: var(--text-primary); }

.loading-row { display: flex; justify-content: center; padding: 48px; }

.empty-rec {
  text-align: center;
  padding: 52px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.empty-rec-icon { font-size: 40px; color: var(--text-muted); margin-bottom: 16px; }
.empty-rec-title { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 8px; }
.empty-rec-sub { font-size: 13px; color: var(--text-muted); max-width: 380px; margin: 0 auto; line-height: 1.6; }

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.browse-section { margin-top: 52px; }

.section-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
  margin-bottom: 20px;
}

.browse-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

@media (max-width: 900px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .aside-col { position: static; }
}
</style>