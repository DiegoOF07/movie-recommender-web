<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Combobox from '@/ui/Combobox.vue'
import { graphApi } from '@/services/api'
import type { NodeRef } from '@/types'

const router = useRouter()
const picked = ref<NodeRef | null>(null)
const root = ref<HTMLElement>()

function open(ref: NodeRef | null) {
  if (!ref) return
  router.push({ name: 'admin', params: { label: ref.label, key: ref.key } })
  picked.value = null
}

// "/" enfoca el buscador, salvo que se esté escribiendo en otro campo
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key !== '/' || t.closest('input, textarea, select, [contenteditable]')) return
  e.preventDefault()
  root.value?.querySelector('input')?.focus()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div ref="root" class="global-search">
    <label class="visually-hidden" for="global-search">Buscar en el grafo</label>
    <Combobox
      :model-value="picked"
      input-id="global-search"
      :search="(q) => graphApi.search(q, undefined, 10)"
      placeholder="Buscar películas, personas, usuarios…"
      @update:model-value="open"
    />
    <kbd class="hint" aria-hidden="true">/</kbd>
  </div>
</template>

<style scoped>
.global-search {
  position: relative;
  width: min(420px, 100%);
}

.hint {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
  pointer-events: none;
}
</style>
