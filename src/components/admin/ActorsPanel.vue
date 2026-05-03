<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="section-title">ACTORES</h2>
        <p class="section-subtitle">{{ actors.length }} registros</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" @click="showCreate = true">+ Nuevo actor</button>
        <button class="btn btn-ghost btn-sm" @click="load">Recargar</button>
      </div>
    </div>

    <div class="filters card" style="padding:16px;margin-bottom:18px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="flex:1;min-width:160px">
          <label>Nacionalidad</label>
          <input v-model="fNationality" placeholder="Ej: American" />
        </div>
        <div class="form-group" style="min-width:140px">
          <label>Estado</label>
          <select v-model="fIsActive">
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <button class="btn btn-primary btn-sm" @click="load">Filtrar</button>
        <button class="btn btn-ghost btn-sm" @click="clearFilters">Limpiar</button>
      </div>
    </div>

    <div v-if="loading" class="loading-row"><div class="spinner" /></div>
    <div v-else-if="!actors.length" class="empty-state">Sin resultados.</div>
    <div v-else class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Nacionalidad</th><th>Nacimiento</th><th>Premios</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in actors" :key="a.name">
            <td style="color:var(--text-primary);font-weight:500">{{ a.name }}</td>
            <td>{{ a.nationality }}</td>
            <td>{{ a.birthDate?.slice(0,10) }}</td>
            <td>{{ a.awardsWon }}</td>
            <td>
              <span :class="a.isActive ? 'badge-active' : 'badge-inactive'">
                {{ a.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" @click="openUpdate(a.name)">Editar props</button>
                <button class="btn btn-danger btn-sm" @click="deleteTarget = a.name">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="danger-zone card" style="margin-top:24px;padding:20px">
      <h3 style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em;color:var(--red);margin-bottom:14px">ELIMINAR MULTIPLES ACTORES</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Debes especificar al menos un filtro.</p>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group">
          <label>Nacionalidad</label>
          <input v-model="dmNationality" placeholder="Ej: British" />
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select v-model="dmIsActive">
            <option value="">No filtrar</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>
      <button class="btn btn-danger" :disabled="!canDeleteMany" @click="showDeleteMany = true">
        Eliminar actores filtrados
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVO ACTOR</span>
          <button class="modal-close" @click="showCreate = false">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group"><label>Nombre *</label><input v-model="form.name" /></div>
          <div class="form-row">
            <div class="form-group"><label>Fecha de nacimiento</label><input v-model="form.birthDate" type="date" /></div>
            <div class="form-group"><label>Nacionalidad</label><input v-model="form.nationality" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Premios ganados</label><input v-model.number="form.awardsWon" type="number" /></div>
            <div class="form-group" style="justify-content:flex-end;padding-top:20px">
              <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:14px;cursor:pointer">
                <input type="checkbox" v-model="form.isActive" style="width:auto" /> Activo
              </label>
            </div>
          </div>
          <div class="form-group"><label>URL de perfil</label><input v-model="form.profileUrl" /></div>
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
          <span class="modal-title">EDITAR PROPS</span>
          <button class="modal-close" @click="updateTarget = null">&times;</button>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Actor: <strong>{{ updateTarget }}</strong></p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Propiedad</label>
            <select v-model="upKey">
              <option value="">-- Selecciona una propiedad --</option>
              <option v-for="p in actorProps" :key="p.key" :value="p.key">{{ p.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Valor</label>
            <input v-if="currentPropType !== 'boolean'" v-model="upValue" :type="currentPropType === 'number' ? 'number' : 'text'" placeholder="Nuevo valor" />
            <select v-else v-model="upValue">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <p v-if="upError" class="error-msg">{{ upError }}</p>
          <p v-if="upSuccess" class="success-msg">{{ upSuccess }}</p>
          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn btn-ghost" @click="updateTarget = null">Cancelar</button>
            <button class="btn btn-primary" @click="updateProps">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="!!deleteTarget"
      title="Eliminar actor"
      :message="`Seguro que deseas eliminar al actor '${deleteTarget}'?`"
      confirm-label="Eliminar"
      @confirm="doDelete"
      @cancel="deleteTarget = ''"
    />
    <ConfirmDialog
      :show="showDeleteMany"
      title="Eliminar multiples actores"
      message="Se eliminaran todos los actores que coincidan con los filtros. Esta accion es irreversible."
      confirm-label="Eliminar"
      @confirm="doDeleteMany"
      @cancel="showDeleteMany = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actorApi } from '@/services/api'
import type { Actor } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const actorProps = [
  { key: 'name',        label: 'Nombre',          type: 'text' },
  { key: 'birthDate',   label: 'Fecha nacimiento', type: 'text' },
  { key: 'nationality', label: 'Nacionalidad',     type: 'text' },
  { key: 'isActive',    label: 'Activo',           type: 'boolean' },
  { key: 'awardsWon',   label: 'Premios ganados',  type: 'number' },
  { key: 'profileUrl',  label: 'URL de perfil',    type: 'text' },
]

const actors = ref<Actor[]>([])
const loading = ref(false)
const fNationality = ref('')
const fIsActive = ref('')

const emptyForm = () => ({ name: '', birthDate: '', nationality: '', isActive: true, awardsWon: 0, profileUrl: '' })
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

const currentPropType = computed(() => actorProps.find(p => p.key === upKey.value)?.type ?? 'text')

const deleteTarget = ref('')
const showDeleteMany = ref(false)
const dmNationality = ref('')
const dmIsActive = ref('')

const canDeleteMany = computed(() => dmNationality.value.trim() !== '' || dmIsActive.value !== '')

async function load() {
  loading.value = true
  try {
    actors.value = await actorApi.getAll({
      nationality: fNationality.value || undefined,
      isActive: fIsActive.value !== '' ? fIsActive.value === 'true' : undefined,
    })
  } finally { loading.value = false }
}

function clearFilters() { fNationality.value = ''; fIsActive.value = ''; load() }

async function create() {
  if (!form.value.name.trim()) { formError.value = 'El nombre es obligatorio'; return }
  formLoading.value = true; formError.value = ''; formSuccess.value = ''
  try {
    await actorApi.create({ ...form.value })
    formSuccess.value = 'Actor creado exitosamente.'
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
    if (upValue.value === 'true') val = true
    else if (upValue.value === 'false') val = false
    else if (currentPropType.value === 'number' && upValue.value !== '') val = Number(upValue.value)
    await actorApi.updateProps({ filter: { name: updateTarget.value }, properties: { [upKey.value]: val } })
    upSuccess.value = 'Propiedad actualizada.'
    load()
  } catch (e: unknown) { upError.value = e instanceof Error ? e.message : 'Error' }
}

async function doDelete() {
  await actorApi.deleteOne(deleteTarget.value)
  deleteTarget.value = ''
  load()
}

async function doDeleteMany() {
  showDeleteMany.value = false
  const filters: Record<string, unknown> = {}
  if (dmNationality.value.trim()) filters.nationality = dmNationality.value.trim()
  if (dmIsActive.value !== '') filters.isActive = dmIsActive.value === 'true'
  await actorApi.deleteMany(filters)
  dmNationality.value = ''; dmIsActive.value = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.panel { padding: 28px; max-width: 1200px; margin: 0 auto; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.loading-row { display: flex; justify-content: center; padding: 48px; }
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.badge-active { color: var(--green); font-size: 12px; font-weight: 600; }
.badge-inactive { color: var(--text-muted); font-size: 12px; }
.danger-zone { border-color: rgba(224,82,82,0.2); }
</style>