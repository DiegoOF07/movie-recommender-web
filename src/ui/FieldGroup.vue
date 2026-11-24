<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{ label: string; hint?: string; error?: string }>()
const id = useId()
const describedBy = computed(() => (props.error || props.hint ? `${id}-desc` : undefined))
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label class="field-label" :for="id">{{ label }}</label>
    <slot :id="id" :described-by="describedBy" :invalid="!!error" />
    <p v-if="error || hint" :id="`${id}-desc`" class="field-desc">{{ error || hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 6px;
}

.field-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

.field-desc {
  font-size: 12px;
  color: var(--ink-mute);
}

.field--error .field-desc {
  color: var(--danger);
}

.field :deep(input),
.field :deep(select),
.field :deep(textarea) {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 14px;
}

.field :deep(textarea) {
  min-height: 90px;
  resize: vertical;
}

.field--error :deep(input),
.field--error :deep(select),
.field--error :deep(textarea) {
  border-color: var(--danger);
}
</style>
