<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface Column {
  key: string
  label: string
  width?: string
  format?: (v: unknown) => string
}

const props = withDefaults(
  defineProps<{
    rows: Record<string, unknown>[]
    columns: Column[]
    rowKey: string
    selected?: string
    pageSize?: number
    filter?: string
    caption?: string
  }>(),
  { pageSize: 25, filter: '' },
)
const emit = defineEmits<{ select: [key: string] }>()

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const filtered = computed(() => {
  const q = fold(props.filter.trim())
  if (!q) return props.rows
  return props.rows.filter((r) => props.columns.some((c) => fold(String(r[c.key] ?? '')).includes(q)))
})

const page = ref(0)
const active = ref(-1)
const scroller = ref<HTMLElement>()
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const start = computed(() => page.value * props.pageSize)
const visible = computed(() => filtered.value.slice(start.value, start.value + props.pageSize))
const range = computed(() => {
  const n = filtered.value.length
  return n ? `${start.value + 1}–${Math.min(start.value + props.pageSize, n)} de ${n}` : '0 de 0'
})

watch(
  () => [props.filter, props.rows],
  () => {
    page.value = 0
    active.value = -1
  },
)

const keyOf = (r: Record<string, unknown>) => String(r[props.rowKey])

// Si la fila seleccionada (por ejemplo, desde la URL) está en otra página, se muestra esa página
watch(
  () => [props.selected, filtered.value] as const,
  ([sel]) => {
    if (!sel) return
    const i = filtered.value.findIndex((r) => keyOf(r) === sel)
    if (i < 0) return
    page.value = Math.floor(i / props.pageSize)
    // La fila puede quedar bajo el borde de la tabla; se trae a la vista sin mover la página entera
    nextTick(() => scroller.value?.querySelector<HTMLElement>('tr.selected')?.scrollIntoView?.({ block: 'nearest' }))
  },
  { immediate: true },
)
const cell = (r: Record<string, unknown>, c: Column) => (c.format ? c.format(r[c.key]) : String(r[c.key] ?? '—'))

function go(delta: number) {
  page.value = Math.min(pages.value - 1, Math.max(0, page.value + delta))
  active.value = -1
}

// La fila activa es un índice sobre todo el filtrado: al salir de la página, la página la sigue
function onKeydown(e: KeyboardEvent) {
  const n = filtered.value.length
  if (!n) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const base = active.value < 0 ? start.value - 1 : start.value + active.value
    const next = Math.min(n - 1, Math.max(0, base + (e.key === 'ArrowDown' ? 1 : -1)))
    page.value = Math.floor(next / props.pageSize)
    active.value = next - page.value * props.pageSize
  } else if (e.key === 'Enter' && active.value >= 0) {
    e.preventDefault()
    emit('select', keyOf(visible.value[active.value]))
  }
}
</script>

<template>
  <div class="dt">
    <div ref="scroller" class="dt-scroll">
      <table data-test="grid" class="dt-table" tabindex="0" @keydown="onKeydown">
        <caption v-if="caption" class="visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" scope="col" :style="{ width: c.width }">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(r, i) in visible"
            :key="keyOf(r)"
            :aria-selected="keyOf(r) === selected ? 'true' : 'false'"
            :class="{ active: i === active, selected: keyOf(r) === selected }"
            @click="emit('select', keyOf(r))"
          >
            <td v-for="c in columns" :key="c.key">{{ cell(r, c) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="dt-empty">Sin resultados</p>
    </div>
    <footer class="dt-foot">
      <span class="dt-range">{{ range }}</span>
      <div class="dt-pager">
        <button type="button" data-test="prev" :disabled="page === 0" @click="go(-1)">Anterior</button>
        <button type="button" data-test="next" :disabled="page >= pages - 1" @click="go(1)">Siguiente</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.dt {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dt-scroll {
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
}

.dt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.dt-table:focus-visible {
  outline-offset: -2px;
}

th {
  position: sticky;
  top: 0;
  background: var(--surface);
  text-align: left;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
  border-bottom: 1px solid var(--line);
}

td {
  padding: 9px 14px;
  border-top: 1px solid #2e211d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

tbody tr {
  cursor: pointer;
  transition: background var(--ease);
}

tbody tr:hover,
tbody tr.active {
  background: #241815;
}

tbody tr.selected,
tbody tr.selected:hover {
  background: rgba(255, 90, 54, 0.14);
  color: var(--safelight);
}

.dt-empty {
  padding: 28px;
  text-align: center;
  color: var(--ink-mute);
}

.dt-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 2px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-mute);
}

.dt-pager {
  display: flex;
  gap: 6px;
}

.dt-pager button {
  padding: 4px 10px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: none;
  color: var(--ink-dim);
  cursor: pointer;
  font-family: var(--font-body);
}

.dt-pager button:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
