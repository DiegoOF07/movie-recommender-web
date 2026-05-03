<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="section-title">PELICULAS</h2>
        <p class="section-subtitle">{{ movies.length }} registros</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" @click="showCreate = true">+ Nueva pelicula</button>
        <button class="btn btn-ghost btn-sm" @click="load">Recargar</button>
      </div>
    </div>

    <div class="filters card" style="padding:16px;margin-bottom:18px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="flex:1;min-width:160px">
          <label>Clasificacion</label>
          <input v-model="fClassification" placeholder="Ej: PG-13" />
        </div>
        <div class="form-group" style="flex:1;min-width:140px">
          <label>Rating minimo</label>
          <input v-model="fMinRating" type="number" min="0" max="10" step="0.1" placeholder="0 - 10" />
        </div>
        <button class="btn btn-primary btn-sm" @click="load">Filtrar</button>
        <button class="btn btn-ghost btn-sm" @click="clearFilters">Limpiar</button>
      </div>
    </div>

    <div v-if="loading" class="loading-row">
      <div class="spinner" />
    </div>
    <div v-else-if="!movies.length" class="empty-state">Sin resultados.</div>
    <div v-else class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Fecha</th>
            <th>Duracion</th>
            <th>Rating</th>
            <th>Clasificacion</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movies" :key="m.title">
            <td class="title-cell">{{ m.title }}</td>
            <td>{{ m.releaseDate?.slice(0, 10) }}</td>
            <td>{{ m.durationMin }} min</td>
            <td><span class="rating-star">&#9733;</span> {{ m.avgRating?.toFixed(1) }}</td>
            <td><span class="tag">{{ m.classification }}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" @click="openUpdate(m)">Editar props</button>
                <button class="btn btn-danger btn-sm" @click="askDelete(m.title)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="agg-section card" style="margin-top:24px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em">PELICULAS POR GENERO</h3>
        <button class="btn btn-ghost btn-sm" @click="loadAgg">Cargar</button>
      </div>
      <div v-if="agg.length" style="display:flex;flex-wrap:wrap;gap:10px">
        <div v-for="a in agg" :key="a.genre" class="agg-chip">
          <span class="agg-name">{{ a.genre }}</span>
          <span class="agg-count">{{ a.count }}</span>
        </div>
      </div>
    </div>

    <div class="danger-zone card" style="margin-top:24px;padding:20px">
      <h3
        style="font-family:var(--font-display);font-size:18px;letter-spacing:0.05em;color:var(--red);margin-bottom:14px">
        ELIMINAR MULTIPLES PELICULAS</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Debes especificar al menos un filtro.</p>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group">
          <label>Clasificacion</label>
          <input v-model="dmClassification" placeholder="Ej: R" />
        </div>
        <div class="form-group">
          <label>Rating maximo</label>
          <input v-model="dmMaxRating" type="number" step="0.1" placeholder="Ej: 4.0" />
        </div>
      </div>
      <button class="btn btn-danger" :disabled="!canDeleteMany" @click="showDeleteMany = true">
        Eliminar peliculas filtradas
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">NUEVA PELICULA</span>
          <button class="modal-close" @click="showCreate = false">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-row">
            <div class="form-group"><label>Titulo *</label><input v-model="form.title" /></div>
            <div class="form-group"><label>Clasificacion</label><input v-model="form.classification" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Fecha de estreno</label><input v-model="form.releaseDate" type="date" />
            </div>
            <div class="form-group"><label>Duracion (min)</label><input v-model.number="form.durationMin"
                type="number" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Rating promedio</label><input v-model.number="form.avgRating" type="number"
                step="0.1" /></div>
          </div>
          <div class="form-group"><label>Sinopsis</label><textarea v-model="form.synopsis" rows="3" /></div>
          <div class="form-group"><label>URL del poster</label><input v-model="form.posterUrl" /></div>
          <div class="form-group"><label>URL del backdrop</label><input v-model="form.backdropUrl" /></div>
          <div class="form-group"><label>Idiomas (separados por coma)</label><input v-model="form.languagesStr" /></div>
          <div class="form-group"><label>Tags (separados por coma)</label><input v-model="form.tagsStr" /></div>
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
          Pelicula: <strong>{{ updateTarget }}</strong>
        </p>

        <h4 style="font-size:13px;font-weight:600;letter-spacing:0.05em;margin-bottom:12px">ACTUALIZAR PROPIEDAD</h4>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Propiedad</label>
            <select v-model="upKey">
              <option value="">-- Selecciona --</option>
              <option v-for="p in movieProps" :key="p.key" :value="p.key">{{ p.label }}</option>
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

    <ConfirmDialog :show="!!deleteTarget" title="Eliminar pelicula"
      :message="`Seguro que deseas eliminar '${deleteTarget}'? Esta accion es irreversible.`" confirm-label="Eliminar"
      @confirm="doDelete" @cancel="deleteTarget = ''" />
    <ConfirmDialog :show="showDeleteMany" title="Eliminar multiples peliculas"
      message="Se eliminaran todas las peliculas que coincidan con los filtros. Esta accion es irreversible."
      confirm-label="Eliminar" @confirm="doDeleteMany" @cancel="showDeleteMany = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { movieApi } from '@/services/api'
