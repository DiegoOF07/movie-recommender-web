<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import MovieCard from '@/components/MovieCard.vue'
import FriendsPanel from '@/components/FriendsPanel.vue'
import Button from '@/ui/Button.vue'
import FieldGroup from '@/ui/FieldGroup.vue'
import { auth } from '@/stores/auth'
import { useActivity } from '@/stores/activity'
import { movieApi, recommendationApi } from '@/services/api'
import type { Movie } from '@/types'

type TabKey = 'collaborative' | 'similar' | 'genre' | 'director'

const tabs: { key: TabKey; label: string; hint: string; load: (u: string) => Promise<Movie[]> }[] = [
  { key: 'collaborative', label: 'Colaborativo', hint: 'Lo que calificaron alto usuarios con gustos parecidos a los tuyos.', load: (u) => recommendationApi.collaborative(u) },
  { key: 'similar', label: 'Similares', hint: 'Películas conectadas a las que ya te gustaron.', load: (u) => recommendationApi.similarMovies(u) },
  { key: 'genre', label: 'Por género', hint: 'Lo mejor calificado en tus géneros preferidos.', load: (u) => recommendationApi.byGenre(u) },
  { key: 'director', label: 'Por director', hint: 'Más películas de directores que ya te convencieron.', load: (u) => recommendationApi.byDirector(u) },
]

const PAGE = 24
const RATINGS = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5)

const activity = useActivity()
const activeTab = ref<TabKey>('collaborative')
const recs = ref<Movie[]>([])
const recsLoading = ref(false)
const recsError = ref('')

const catalog = ref<Movie[]>([])
const catalogLoading = ref(false)
const shown = ref(PAGE)
const filterClass = ref('')
const filterMin = ref('')

const current = computed(() => tabs.find((t) => t.key === activeTab.value)!)
const hero = computed(() => recs.value.find((m) => m.backdropUrl) ?? catalog.value.find((m) => m.backdropUrl))
const classifications = computed(() => [...new Set(catalog.value.map((m) => m.classification).filter(Boolean))].sort())

// El catálogo se filtra en el navegador: son unos cientos de películas y así salen las clasificaciones
const filtered = computed(() =>
  catalog.value.filter(
    (m) =>
      (!filterClass.value || m.classification === filterClass.value) &&
      (!filterMin.value || (m.avgRating ?? 0) >= Number(filterMin.value)),
  ),
)
const visibleCatalog = computed(() => filtered.value.slice(0, shown.value))

// Cada carga lleva un número: si el usuario cambió de pestaña mientras tanto, la respuesta se descarta
let recsRequest = 0

async function loadRecs() {
  const id = ++recsRequest
  recsLoading.value = true
  recsError.value = ''
  try {
    const found = (await current.value.load(auth.username)) ?? []
    if (id === recsRequest) recs.value = found
  } catch (e) {
    if (id !== recsRequest) return
    recsError.value = e instanceof Error ? e.message : 'No se pudieron cargar las recomendaciones'
    recs.value = []
  } finally {
    if (id === recsRequest) recsLoading.value = false
  }
}

function selectTab(key: TabKey) {
  if (key === activeTab.value) return
  activeTab.value = key
  loadRecs()
}

// Flechas izquierda/derecha entre pestañas, como pide el patrón de tabs de ARIA
function onTabKey(e: KeyboardEvent) {
  const i = tabs.findIndex((t) => t.key === activeTab.value)
  const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null
  if (next === null) return
  e.preventDefault()
  const t = tabs[(next + tabs.length) % tabs.length]
  selectTab(t.key)
  document.getElementById(`tab-${t.key}`)?.focus()
}

async function loadCatalog() {
  catalogLoading.value = true
  try {
    catalog.value = (await movieApi.getAll()) ?? []
  } catch {
    catalog.value = []
  } finally {
    catalogLoading.value = false
  }
}

function clearFilters() {
  filterClass.value = ''
  filterMin.value = ''
  shown.value = PAGE
}

onMounted(() => {
  activity.load(auth.username)
  loadRecs()
  loadCatalog()
})
</script>

