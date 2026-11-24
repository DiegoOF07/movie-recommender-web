<script setup lang="ts">
import { reactive, ref } from 'vue'
import FieldGroup from '@/ui/FieldGroup.vue'
import Button from '@/ui/Button.vue'
import type { Field } from './schema'

const props = withDefaults(
  defineProps<{ fields: Field[]; initial?: Record<string, unknown>; submitLabel?: string; busy?: boolean }>(),
  { initial: () => ({}), submitLabel: 'Guardar' },
)
const emit = defineEmits<{ submit: [values: Record<string, unknown>]; cancel: [] }>()

// Los campos de lista se editan como texto separado por comas
const toText = (f: Field, v: unknown) =>
  f.type === 'list' ? (Array.isArray(v) ? v.join(', ') : '') : f.type === 'bool' ? Boolean(v) : (v ?? '')
const draft = reactive<Record<string, unknown>>(Object.fromEntries(props.fields.map((f) => [f.key, toText(f, props.initial[f.key])])))
const errors = ref<Record<string, string>>({})

function parse(f: Field, raw: unknown): unknown {
  if (f.type === 'bool') return Boolean(raw)
  if (f.type === 'list') return String(raw ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (f.type === 'number' || f.type === 'rating' || f.type === 'average') return raw === '' || raw === null ? null : Number(raw)
  return String(raw ?? '').trim()
}

function submit() {
  const out: Record<string, unknown> = {}
  const errs: Record<string, string> = {}
  for (const f of props.fields) {
    const v = parse(f, draft[f.key])
    const empty = v === null || v === '' || (Array.isArray(v) && !v.length)
    if (f.required && empty) errs[f.key] = 'Obligatorio'
    else if (f.type === 'rating' && v !== null && (Number.isNaN(v) || (v as number) < 0.5 || (v as number) > 5 || ((v as number) * 2) % 1 !== 0))
      errs[f.key] = 'De 0.5 a 5, en pasos de 0.5'
    else if (f.type === 'average' && v !== null && (Number.isNaN(v) || (v as number) < 0 || (v as number) > 5))
      errs[f.key] = 'Entre 0 y 5'
    else if (f.type === 'number' && v !== null && Number.isNaN(v)) errs[f.key] = 'Debe ser un número'
    else if (v !== null) out[f.key] = v
  }
  errors.value = errs
  if (!Object.keys(errs).length) emit('submit', out)
}
</script>

<template>
  <form class="node-form" novalidate @submit.prevent="submit">
    <FieldGroup v-for="f in fields" :key="f.key" :label="f.label + (f.required ? ' *' : '')" :error="errors[f.key]">
      <template #default="{ id, describedBy, invalid }">
        <textarea v-if="f.type === 'textarea'" :id="id" v-model="draft[f.key] as string" :name="f.key" :aria-describedby="describedBy" :aria-invalid="invalid || undefined" />
        <label v-else-if="f.type === 'bool'" class="check">
          <input :id="id" v-model="draft[f.key] as boolean" type="checkbox" :name="f.key" />
          Sí
        </label>
        <input
          v-else
          :id="id"
          v-model="draft[f.key] as string"
          :name="f.key"
          :type="f.type === 'date' ? 'date' : ['number', 'rating', 'average'].includes(f.type) ? 'number' : 'text'"
          :step="f.type === 'rating' ? 0.5 : f.type === 'number' || f.type === 'average' ? 'any' : undefined"
          :min="f.type === 'rating' ? 0.5 : f.type === 'average' ? 0 : undefined"
          :max="f.type === 'rating' || f.type === 'average' ? 5 : undefined"
          :placeholder="f.type === 'list' ? 'Separados por comas' : undefined"
          :aria-describedby="describedBy"
          :aria-invalid="invalid || undefined"
        />
      </template>
    </FieldGroup>
    <div class="form-actions">
      <Button @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" variant="primary" :loading="busy">{{ submitLabel }}</Button>
    </div>
  </form>
</template>

<style scoped>
.node-form {
  display: grid;
  gap: 14px;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ink-dim);
}

.check input {
  width: auto !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}
</style>
