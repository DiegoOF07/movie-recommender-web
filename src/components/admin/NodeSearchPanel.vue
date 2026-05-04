<template>
    <div class="panel">
        <div class="panel-header">
            <div>
                <h2 class="section-title">BUSCAR NODO</h2>
                <p class="section-subtitle">Consulta un nodo especifico por su identificador</p>
            </div>
        </div>

        <div class="search-card card">
            <div class="form-row" style="align-items:flex-end">
                <div class="form-group" style="min-width:180px;flex-shrink:0">
                    <label>Tipo de nodo</label>
                    <select v-model="selectedType" @change="reset">
                        <option v-for="t in nodeTypes" :key="t.key" :value="t.key">{{ t.label }}</option>
                    </select>
                </div>
                <div class="form-group" style="flex:1">
                    <label>Identificador</label>
                    <input v-model="query" :placeholder="currentType.placeholder" @keyup.enter="search" />
                </div>
                <button class="btn btn-primary" style="flex-shrink:0" :disabled="!query.trim() || loading"
                    @click="search">
                    <span v-if="loading" class="spinner" style="width:14px;height:14px;margin:0" />
                    <span v-else>Buscar</span>
                </button>
            </div>
            <p v-if="error" class="error-msg" style="margin-top:8px">{{ error }}</p>
        </div>

        <Transition name="fade">
            <div v-if="result" class="result-card card">
                <div class="result-header" :class="{ 'has-backdrop': selectedType === 'movie' && photoUrl }">
                    <div v-if="selectedType === 'movie' && photoUrl" class="backdrop-wrap">
                        <img :src="photoUrl" :alt="resultId" class="backdrop-img"
                            @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
                        <div class="backdrop-overlay" />
                        <div class="backdrop-content">
                            <span class="result-label-badge">{{ currentType.label }}</span>
                            <h3 class="result-title">{{ resultId }}</h3>
                        </div>
                    </div>

                    <template v-else>
                        <div v-if="currentType.photoKey" class="result-photo-wrap">
                            <img v-if="photoUrl" :src="photoUrl" :alt="resultId" class="result-photo"
                                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
                            <div v-else class="result-photo-fallback">{{ initials(resultId) }}</div>
                        </div>
                        <div class="result-title-block">
                            <span class="result-label-badge">{{ currentType.label }}</span>
                            <h3 class="result-title">{{ resultId }}</h3>
                        </div>
                    </template>
                </div>

                <div class="props-grid">
                    <div v-for="(val, key) in result" :key="key" class="prop-item">
                        <span class="prop-key">{{ key }}</span>
                        <span class="prop-val">{{ formatValue(val) }}</span>
                    </div>
                </div>
            </div>
        </Transition>

        <div v-if="searched && !result && !loading && !error" class="empty-state" style="margin-top:24px">
            No se encontro ningun nodo con ese identificador.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { movieApi, userApi, actorApi, directorApi, genreApi } from '@/services/api'

type NodeRecord = Record<string, unknown>

interface NodeTypeConfig {
    key: string
    label: string
    placeholder: string
    idKey: string
    photoKey?: string
    fetch: (id: string) => Promise<NodeRecord>
}

const nodeTypes: NodeTypeConfig[] = [
    {
        key: 'movie',
        label: 'Movie',
        placeholder: 'Titulo de la pelicula',
        idKey: 'title',
        fetch: (id) => movieApi.getOne(id) as unknown as Promise<NodeRecord>,
    },
    {
        key: 'user',
        label: 'User',
        placeholder: 'Username del usuario',
        idKey: 'username',
        fetch: (id) => userApi.getOne(id) as unknown as Promise<NodeRecord>,
    },
    {
        key: 'actor',
        label: 'Actor',
        placeholder: 'Nombre del actor',
        idKey: 'name',
        photoKey: 'profileUrl',
        fetch: (id) => actorApi.getOne(id) as unknown as Promise<NodeRecord>,
    },
    {
        key: 'director',
        label: 'Director',
        placeholder: 'Nombre del director',
        idKey: 'name',
        photoKey: 'profileUrl',
        fetch: (id) => directorApi.getOne(id) as unknown as Promise<NodeRecord>,
    },
    {
        key: 'genre',
        label: 'Genre',
        placeholder: 'Nombre del genero',
        idKey: 'name',
        fetch: (id) => genreApi.getOne(id) as unknown as Promise<NodeRecord>,
    },
]

const selectedType = ref('movie')
const query = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<NodeRecord | null>(null)
const searched = ref(false)

const currentType = computed(() => nodeTypes.find(t => t.key === selectedType.value)!)

const resultId = computed((): string => {
    if (!result.value) return ''
    return String(result.value[currentType.value.idKey] ?? '')
})

const photoUrl = computed((): string => {
    if (!result.value) return ''
    if (selectedType.value === 'movie') {
        return String(result.value['backdropUrl'] ?? result.value['posterUrl'] ?? '')
    }
    if (!currentType.value.photoKey) return ''
    return String(result.value[currentType.value.photoKey] ?? '')
})

function reset() {
    query.value = ''
    result.value = null
    error.value = ''
    searched.value = false
}

function initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '—'
    if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
    if (typeof val === 'boolean') return val ? 'Si' : 'No'
    return String(val)
}

async function search() {
    if (!query.value.trim()) return
    loading.value = true
    error.value = ''
    result.value = null
    searched.value = true
    try {
        result.value = await currentType.value.fetch(query.value.trim())
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Error al buscar'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.panel {
    padding: 28px;
    max-width: 800px;
    margin: 0 auto;
}

.panel-header {
    margin-bottom: 24px;
}

.search-card {
    padding: 20px;
}

.result-card {
    margin-top: 24px;
    padding: 24px;
    overflow: hidden;
}

.result-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
}

.result-photo-wrap {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
}

.result-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.result-photo-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 22px;
    color: var(--accent);
    background: var(--accent-dim);
}

.result-title-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.result-label-badge {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--accent);
    border: 1px solid rgba(232, 184, 75, 0.3);
    border-radius: 4px;
    padding: 2px 8px;
    align-self: flex-start;
}

.result-title {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: 0.04em;
    color: var(--text-primary);
}

.props-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
}

.prop-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 12px;
    background: var(--bg-elevated);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
}

.prop-key {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.prop-val {
    font-size: 13px;
    color: var(--text-primary);
    word-break: break-word;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.result-header.has-backdrop {
  padding: 0;
  border-bottom: none;
  margin-bottom: 0;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  overflow: hidden;
}

.backdrop-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/6;
  overflow: hidden;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8,10,14,0.92) 0%, rgba(8,10,14,0.3) 60%, transparent 100%);
}

.backdrop-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.backdrop-content .result-title {
  font-size: 26px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}
</style>