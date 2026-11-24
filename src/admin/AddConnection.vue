<script setup lang="ts">
import { computed, ref } from 'vue'
import Combobox from '@/ui/Combobox.vue'
import NodeForm from './NodeForm.vue'
import { NODE_TYPES, REL_TYPES, defaultValues, relGroupLabel } from './schema'
import { graphApi } from '@/services/api'
import { useToast } from '@/ui/toast'
import type { NodeRef } from '@/types'

const props = defineProps<{ type: string; direction: 'out' | 'in'; self: NodeRef }>()
const emit = defineEmits<{ done: []; cancel: [] }>()

const rel = computed(() => REL_TYPES[props.type])
const otherLabel = computed(() => (props.direction === 'out' ? rel.value.to : rel.value.from))
const other = ref<NodeRef | null>(null)
const error = ref('')
const busy = ref(false)
const toast = useToast()

const search = async (q: string) =>
  (await graphApi.search(q, [otherLabel.value], 8)).filter((r) => !(r.label === props.self.label && r.key === props.self.key))

// En el grupo "in" el nodo actual es el destino de la relación
async function save(values: Record<string, unknown>) {
  if (!other.value) {
    error.value = `Elige ${NODE_TYPES[otherLabel.value].label.toLowerCase()}`
    return
  }
  const [from, to] = props.direction === 'out' ? [props.self.key, other.value.key] : [other.value.key, props.self.key]
  busy.value = true
  try {
    await rel.value.create(from, to, values)
    toast.show(`Conexión agregada: ${other.value.key}`)
    emit('done')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'No se pudo agregar', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="add">
    <p class="mono-label">▸ Agregar a {{ relGroupLabel(type, direction).toLowerCase() }}</p>
    <label class="add-label" :for="`add-${type}-${direction}`">{{ NODE_TYPES[otherLabel].label }}</label>
    <Combobox v-model="other" :input-id="`add-${type}-${direction}`" :search="search" :placeholder="`Buscar ${NODE_TYPES[otherLabel].label.toLowerCase()}…`" />
    <p v-if="error" class="add-error">{{ error }}</p>
    <NodeForm :fields="rel.fields" :initial="defaultValues(rel.fields)" submit-label="Agregar" :busy="busy" @submit="save" @cancel="emit('cancel')" />
  </div>
</template>

<style scoped>
.add {
  display: grid;
  gap: 10px;
  margin: 8px 0 4px;
  padding: 14px;
  border-radius: var(--r);
  border: 1px solid var(--line);
  background: var(--bg);
}

.add-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

.add-error {
  font-size: 12px;
  color: var(--danger);
}
</style>
