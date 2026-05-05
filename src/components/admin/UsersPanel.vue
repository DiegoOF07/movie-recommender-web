<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="section-title">USUARIOS</h2>
        <p class="section-subtitle">{{ users.length }} registros</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" @click="showCreate = true">+ Nuevo usuario</button>
        <button class="btn btn-ghost btn-sm" @click="load">Recargar</button>
      </div>
    </div>

    <div class="filters card" style="padding:16px;margin-bottom:18px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="flex:1;min-width:160px">
          <label>Pais</label>
          <input v-model="fCountry" placeholder="Ej: Guatemala" />
        </div>
        <button class="btn btn-primary btn-sm" @click="load">Filtrar</button>
        <button class="btn btn-ghost btn-sm" @click="() => { fCountry = ''; load() }">Limpiar</button>
      </div>
    </div>

    <div v-if="loading" class="loading-row"><div class="spinner" /></div>
    <div v-else-if="!users.length" class="empty-state">Sin resultados.</div>
    <div v-else class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Username</th><th>Email</th><th>Edad</th><th>Pais</th><th>Fecha ingreso</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.username">
            <td style="color:var(--text-primary);font-weight:500">{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.age }}</td>
            <td>{{ u.country }}</td>
            <td>{{ u.joinDate?.slice(0,10) }}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" @click="openUpdate(u.username)">Editar props</button>
                <button class="btn btn-danger btn-sm" @click="deleteTarget = u.username">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:24px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em">USUARIOS POR PAIS</h3>
        <button class="btn btn-ghost btn-sm" @click="loadAgg">Cargar</button>
      </div>
      <div v-if="agg.length" style="display:flex;flex-wrap:wrap;gap:10px">
        <div v-for="a in agg" :key="a.country" class="agg-chip">
          <span class="agg-name">{{ a.country }}</span>
          <span class="agg-count">{{ a.count }}</span>
        </div>
      </div>
    </div>

    <div class="danger-zone card" style="margin-top:24px;padding:20px">
      <h3 style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em;color:var(--red);margin-bottom:14px">ELIMINAR MULTIPLES USUARIOS</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Debes especificar al menos un filtro.</p>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group">
          <label>Pais</label>
          <input v-model="dmCountry" placeholder="Ej: Mexico" />
        </div>
        <div class="form-group">
          <label>Edad maxima</label>
          <input v-model="dmMaxAge" type="number" placeholder="Ej: 20" />
        </div>
      </div>
      <button class="btn btn-danger" :disabled="!canDeleteMany" @click="showDeleteMany = true">
        Eliminar usuarios filtrados
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVO USUARIO</span>
          <button class="modal-close" @click="showCreate = false">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-row">
            <div class="form-group"><label>Username *</label><input v-model="form.username" /></div>
            <div class="form-group"><label>Email</label><input v-model="form.email" type="email" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Edad</label><input v-model.number="form.age" type="number" /></div>
            <div class="form-group"><label>Pais</label><input v-model="form.country" /></div>
          </div>
          <div class="form-group"><label>Fecha de ingreso</label><input v-model="form.joinDate" type="date" /></div>
          <div class="form-group"><label>Generos favoritos (separados por coma)</label><input v-model="form.genresStr" /></div>
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
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
          Usuario: <strong>{{ updateTarget }}</strong>
        </p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Propiedad</label>
            <select v-model="upKey">
              <option value="">-- Selecciona una propiedad --</option>
              <option v-for="p in userProps" :key="p.key" :value="p.key">{{ p.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Valor</label>
            <input v-model="upValue" :type="currentPropType === 'number' ? 'number' : 'text'" placeholder="Nuevo valor" />
          </div>
          <p v-if="upError" class="error-msg">{{ upError }}</p>
          <p v-if="upSuccess" class="success-msg">{{ upSuccess }}</p>
          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn btn-ghost" @click="updateTarget = null">Cancelar</button>
            <button class="btn btn-primary" @click="updateProps">Guardar</button>
          </div>
        </div>

        <hr style="border:none;border-top:1px solid var(--border);margin:20px 0" />

        <h4 style="font-size:12px;font-weight:600;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:12px">GENEROS FAVORITOS</h4>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="chips-wrap">
            <span v-for="(g, i) in fgChips" :key="g" class="chip">
              {{ g }}
              <button class="chip-remove" @click="fgRemove(i)">&times;</button>
            </span>
            <span v-if="!fgChips.length" style="font-size:12px;color:var(--text-muted)">Sin generos agregados.</span>
          </div>
          <div style="display:flex;gap:8px">
            <input v-model="fgInput" placeholder="Agregar genero..." style="flex:1" @keyup.enter="fgAdd" />
            <button class="btn btn-ghost btn-sm" @click="fgAdd">Agregar</button>
          </div>
          <p v-if="fgError" class="error-msg">{{ fgError }}</p>
          <p v-if="fgSuccess" class="success-msg">{{ fgSuccess }}</p>
          <button class="btn btn-primary" style="align-self:flex-end" @click="fgSave">Guardar generos</button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="!!deleteTarget"
      title="Eliminar usuario"
      :message="`Seguro que deseas eliminar al usuario '${deleteTarget}'?`"
      confirm-label="Eliminar"
      @confirm="doDelete"
      @cancel="deleteTarget = ''"
    />
    <ConfirmDialog
      :show="showDeleteMany"
      title="Eliminar multiples usuarios"
      message="Se eliminaran todos los usuarios que coincidan con los filtros. Esta accion es irreversible."
      confirm-label="Eliminar"
      @confirm="doDeleteMany"
      @cancel="showDeleteMany = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userApi } from '@/services/api'
import type { User } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const userProps = [
  { key: 'username', label: 'Username',          type: 'text' },
  { key: 'email',    label: 'Email',             type: 'text' },
  { key: 'age',      label: 'Edad',              type: 'number' },
  { key: 'country',  label: 'Pais',              type: 'text' },
  { key: 'joinDate', label: 'Fecha de ingreso',  type: 'text' },
]

const users = ref<User[]>([])
const loading = ref(false)
const agg = ref<{ country: string; count: number }[]>([])
const fCountry = ref('')

const emptyForm = () => ({ username: '', email: '', age: 0, country: '', joinDate: '', genresStr: '' })
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

const currentPropType = computed(() => userProps.find(p => p.key === upKey.value)?.type ?? 'text')

// favoriteGenres array editor
const fgChips = ref<string[]>([])
const fgInput = ref('')
const fgError = ref('')
const fgSuccess = ref('')

function fgAdd() {
  const v = fgInput.value.trim()
  if (!v) return
  if (!fgChips.value.includes(v)) fgChips.value.push(v)
  fgInput.value = ''
}
function fgRemove(i: number) { fgChips.value.splice(i, 1) }

async function fgSave() {
  fgError.value = ''; fgSuccess.value = ''
  try {
    await userApi.updateProps({ filter: { username: updateTarget.value }, properties: { favoriteGenres: fgChips.value } })
    fgSuccess.value = 'Generos favoritos actualizados.'
    load()
  } catch (e: unknown) { fgError.value = e instanceof Error ? e.message : 'Error' }
}

const deleteTarget = ref('')
const showDeleteMany = ref(false)
const dmCountry = ref('')
const dmMaxAge = ref('')

const canDeleteMany = computed(() => dmCountry.value.trim() !== '' || dmMaxAge.value !== '')

async function load() {
  loading.value = true
  try {
    users.value = await userApi.getAll({ country: fCountry.value || undefined })
  } finally { loading.value = false }
}

async function loadAgg() {
  agg.value = await userApi.aggregateByCountry()
}

async function create() {
  if (!form.value.username.trim()) { formError.value = 'El username es obligatorio'; return }
  formLoading.value = true; formError.value = ''; formSuccess.value = ''
  try {
    await userApi.create({
      ...form.value,
      favoriteGenres: form.value.genresStr.split(',').map(s => s.trim()).filter(Boolean),
    })
    formSuccess.value = 'Usuario creado exitosamente.'
    form.value = emptyForm()
    load()
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Error al crear'
  } finally { formLoading.value = false }
}

function openUpdate(username: string) {
  updateTarget.value = username; upKey.value = ''; upValue.value = ''; upError.value = ''; upSuccess.value = ''
  const user = users.value.find(u => u.username === username)
  fgChips.value = user?.favoriteGenres ? [...user.favoriteGenres] : []
  fgInput.value = ''; fgError.value = ''; fgSuccess.value = ''
}

async function updateProps() {
  if (!upKey.value) { upError.value = 'Selecciona una propiedad'; return }
  upError.value = ''; upSuccess.value = ''
  try {
    let val: unknown = upValue.value
    if (currentPropType.value === 'number' && upValue.value !== '') val = Number(upValue.value)
    await userApi.updateProps({ filter: { username: updateTarget.value }, properties: { [upKey.value]: val } })
    upSuccess.value = 'Propiedad actualizada.'
    load()
  } catch (e: unknown) { upError.value = e instanceof Error ? e.message : 'Error' }
}

async function doDelete() {
  await userApi.deleteOne(deleteTarget.value)
  deleteTarget.value = ''
  load()
}

async function doDeleteMany() {
  showDeleteMany.value = false
  const filters: Record<string, unknown> = {}
  if (dmCountry.value.trim()) filters.country = dmCountry.value.trim()
  if (dmMaxAge.value !== '') filters.maxAge = Number(dmMaxAge.value)
  await userApi.deleteMany(filters)
  dmCountry.value = ''; dmMaxAge.value = ''
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
.agg-chip { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 12px; }
.agg-name { font-size: 13px; color: var(--text-primary); }
.agg-count { font-size: 12px; font-weight: 600; color: var(--accent); }
.danger-zone { border-color: rgba(224,82,82,0.2); }
.chips-wrap { display: flex; flex-wrap: wrap; gap: 6px; min-height: 32px; }
.chip { display: inline-flex; align-items: center; gap: 5px; background: var(--accent-dim); border: 1px solid rgba(232,184,75,0.3); border-radius: 20px; padding: 3px 10px; font-size: 12px; color: var(--accent); }
.chip-remove { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 14px; line-height: 1; padding: 0; opacity: 0.7; }
.chip-remove:hover { opacity: 1; }
</style>