<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="section-title">GENEROS</h2>
        <p class="section-subtitle">{{ genres.length }} registros</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" @click="showCreate = true">+ Nuevo genero</button>
        <button class="btn btn-ghost btn-sm" @click="load">Recargar</button>
      </div>
    </div>

    <div v-if="loading" class="loading-row">
      <div class="spinner" />
    </div>
    <div v-else-if="!genres.length" class="empty-state">Sin generos.</div>
    <div v-else class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Clasificacion</th>
            <th>Popularidad</th>
            <th>Subgeneros</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in genres" :key="g.name">
            <td style="color:var(--text-primary);font-weight:500">{{ g.name }}</td>
            <td>{{ g.classification }}</td>
            <td>{{ g.popularityScore }}</td>
            <td>
              <div style="display:flex;flex-wrap:wrap;gap:4px">
                <span v-for="s in g.subgenres?.slice(0, 3)" :key="s" class="tag">{{ s }}</span>
              </div>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" @click="openUpdate(g.name)">Editar props</button>
                <button class="btn btn-danger btn-sm" @click="deleteTarget = g.name">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="danger-zone card" style="margin-top:24px;padding:20px">
      <h3
        style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em;color:var(--red);margin-bottom:14px">
        ELIMINAR MULTIPLES GENEROS</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Debes especificar al menos un filtro.</p>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group">
          <label>Clasificacion</label>
          <input v-model="dmClassification" placeholder="Ej: Adult" />
        </div>
        <div class="form-group">
          <label>Popularidad maxima</label>
          <input v-model="dmMaxPop" type="number" step="0.1" placeholder="Ej: 5.0" />
        </div>
      </div>
      <button class="btn btn-danger" :disabled="!canDeleteMany" @click="showDeleteMany = true">
        Eliminar generos filtrados
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVO GENERO</span>
          <button class="modal-close" @click="showCreate = false">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group"><label>Nombre *</label><input v-model="form.name" /></div>
          <div class="form-group"><label>Descripcion</label><textarea v-model="form.description" rows="2" /></div>
          <div class="form-row">
            <div class="form-group"><label>Clasificacion</label><input v-model="form.classification" /></div>
            <div class="form-group"><label>Popularidad</label><input v-model.number="form.popularityScore" type="number"
                step="0.1" /></div>
          </div>
          <div class="form-group"><label>Subgeneros (separados por coma)</label><input v-model="form.subgenresStr" />
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
            <button class="btn btn-ghost" @click="showCreate = false">Cancelar</button>
            <button class="btn btn-primary" :disabled="formLoading" @click="create">
              <span v-if="formLoading" class="spinner" style="width:14px;height:14px;margin:0" />
              <span v-else>Crear</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Props Modal -->
    <div v-if="updateTarget" class="modal-overlay" @click.self="updateTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">GESTIONAR PROPS</span>
          <button class="modal-close" @click="updateTarget = null">&times;</button>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
          Genero: <strong>{{ updateTarget }}</strong>
        </p>

        <h4 style="font-size:13px;font-weight:600;letter-spacing:0.05em;margin-bottom:12px">ACTUALIZAR PROPIEDAD</h4>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Propiedad</label>
            <select v-model="upKey">
              <option value="">-- Selecciona --</option>
              <option v-for="p in genreProps" :key="p.key" :value="p.key">{{ p.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Valor</label>
            <input v-if="currentPropType !== 'boolean'" v-model="upValue"
              :type="currentPropType === 'number' ? 'number' : 'text'"
              :step="currentPropType === 'number' ? '0.1' : undefined" />
            <select v-else v-model="upValue">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <p v-if="upSuccess" class="success-msg">{{ upSuccess }}</p>
          <p v-if="upError" class="error-msg">{{ upError }}</p>
          <button class="btn btn-primary" style="align-self:flex-end" @click="updateProps">Guardar</button>
        </div>

        <hr style="border:none;border-top:1px solid var(--border);margin:20px 0" />

        <h4 style="font-size:13px;font-weight:600;letter-spacing:0.05em;margin-bottom:12px">ELIMINAR PROPIEDADES</h4>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Propiedades a eliminar (separadas por coma)</label>
            <input v-model="dpPropsStr" placeholder="Ej: synopsis, backdropUrl" />
          </div>
          <p v-if="dpSuccess" class="success-msg">{{ dpSuccess }}</p>
          <p v-if="dpError" class="error-msg">{{ dpError }}</p>
          <button class="btn btn-danger" style="align-self:flex-end" @click="deleteProps">Eliminar props</button>
        </div>
      </div>
    </div>

    <ConfirmDialog :show="!!deleteTarget" title="Eliminar genero"
      :message="`Seguro que deseas eliminar el genero '${deleteTarget}'?`" confirm-label="Eliminar" @confirm="doDelete"
      @cancel="deleteTarget = ''" />
    <ConfirmDialog :show="showDeleteMany" title="Eliminar multiples generos"
      message="Se eliminaran todos los generos que coincidan con los filtros. Esta accion es irreversible."
      confirm-label="Eliminar" @confirm="doDeleteMany" @cancel="showDeleteMany = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { genreApi } from '@/services/api'
import type { Genre } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const genreProps = [
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'description', label: 'Descripcion', type: 'text' },
  { key: 'classification', label: 'Clasificacion', type: 'text' },
  { key: 'popularityScore', label: 'Popularidad', type: 'number' },
]

const genres = ref<Genre[]>([])
const loading = ref(false)

const emptyForm = () => ({ name: '', description: '', classification: '', popularityScore: 0, subgenresStr: '' })
const showCreate = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')
const form = ref(emptyForm())

const updateTarget = ref<string | null>(null)
const upKey = ref('')
const upValue = ref('')
const upError = ref('')
const upSuccess = ref('')

const currentPropType = computed(() => genreProps.find(p => p.key === upKey.value)?.type ?? 'text')

const deleteTarget = ref('')
const showDeleteMany = ref(false)
const dmClassification = ref('')
const dmMaxPop = ref('')

const dpPropsStr = ref('')
const dpError = ref('')
const dpSuccess = ref('')

async function deleteProps() {
  const props = dpPropsStr.value.split(',').map(s => s.trim()).filter(Boolean)
  if (!props.length) { dpError.value = 'Ingresa al menos una propiedad'; return }
  dpError.value = ''; dpSuccess.value = ''
  try {
    await genreApi.deleteProps(updateTarget.value!, props)
    dpSuccess.value = 'Propiedades eliminadas.'
    dpPropsStr.value = ''
    load()
  } catch (e: unknown) { dpError.value = e instanceof Error ? e.message : 'Error' }
}

const canDeleteMany = computed(() => dmClassification.value.trim() !== '' || dmMaxPop.value !== '')

async function load() {
  loading.value = true
  try { genres.value = await genreApi.getAll() }
  finally { loading.value = false }
}

async function create() {
  if (!form.value.name.trim()) { formError.value = 'El nombre es obligatorio'; return }
  formLoading.value = true; formError.value = ''; formSuccess.value = ''
  try {
    await genreApi.create({
      ...form.value,
      subgenres: form.value.subgenresStr.split(',').map(s => s.trim()).filter(Boolean),
    })
    formSuccess.value = 'Genero creado exitosamente.'
    form.value = emptyForm()
    load()
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Error al crear'
  } finally { formLoading.value = false }
}

function openUpdate(name: string) {
  updateTarget.value = name; upKey.value = ''; upValue.value = ''; upError.value = ''; upSuccess.value = ''
}

async function updateProps() {
  if (!upKey.value) { upError.value = 'Selecciona una propiedad'; return }
  upError.value = ''; upSuccess.value = ''
  try {
    let val: unknown = upValue.value
    if (currentPropType.value === 'number' && upValue.value !== '') val = Number(upValue.value)
    await genreApi.updateProps({ filter: { name: updateTarget.value }, properties: { [upKey.value]: val } })
    upSuccess.value = 'Propiedad actualizada.'
    load()
  } catch (e: unknown) { upError.value = e instanceof Error ? e.message : 'Error' }
}

async function doDelete() {
  await genreApi.deleteOne(deleteTarget.value)
  deleteTarget.value = ''
  load()
}

async function doDeleteMany() {
  showDeleteMany.value = false
  const filters: Record<string, unknown> = {}
  if (dmClassification.value.trim()) filters.classification = dmClassification.value.trim()
  if (dmMaxPop.value !== '') filters.maxPopularity = Number(dmMaxPop.value)
  await genreApi.deleteMany(filters)
  dmClassification.value = ''; dmMaxPop.value = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.panel {
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.loading-row {
  display: flex;
  justify-content: center;
  padding: 48px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  padding: 12px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.danger-zone {
  border-color: rgba(224, 82, 82, 0.2);
}
</style>