import type { Movie } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const movieProps = [
  { key: 'title', label: 'Titulo', type: 'text' },
  { key: 'releaseDate', label: 'Fecha de estreno', type: 'text' },
  { key: 'durationMin', label: 'Duracion (min)', type: 'number' },
  { key: 'avgRating', label: 'Rating promedio', type: 'number' },
  { key: 'classification', label: 'Clasificacion', type: 'text' },
  { key: 'synopsis', label: 'Sinopsis', type: 'text' },
  { key: 'posterUrl', label: 'URL del poster', type: 'text' },
  { key: 'backdropUrl', label: 'URL del backdrop', type: 'text' },
]

const movies = ref<Movie[]>([])
const loading = ref(false)
const agg = ref<{ genre: string; count: number }[]>([])
const fClassification = ref('')
const fMinRating = ref('')

const emptyForm = () => ({ title: '', classification: '', releaseDate: '', durationMin: 0, avgRating: 0, synopsis: '', posterUrl: '', backdropUrl: '', languagesStr: '', tagsStr: '' })
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

const currentPropType = computed(() => movieProps.find(p => p.key === upKey.value)?.type ?? 'text')

const deleteTarget = ref('')
const showDeleteMany = ref(false)
const dmClassification = ref('')
const dmMaxRating = ref('')

const dpPropsStr = ref('')
const dpError = ref('')
const dpSuccess = ref('')

async function deleteProps() {
  const props = dpPropsStr.value.split(',').map(s => s.trim()).filter(Boolean)
  if (!props.length) { dpError.value = 'Ingresa al menos una propiedad'; return }
  dpError.value = ''; dpSuccess.value = ''
  try {
    await movieApi.deleteProps(updateTarget.value!, props)
    dpSuccess.value = 'Propiedades eliminadas.'
    dpPropsStr.value = ''
    load()
  } catch (e: unknown) { dpError.value = e instanceof Error ? e.message : 'Error' }
}

const canDeleteMany = computed(() => dmClassification.value.trim() !== '' || dmMaxRating.value !== '')

async function load() {
  loading.value = true
  try {
    movies.value = await movieApi.getAll({
      classification: fClassification.value || undefined,
      minRating: fMinRating.value ? Number(fMinRating.value) : undefined,
    })
  } finally { loading.value = false }
}

function clearFilters() { fClassification.value = ''; fMinRating.value = ''; load() }

async function loadAgg() {
  agg.value = await movieApi.aggregateByGenre()
}

async function create() {
  if (!form.value.title.trim()) { formError.value = 'El titulo es obligatorio'; return }
  formLoading.value = true; formError.value = ''; formSuccess.value = ''
  try {
    await movieApi.create({
      ...form.value,
      languages: form.value.languagesStr.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.value.tagsStr.split(',').map(s => s.trim()).filter(Boolean),
    })
    formSuccess.value = 'Pelicula creada exitosamente.'
    form.value = emptyForm()
    load()
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Error al crear'
  } finally { formLoading.value = false }
}

function openUpdate(m: Movie) {
  updateTarget.value = m.title; upKey.value = ''; upValue.value = ''; upError.value = ''; upSuccess.value = ''
}

async function updateProps() {
  if (!upKey.value) { upError.value = 'Selecciona una propiedad'; return }
  upError.value = ''; upSuccess.value = ''
  try {
    let val: unknown = upValue.value
    if (upValue.value === 'true') val = true
    else if (upValue.value === 'false') val = false
    else if (currentPropType.value === 'number' && upValue.value !== '') val = Number(upValue.value)
    await movieApi.updateProps({ filter: { title: updateTarget.value }, properties: { [upKey.value]: val } })
    upSuccess.value = 'Propiedad actualizada.'
    load()
  } catch (e: unknown) { upError.value = e instanceof Error ? e.message : 'Error' }
}

function askDelete(title: string) { deleteTarget.value = title }

async function doDelete() {
  await movieApi.deleteOne(deleteTarget.value)
  deleteTarget.value = ''
  load()
}

async function doDeleteMany() {
  showDeleteMany.value = false
  const filters: Record<string, unknown> = {}
  if (dmClassification.value.trim()) filters.classification = dmClassification.value.trim()
  if (dmMaxRating.value !== '') filters.maxRating = Number(dmMaxRating.value)
  await movieApi.deleteMany(filters)
  dmClassification.value = ''; dmMaxRating.value = ''
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

.title-cell {
  color: var(--text-primary);
  font-weight: 500;
  max-width: 220px;
}

.agg-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
}

.agg-name {
  font-size: 13px;
  color: var(--text-primary);
}

.agg-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.danger-zone {
  border-color: rgba(224, 82, 82, 0.2);
}
</style>