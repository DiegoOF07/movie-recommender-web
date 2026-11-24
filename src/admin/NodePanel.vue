<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MiniGraph from '@/ui/MiniGraph.vue'
import ConfirmDialog from '@/ui/ConfirmDialog.vue'
import Button from '@/ui/Button.vue'
import ConnectionGroup from './ConnectionGroup.vue'
import AddConnection from './AddConnection.vue'
import NodeForm from './NodeForm.vue'
import { NODE_TYPES, REL_TYPES, defaultValues, relGroupLabel } from './schema'
import { graphApi } from '@/services/api'
import { useToast } from '@/ui/toast'
import type { Group, NodeLabel, NodeRef, Neighbor, Neighborhood } from '@/types'

const props = defineProps<{ label: NodeLabel; nodeKey: string | null }>()
const emit = defineEmits<{ open: [ref: NodeRef]; deleted: []; created: [ref: NodeRef] }>()

const toast = useToast()
const type = computed(() => NODE_TYPES[props.label])
const hood = ref<Neighborhood | null>(null)
const loading = ref(false)
const notFound = ref(false)
const editing = ref(false)
const saving = ref(false)
const adding = ref<string | null>(null)

// Una sola confirmación para quitar conexiones y borrar el nodo
const confirm = ref<{ title: string; message: string; label: string; run: () => Promise<void> } | null>(null)
const confirmBusy = ref(false)

const self = computed<NodeRef>(() => ({ label: props.label, key: props.nodeKey ?? '' }))

// Todas las relaciones posibles del tipo, también las que aún no tienen conexiones
const slots = computed(() => {
  const out: { type: string; direction: 'out' | 'in' }[] = []
  for (const [t, r] of Object.entries(REL_TYPES)) {
    if (r.from === props.label) out.push({ type: t, direction: 'out' })
    if (r.to === props.label) out.push({ type: t, direction: 'in' })
  }
  return out
})
const groupOf = (t: string, d: 'out' | 'in'): Group | undefined => hood.value?.groups.find((g) => g.type === t && g.direction === d)
const totalConnections = computed(() => hood.value?.groups.reduce((s, g) => s + g.total, 0) ?? 0)
const facts = computed(() =>
  type.value.columns
    .filter((c) => c.key !== type.value.key)
    .map((c) => ({ label: c.label, value: c.format ? c.format(hood.value?.node.props[c.key]) : String(hood.value?.node.props[c.key] ?? '—') })),
)
const editableFields = computed(() => type.value.fields.filter((f) => f.key !== type.value.key))

async function load() {
  if (!props.nodeKey) return
  loading.value = true
  notFound.value = false
  try {
    hood.value = await graphApi.neighbors(props.label, props.nodeKey, 12)
  } catch {
    hood.value = null
    notFound.value = true
  } finally {
    loading.value = false
  }
}

function askRemove(t: string, d: 'out' | 'in', n: Neighbor) {
  const [from, to] = d === 'out' ? [self.value, { label: n.label, key: n.key }] : [{ label: n.label, key: n.key }, self.value]
  confirm.value = {
    title: '¿Quitar esta conexión?',
    message: `${relGroupLabel(t, d)}: ${n.key}. Solo se borra la relación, no los nodos.`,
    label: 'Quitar',
    run: async () => {
      await graphApi.deleteRelationship(t, from as NodeRef, to as NodeRef)
      toast.show(`Conexión quitada: ${n.key}`)
      await load()
    },
  }
}

function askDelete() {
  confirm.value = {
    title: `¿Borrar ${type.value.label.toLowerCase()}?`,
    message: `Se borrará ${props.nodeKey} y sus ${totalConnections.value} conexiones. No se puede deshacer.`,
    label: 'Borrar',
    run: async () => {
      await graphApi.deleteNode(props.label, props.nodeKey!)
      toast.show(`${props.nodeKey} se borró`)
      emit('deleted')
    },
  }
}

async function runConfirm() {
  if (!confirm.value) return
  confirmBusy.value = true
  try {
    await confirm.value.run()
    confirm.value = null
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'No se pudo completar', 'error')
  } finally {
    confirmBusy.value = false
  }
}

async function saveProps(values: Record<string, unknown>) {
  saving.value = true
  try {
    await graphApi.patchNode(props.label, props.nodeKey!, values)
    toast.show('Cambios guardados')
    editing.value = false
    await load()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'No se pudo guardar', 'error')
  } finally {
    saving.value = false
  }
}

