<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { NodeLabel } from '@/types'

const props = defineProps<{ node?: NodeLabel; removable?: boolean }>()
const emit = defineEmits<{ remove: [] }>()
const slots = useSlots()

const text = computed(() => {
  const nodes = slots.default?.() ?? []
  return nodes.map((n) => (typeof n.children === 'string' ? n.children : '')).join('').trim()
})
</script>

<template>
  <span :class="['chip', props.node ? `chip--${props.node.toLowerCase()}` : 'chip--plain']">
    <slot />
    <button
      v-if="removable"
      type="button"
      class="chip-remove"
      :aria-label="`Quitar ${text}`"
      @click="emit('remove')"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid transparent;
}

.chip--plain {
  color: var(--ink-dim);
  border-color: var(--line);
}

.chip--movie { color: var(--node-movie); background: var(--node-movie-bg); }
.chip--user { color: var(--node-user); background: var(--node-user-bg); }
.chip--genre { color: var(--node-genre); background: var(--node-genre-bg); }
.chip--actor { color: var(--node-actor); background: var(--node-actor-bg); }
.chip--director { color: var(--node-director); background: var(--node-director-bg); }

.chip-remove {
  border: none;
  background: none;
  color: inherit;
  opacity: 0.7;
  font-size: 14px;
  line-height: 1;
  padding: 0 0 0 2px;
  cursor: pointer;
}

.chip-remove:hover {
  opacity: 1;
}
</style>
