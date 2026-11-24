<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ modelValue: number; disabled?: boolean; disabledHint?: string; label?: string }>(),
  { label: 'Tu calificación' },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const hover = ref(0)
const shown = computed(() => hover.value || props.modelValue)

function fill(i: number): 'full' | 'half' | 'empty' {
  if (shown.value >= i) return 'full'
  if (shown.value >= i - 0.5) return 'half'
  return 'empty'
}

// Volver a elegir el mismo valor borra la calificación
function pick(v: number) {
  if (props.disabled) return
  emit('update:modelValue', v === props.modelValue ? 0 : v)
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  const v = props.modelValue
  const next: Record<string, number> = {
    ArrowRight: Math.min(5, (v || 0) + 0.5),
    ArrowUp: Math.min(5, (v || 0) + 0.5),
    ArrowLeft: Math.max(0.5, v - 0.5),
    ArrowDown: Math.max(0.5, v - 0.5),
    Home: 0.5,
    End: 5,
    Delete: 0,
    Backspace: 0,
  }
  if (!(e.key in next)) return
  e.preventDefault()
  emit('update:modelValue', next[e.key])
}
</script>

<template>
  <div
    class="stars"
    :class="{ disabled }"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    aria-valuemin="0.5"
    aria-valuemax="5"
    :aria-valuenow="modelValue || undefined"
    :aria-valuetext="modelValue ? `${modelValue} de 5` : 'Sin calificar'"
    :aria-disabled="disabled ? 'true' : undefined"
    :title="disabled ? disabledHint : undefined"
    @keydown="onKeydown"
    @mouseleave="hover = 0"
  >
    <span v-for="i in 5" :key="i" :class="['star', `star--${fill(i)}`]">
      <span class="star-shape" aria-hidden="true">★</span>
      <span
        class="star-hit star-hit--left"
        :data-value="i - 0.5"
        @click="pick(i - 0.5)"
        @mouseenter="!disabled && (hover = i - 0.5)"
      />
      <span class="star-hit star-hit--right" :data-value="i" @click="pick(i)" @mouseenter="!disabled && (hover = i)" />
    </span>
  </div>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 1px;
  border-radius: 4px;
}

.star {
  position: relative;
  width: 18px;
  height: 18px;
  font-size: 18px;
  line-height: 18px;
}

.star-shape {
  position: absolute;
  inset: 0;
  color: #4a3630;
}

/* Media estrella: la mitad izquierda pintada encima del contorno vacío */
.star--full .star-shape {
  color: var(--amber);
}

.star--half .star-shape {
  background: linear-gradient(90deg, var(--amber) 50%, #4a3630 50%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.star-hit {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  cursor: pointer;
}

.star-hit--left {
  left: 0;
}

.star-hit--right {
  right: 0;
}

.disabled .star-hit {
  cursor: not-allowed;
}

.disabled .star-shape {
  opacity: 0.45;
}
</style>
