<script setup lang="ts">
defineProps<{ open: boolean; label?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <aside v-if="open" class="side-panel" :aria-label="label" @keydown.esc="emit('close')">
    <header class="side-head">
      <slot name="header" />
      <button type="button" class="side-close" aria-label="Cerrar ficha" @click="emit('close')">×</button>
    </header>
    <div class="side-body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.side-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--line);
}

.side-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px 12px;
  border-bottom: 1px solid var(--line);
}

.side-head > :first-child {
  flex: 1;
  min-width: 0;
}

.side-close {
  border: 1px solid var(--line);
  background: none;
  color: var(--ink-dim);
  width: 30px;
  height: 30px;
  border-radius: var(--r-sm);
  font-size: 18px;
  cursor: pointer;
}

.side-close:hover {
  color: var(--ink);
}

.side-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 28px;
}

@media (max-width: 899px) {
  .side-panel {
    position: fixed;
    inset: 0;
    z-index: 60;
    border-left: none;
  }
}
</style>
