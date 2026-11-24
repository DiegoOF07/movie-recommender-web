<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
    to?: RouteLocationRaw
  }>(),
  { variant: 'ghost', size: 'md', type: 'button' },
)
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="['btn', `btn--${variant}`, `btn--${size}`]">
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    :class="['btn', `btn--${variant}`, `btn--${size}`]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--r-sm);
  border: 1px solid transparent;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--ease), border-color var(--ease), color var(--ease);
}

.btn--md {
  padding: 9px 16px;
  font-size: 14px;
}

.btn--sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn--primary {
  background: var(--safelight);
  color: var(--bg);
}

.btn--primary:hover:not(:disabled) {
  background: #ff7351;
}

.btn--ghost {
  background: transparent;
  color: var(--ink-dim);
  border-color: var(--line);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink-mute);
}

.btn--danger {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: #6b2a1e;
}

.btn--danger:hover:not(:disabled) {
  border-color: var(--danger);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