async function create(values: Record<string, unknown>) {
  saving.value = true
  try {
    await type.value.create({ ...defaultValues(type.value.fields), ...values })
    const key = String(values[type.value.key])
    toast.show(`${key} creado`)
    emit('created', { label: props.label, key })
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'No se pudo crear', 'error')
  } finally {
    saving.value = false
  }
}

async function added() {
  adding.value = null
  await load()
}

onMounted(load)
</script>

<template>
  <div class="node-panel">
    <template v-if="!nodeKey">
      <h2 class="node-title">NUEVO {{ type.label.toUpperCase() }}</h2>
      <NodeForm :fields="type.fields" :initial="defaultValues(type.fields)" submit-label="Crear" :busy="saving" @submit="create" @cancel="emit('deleted')" />
    </template>

    <p v-else-if="loading && !hood" class="note">Revelando…</p>
    <p v-else-if="notFound" class="note">Este nodo ya no existe.</p>

    <template v-else-if="hood">
      <h2 class="node-title">{{ nodeKey }}</h2>
      <dl class="facts">
        <div v-for="f in facts" :key="f.label">
          <dt>{{ f.label }}</dt>
          <dd>{{ f.value }}</dd>
        </div>
      </dl>

      <div class="graph">
        <MiniGraph :center="self" :groups="hood.groups" :size="240" :rel-label="relGroupLabel" @open="(r) => emit('open', r)" />
      </div>

      <section class="block" aria-labelledby="conn-title">
        <h3 id="conn-title" class="mono-label">▸ Conexiones · {{ totalConnections }}</h3>
        <div v-for="s in slots" :key="`${s.type}-${s.direction}`">
          <ConnectionGroup
            :type="s.type"
            :direction="s.direction"
            :group="groupOf(s.type, s.direction)"
            @remove="(n) => askRemove(s.type, s.direction, n)"
            @open="(n) => emit('open', { label: n.label, key: n.key })"
            @add="adding = `${s.type}-${s.direction}`"
          />
          <AddConnection
            v-if="adding === `${s.type}-${s.direction}`"
            :type="s.type"
            :direction="s.direction"
            :self="self"
            @done="added"
            @cancel="adding = null"
          />
        </div>
      </section>

      <section class="block" aria-labelledby="props-title">
        <header class="block-head">
          <h3 id="props-title" class="mono-label">▸ Propiedades</h3>
          <Button v-if="!editing" size="sm" data-test="edit-props" @click="editing = true">Editar</Button>
        </header>
        <NodeForm
          v-if="editing"
          data-test="save-props"
          :fields="editableFields"
          :initial="hood.node.props"
          :busy="saving"
          @submit="saveProps"
          @cancel="editing = false"
        />
        <dl v-else class="props">
          <div v-for="f in editableFields" :key="f.key">
            <dt>{{ f.label }}</dt>
            <dd>{{ Array.isArray(hood.node.props[f.key]) ? (hood.node.props[f.key] as unknown[]).join(', ') || '—' : hood.node.props[f.key] ?? '—' }}</dd>
          </div>
        </dl>
      </section>

      <div class="danger-zone">
        <Button variant="danger" size="sm" data-test="delete-node" @click="askDelete">Borrar {{ type.label.toLowerCase() }}</Button>
      </div>
    </template>

    <ConfirmDialog
      :open="!!confirm"
      :title="confirm?.title ?? ''"
      :message="confirm?.message ?? ''"
      :confirm-label="confirm?.label"
      danger
      :loading="confirmBusy"
      @confirm="runConfirm"
      @cancel="confirm = null"
    />
  </div>
</template>

<style scoped>
.node-panel {
  display: grid;
  gap: 14px;
}

.node-title {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.facts,
.props {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.props {
  grid-template-columns: 1fr;
  gap: 6px;
}

.props div {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  font-size: 13px;
}

dt {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

dd {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.props dd {
  color: var(--ink-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.graph {
  display: grid;
  place-items: center;
  padding: 6px;
  border-radius: var(--r);
  background: var(--bg);
  border: 1px solid #2e211d;
}

.block {
  padding-top: 6px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.danger-zone {
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.note {
  color: var(--ink-mute);
  font-size: 14px;
}
</style>
