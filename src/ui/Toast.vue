<script setup lang="ts">
import { useToast } from './toast'

const { messages, dismiss } = useToast()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <button
        v-for="m in messages"
        :key="m.id"
        type="button"
        :class="['toast', `toast--${m.kind}`]"
        @click="dismiss(m.id)"
      >
        <span class="mono-label">{{ m.kind === 'error' ? '✕ Error' : '▸ Listo' }}</span>
        {{ m.text }}
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 200;
  display: grid;
  gap: 8px;
  max-width: min(380px, calc(100vw - 40px));
}

.toast {
  display: grid;
  gap: 2px;
  text-align: left;
  padding: 10px 14px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.toast--error {
  border-color: var(--danger);
}

.toast--error .mono-label {
  color: var(--danger);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
