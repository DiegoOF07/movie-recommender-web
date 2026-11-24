<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NODE_TYPES } from '@/admin/schema'
import NodePanel from '@/admin/NodePanel.vue'
import GlobalSearch from '@/admin/GlobalSearch.vue'
import DataTable from '@/ui/DataTable.vue'
import Button from '@/ui/Button.vue'
import SidePanel from '@/ui/SidePanel.vue'
import { auth } from '@/stores/auth'
import type { NodeLabel, NodeRef } from '@/types'

const LABELS = Object.keys(NODE_TYPES) as NodeLabel[]

const route = useRoute()
const router = useRouter()

const rows = reactive<Partial<Record<NodeLabel, Record<string, unknown>[]>>>({})
const loading = ref(false)
const filter = ref('')
const creating = ref(false)

const label = computed<NodeLabel>(() => {
  const l = route.params.label as string
  return LABELS.includes(l as NodeLabel) ? (l as NodeLabel) : 'Movie'
})
const nodeKey = computed(() => (route.params.key as string) || null)
const type = computed(() => NODE_TYPES[label.value])
const panelOpen = computed(() => creating.value || !!nodeKey.value)

async function load(l: NodeLabel, force = false) {
  if (rows[l] && !force) return
  if (l === label.value) loading.value = true
  try {
    rows[l] = (await NODE_TYPES[l].list()) ?? []
  } catch {
    rows[l] = []
  } finally {
    if (l === label.value) loading.value = false
  }
}

function go(l: NodeLabel, key?: string | null) {
  creating.value = false
  router.push({ name: 'admin', params: { label: l, key: key ?? undefined } })
}

function openRef(ref: NodeRef) {
  go(ref.label, ref.key)
}

function startCreate() {
  router.push({ name: 'admin', params: { label: label.value } })
  creating.value = true
}

async function onDeleted() {
  await load(label.value, true)
  go(label.value)
}

async function onCreated(ref: NodeRef) {
  await load(ref.label, true)
  go(ref.label, ref.key)
}

function logout() {
  auth.logoutAdmin()
  router.push('/admin/login')
}

// Una etiqueta que no existe en la URL se corrige a películas
watch(
  () => route.params.label,
  (l) => {
    if (l !== label.value) router.replace({ name: 'admin', params: { label: label.value } })
    filter.value = ''
    load(label.value)
  },
  { immediate: true },
)

onMounted(() => LABELS.forEach((l) => load(l)))
</script>

<template>
  <div class="admin">
    <header class="top">
      <RouterLink :to="{ name: 'admin', params: { label: 'Movie' } }" class="brand">CINEGRAFO</RouterLink>
      <span class="crumb mono-label">/ administración</span>
      <GlobalSearch class="search" />
      <nav class="top-actions" aria-label="Salir del panel">
        <Button to="/dashboard" size="sm">Ver la app</Button>
        <Button size="sm" @click="logout">Salir</Button>
      </nav>
    </header>

    <div :class="['body', { 'body--panel': panelOpen }]">
      <nav class="types" data-test="types" aria-label="Tipos de nodo">
        <p class="mono-label types-title">▸ Nodos</p>
        <RouterLink
          v-for="l in LABELS"
          :key="l"
          :to="{ name: 'admin', params: { label: l } }"
          :class="['type', `type--${l.toLowerCase()}`, { active: l === label }]"
          :aria-current="l === label ? 'page' : undefined"
          @click="creating = false"
        >
          <span class="type-dot" aria-hidden="true" />
          <span class="type-name">{{ NODE_TYPES[l].plural }}</span>
          <span class="type-count">{{ rows[l]?.length ?? '…' }}</span>
        </RouterLink>
      </nav>

      <main class="list" :aria-busy="loading">
        <header class="list-head">
          <div>
            <p class="mono-label">▸ {{ type.label }}</p>
            <h1 class="list-title">{{ type.plural.toUpperCase() }}</h1>
          </div>
          <Button variant="primary" @click="startCreate">+ Nuevo</Button>
        </header>
        <label class="visually-hidden" for="table-filter">Filtrar {{ type.plural.toLowerCase() }}</label>
        <input id="table-filter" v-model="filter" class="filter" type="search" :placeholder="`Filtrar ${type.plural.toLowerCase()}…`" />
        <DataTable
          :rows="rows[label] ?? []"
          :columns="type.columns"
          :row-key="type.key"
          :selected="nodeKey ?? undefined"
          :filter="filter"
          :caption="type.plural"
          @select="(k) => go(label, k)"
        />
      </main>

      <SidePanel :open="panelOpen" class="panel" :label="`Ficha de ${type.label.toLowerCase()}`" @close="go(label)">
        <template #header>
          <p class="mono-label">▸ Ficha · {{ type.label }}</p>
        </template>
        <NodePanel
          :key="`${label}:${nodeKey ?? 'nuevo'}`"
          :label="label"
          :node-key="creating ? null : nodeKey"
          @open="openRef"
          @deleted="onDeleted"
          @created="onCreated"
        />
      </SidePanel>
    </div>
  </div>
</template>

<style scoped>
.admin {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
}

.top {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 58px;
  padding: 0 20px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}

.brand {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--safelight);
  text-decoration: none;
}

.crumb {
  color: var(--ink-mute);
  white-space: nowrap;
}

.search {
  margin-left: auto;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
}

.body--panel {
  grid-template-columns: 200px minmax(0, 1fr) minmax(360px, 460px);
}

.types {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 18px 12px;
  border-right: 1px solid var(--line);
  overflow-y: auto;
}

.types-title {
  padding: 0 10px 8px;
}

.type {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--r-sm);
  color: var(--ink-dim);
  text-decoration: none;
  font-size: 14px;
}

.type:hover {
  background: var(--surface);
  color: var(--ink);
}

.type.active {
  background: rgba(255, 90, 54, 0.14);
  color: var(--safelight);
}

.type.active .type-count {
  color: var(--safelight);
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type--movie .type-dot { background: var(--node-movie); }
.type--user .type-dot { background: var(--node-user); }
.type--genre .type-dot { background: var(--node-genre); }
.type--actor .type-dot { background: var(--node-actor); }
.type--director .type-dot { background: var(--node-director); }

.type-name {
  flex: 1;
}

.type-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  padding: 18px 22px;
  overflow: hidden;
}

.list-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.list-title {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  margin-top: 2px;
}

.filter {
  width: 100%;
  max-width: 360px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.list :deep(.dt) {
  flex: 1;
  min-height: 0;
}

.panel {
  min-height: 0;
}

@media (max-width: 1099px) {
  .crumb {
    display: none;
  }

  .body,
  .body--panel {
    grid-template-columns: 170px minmax(0, 1fr);
  }

  /* Sin espacio para tres columnas, la ficha cubre la pantalla (ver SidePanel) */
  .panel {
    position: fixed;
    inset: 58px 0 0 auto;
    width: min(460px, 100%);
    z-index: 40;
    box-shadow: -16px 0 40px rgba(0, 0, 0, 0.5);
  }
}

@media (max-width: 699px) {
  .top {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 14px;
  }

  .search {
    order: 3;
    width: 100%;
    margin: 0;
  }

  .body,
  .body--panel {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .types {
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--line);
    padding: 8px 12px;
  }

  .types-title {
    display: none;
  }

  .type {
    flex-shrink: 0;
  }
}
</style>