<template>
  <div class="dashboard">
    <Navbar />

    <header class="hero" :style="hero ? { '--hero-bg': `url(${hero.backdropUrl})` } : undefined">
      <div class="hero-content">
        <p class="mono-label">▸ Bienvenido de vuelta</p>
        <h1 class="hero-name">{{ auth.username }}</h1>
        <p class="hero-sub">Tus recomendaciones, reveladas a partir de lo que viste y calificaste.</p>
      </div>
    </header>

    <main class="main">
      <div class="layout">
          <section class="recs" aria-labelledby="recs-title">
            <h2 id="recs-title" class="visually-hidden">Recomendaciones</h2>
            <div class="tabs" role="tablist" aria-label="Estrategia de recomendación" @keydown="onTabKey">
              <button
                v-for="t in tabs"
                :id="`tab-${t.key}`"
                :key="t.key"
                type="button"
                role="tab"
                class="tab"
                :aria-selected="t.key === activeTab"
                :tabindex="t.key === activeTab ? 0 : -1"
                aria-controls="recs-panel"
                @click="selectTab(t.key)"
              >
                {{ t.label }}
              </button>
            </div>

            <div id="recs-panel" role="tabpanel" :aria-labelledby="`tab-${activeTab}`" :aria-busy="recsLoading">
              <p class="tab-hint">{{ current.hint }}</p>
              <div v-if="recsLoading" class="grid">
                <div v-for="i in 6" :key="i" class="skeleton" aria-hidden="true" />
              </div>
              <p v-else-if="recsError" class="state state--error">{{ recsError }}</p>
              <div v-else-if="!recs.length" class="state">
                <p class="mono-label">▸ Película sin revelar</p>
                <p class="state-title">Todavía no hay recomendaciones</p>
                <p>Marca como vistas y califica algunas películas del catálogo, o sigue a otros usuarios.</p>
              </div>
              <div v-else class="grid">
                <MovieCard v-for="(m, i) in recs" :key="m.title" :movie="m" :frame="i + 1" :strategy="current.label" />
              </div>
            </div>
          </section>

          <aside class="aside">
            <FriendsPanel />
          </aside>

          <section class="catalog" aria-labelledby="catalog-title">
            <header class="catalog-head">
              <div>
                <p class="mono-label">▸ Archivo</p>
                <h2 id="catalog-title" class="section-title">CATÁLOGO</h2>
              </div>
              <div class="filters">
                <FieldGroup label="Clasificación">
                  <template #default="{ id }">
                    <select :id="id" v-model="filterClass" @change="shown = PAGE">
                      <option value="">Todas</option>
                      <option v-for="c in classifications" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </template>
                </FieldGroup>
                <FieldGroup label="Calificación mínima">
                  <template #default="{ id }">
                    <select :id="id" v-model="filterMin" @change="shown = PAGE">
                      <option value="">Cualquiera</option>
                      <option v-for="r in RATINGS" :key="r" :value="String(r)">★ {{ r }}+</option>
                    </select>
                  </template>
                </FieldGroup>
                <Button v-if="filterClass || filterMin" size="sm" @click="clearFilters">Limpiar</Button>
              </div>
            </header>

            <p class="count mono-label" aria-live="polite">{{ filtered.length }} películas</p>
            <div v-if="catalogLoading" class="grid">
              <div v-for="i in 6" :key="i" class="skeleton" aria-hidden="true" />
            </div>
            <p v-else-if="!filtered.length" class="state">Ninguna película cumple esos filtros.</p>
            <div v-else class="grid">
              <MovieCard v-for="m in visibleCatalog" :key="m.title" :movie="m" />
            </div>
            <div v-if="shown < filtered.length" class="more">
              <Button @click="shown += PAGE">Cargar más ({{ filtered.length - shown }} restantes)</Button>
            </div>
          </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 300px;
  background: var(--hero-bg, var(--surface)) center 25% / cover no-repeat;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, var(--bg) 4%, rgba(18, 13, 12, 0.72) 48%, rgba(18, 13, 12, 0.25)),
    linear-gradient(to right, rgba(18, 13, 12, 0.85), transparent 65%);
}

.hero-content {
  position: relative;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 36px 32px 28px;
}

.hero-name {
  font-family: var(--font-display);
  font-size: clamp(40px, 7vw, 72px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  margin: 4px 0 8px;
  overflow-wrap: anywhere;
}

.hero-sub {
  color: var(--ink-dim);
  max-width: 52ch;
}

.main {
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px 32px 64px;
}

/* En escritorio el panel de amigos acompaña a todo; en teléfono queda entre recomendaciones y catálogo */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: 'recs aside' 'catalog aside';
  column-gap: 28px;
  align-items: start;
}

.recs { grid-area: recs; min-width: 0; }
.catalog { grid-area: catalog; min-width: 0; }

.aside {
  grid-area: aside;
  position: sticky;
  top: 72px;
}

.tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--line);
}

.tab {
  flex-shrink: 0;
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: none;
  color: var(--ink-dim);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease);
}

.tab:hover {
  color: var(--ink);
}

.tab[aria-selected='true'] {
  color: var(--safelight);
  border-bottom-color: var(--safelight);
}

.tab-hint {
  margin: 14px 0 18px;
  font-size: 13px;
  color: var(--ink-mute);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.skeleton {
  aspect-ratio: 2 / 3.9;
  border-radius: var(--r);
  background: linear-gradient(100deg, var(--surface) 40%, var(--surface-2) 50%, var(--surface) 60%) 0 0 / 300% 100%;
  animation: shimmer 1.4s linear infinite;
}

@keyframes shimmer {
  to {
    background-position: -150% 0;
  }
}

.state {
  padding: 44px 24px;
  border: 1px dashed var(--line);
  border-radius: var(--r);
  text-align: center;
  color: var(--ink-dim);
  font-size: 14px;
}

.state-title {
  margin: 6px 0;
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--ink);
}

.state--error {
  color: var(--danger);
  border-color: var(--danger);
}

.catalog {
  margin-top: 56px;
}

.catalog-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.section-title {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  margin-top: 2px;
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.filters :deep(.field) {
  min-width: 160px;
}

.count {
  margin: 14px 0;
  color: var(--ink-mute);
}

.more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 899px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'recs' 'aside' 'catalog';
  }

  .aside {
    position: static;
    margin-top: 32px;
  }
}

@media (max-width: 599px) {
  .hero-content,
  .main {
    padding-left: 16px;
    padding-right: 16px;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
