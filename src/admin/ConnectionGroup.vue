<script setup lang="ts">
import Chip from '@/ui/Chip.vue'
import { relGroupLabel } from './schema'
import type { Group, Neighbor } from '@/types'

const props = defineProps<{ type: string; direction: 'out' | 'in'; group?: Group }>()
const emit = defineEmits<{ remove: [n: Neighbor]; add: []; open: [n: Neighbor] }>()

const total = () => props.group?.total ?? 0
const items = () => props.group?.items ?? []
</script>

<template>
  <section class="group" :aria-label="relGroupLabel(type, direction)">
    <header class="group-head">
      <h3 class="group-title">{{ relGroupLabel(type, direction) }}</h3>
      <span class="group-total">{{ total() }}</span>
      <button type="button" class="group-add" :aria-label="`Agregar a ${relGroupLabel(type, direction)}`" @click="emit('add')">+</button>
    </header>
    <p v-if="!total()" class="group-empty">Sin conexiones</p>
    <ul v-else class="group-items">
      <li v-for="n in items()" :key="n.key">
        <Chip :node="n.label" removable @remove="emit('remove', n)">
          <a href="#" class="chip-link" @click.prevent="emit('open', n)">{{ n.key }}</a>
        </Chip>
      </li>
      <li v-if="total() > items().length" class="group-more">y {{ total() - items().length }} más</li>
    </ul>
  </section>
</template>

<style scoped>
.group {
  padding: 12px 0;
  border-top: 1px solid #2e211d;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
}

.group-total {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
}

.group-add {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: none;
  color: var(--ink-dim);
  cursor: pointer;
}

.group-add:hover {
  color: var(--safelight);
  border-color: var(--safelight);
}

.group-empty {
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-mute);
}

.group-items {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.chip-link {
  color: inherit;
  text-decoration: none;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-link:hover {
  text-decoration: underline;
}

.group-more {
  align-self: center;
  font-size: 12px;
  color: var(--ink-mute);
}
</style>
