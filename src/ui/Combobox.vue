<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import Chip from './Chip.vue'
import type { NodeRef } from '@/types'

const LABEL_TEXT: Record<string, string> = {
  Movie: 'Película',
  User: 'Usuario',
  Genre: 'Género',
  Actor: 'Actor',
  Director: 'Director',
}

const props = withDefaults(
  defineProps<{
    search: (q: string) => Promise<NodeRef[]>
    modelValue: NodeRef | null
    placeholder?: string
    debounce?: number
    inputId?: string
  }>(),
  { placeholder: 'Buscar…', debounce: 200 },
)
const emit = defineEmits<{ 'update:modelValue': [value: NodeRef] }>()

const listId = useId()
const query = ref(props.modelValue?.key ?? '')
const results = ref<NodeRef[]>([])
const open = ref(false)
const loading = ref(false)
const active = ref(-1)
let timer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

const activeId = computed(() => (active.value >= 0 ? `${listId}-${active.value}` : undefined))

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  clearTimeout(timer)
  const q = query.value.trim()
  if (!q) {
    open.value = false
    results.value = []
    return
  }
  timer = setTimeout(() => run(q), props.debounce)
}

// Cada búsqueda lleva un número; solo la última puede escribir resultados
async function run(q: string) {
  const id = ++requestId
  loading.value = true
  open.value = true
  try {
    const found = await props.search(q)
    if (id !== requestId) return
    results.value = found
    active.value = -1
  } catch {
    if (id === requestId) results.value = []
  } finally {
    if (id === requestId) loading.value = false
  }
}

function choose(i: number) {
  const ref = results.value[i]
  if (!ref) return
  emit('update:modelValue', ref)
  query.value = ref.key
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' && results.value.length) {
    e.preventDefault()
    open.value = true
    active.value = (active.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp' && results.value.length) {
    e.preventDefault()
    active.value = (active.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter' && open.value && active.value >= 0) {
    e.preventDefault()
    choose(active.value)
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    e.stopPropagation()
    open.value = false
  }
}
</script>

<template>
  <div class="combo">
    <input
      :id="inputId"
      class="combo-input"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="activeId"
      :placeholder="placeholder"
      :value="query"
      @input="onInput"
      @keydown="onKeydown"
      @blur="open = false"
    />
    <ul v-show="open" :id="listId" class="combo-list" role="listbox">
      <li v-if="loading && !results.length" class="combo-note">Buscando…</li>
      <li v-else-if="!results.length" class="combo-note">Sin resultados</li>
      <li
        v-for="(r, i) in results"
        :id="`${listId}-${i}`"
        :key="`${r.label}:${r.key}`"
        role="option"
        :aria-selected="i === active"
        :class="['combo-option', { active: i === active }]"
        @mousedown.prevent="choose(i)"
        @mouseenter="active = i"
      >
        <Chip :node="r.label">{{ LABEL_TEXT[r.label] }}</Chip>
        <span class="combo-key">{{ r.key }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.combo {
  position: relative;
}

.combo-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 14px;
}

.combo-list {
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 280px;
  overflow-y: auto;
  list-style: none;
  padding: 4px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.combo-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.combo-option.active {
  background: rgba(255, 90, 54, 0.14);
}

.combo-key {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combo-note {
  padding: 8px;
  color: var(--ink-mute);
  font-size: 13px;
}
</style>
