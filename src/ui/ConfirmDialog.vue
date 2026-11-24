<script setup lang="ts">
import { ref, watch, onMounted, useId } from 'vue'
import Button from './Button.vue'

const props = withDefaults(
  defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; loading?: boolean }>(),
  { confirmLabel: 'Confirmar' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const dialog = ref<HTMLDialogElement>()
const titleId = useId()

// jsdom no implementa showModal; ahí basta con el atributo open
function sync(open: boolean) {
  const el = dialog.value
  if (!el) return
  if (open && !el.open) {
    if (typeof el.showModal === 'function') el.showModal()
    else el.setAttribute('open', '')
  } else if (!open && el.open) {
    if (typeof el.close === 'function') el.close()
    else el.removeAttribute('open')
  }
}

onMounted(() => sync(props.open))
watch(() => props.open, sync)
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm"
    :aria-labelledby="titleId"
    @cancel.prevent="emit('cancel')"
    @keydown.esc.stop.prevent="emit('cancel')"
  >
    <p class="mono-label">{{ danger ? '▸ Acción permanente' : '▸ Confirmar' }}</p>
    <h2 :id="titleId" class="confirm-title">{{ title }}</h2>
    <p class="confirm-msg">{{ message }}</p>
    <div class="confirm-actions">
      <Button data-test="cancel" @click="emit('cancel')">Cancelar</Button>
      <Button data-test="confirm" :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel }}
      </Button>
    </div>
  </dialog>
</template>

<style scoped>
.confirm {
  margin: auto;
  width: min(420px, calc(100vw - 32px));
  padding: 22px;
  border-radius: var(--r);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
}

.confirm::backdrop {
  background: rgba(10, 6, 5, 0.72);
}

.confirm-title {
  margin: 6px 0 8px;
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: 0.02em;
}

.confirm-msg {
  color: var(--ink-dim);
  font-size: 14px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>
