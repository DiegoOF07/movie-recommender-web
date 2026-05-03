<template>
  <div class="friends-panel card">
    <div class="panel-head">
      <h2 class="section-title" style="font-size:20px">AMIGOS</h2>
      <button class="btn btn-primary btn-sm" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : '+ Seguir usuario' }}
      </button>
    </div>

    <!-- Add follows form -->
    <Transition name="fade">
      <div v-if="showForm" class="add-form">
        <div class="form-group">
          <label>Username a seguir</label>
          <input v-model="targetUsername" placeholder="Ej: john_doe" @keyup.enter="submit" />
          <p v-if="targetUsername === auth.username && targetUsername !== ''" class="field-error">No puedes seguirte a ti mismo.</p>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:14px;cursor:pointer">
            <input type="checkbox" v-model="isFavorite" style="width:auto" />
            Marcar como favorito
          </label>
        </div>
        <p v-if="formError" class="error-msg">{{ formError }}</p>
        <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
        <button
          class="btn btn-primary"
          style="width:100%;justify-content:center;margin-top:4px"
          :disabled="formLoading || !canSubmit"
          @click="submit"
        >
          <span v-if="formLoading" class="spinner" style="width:14px;height:14px;margin:0" />
          <span v-else>Seguir</span>
        </button>
      </div>
    </Transition>

    <hr class="divider" style="margin:16px 0" />

    <!-- Followed users list -->
    <div v-if="loadingList" class="loading-row"><div class="spinner" /></div>
    <div v-else-if="!followedUsers.length" class="empty-state" style="padding:24px 0;font-size:13px">
      Aun no sigues a nadie.
    </div>
    <ul v-else class="follows-list">
      <li v-for="u in followedUsers" :key="u.username" class="follow-item">
        <div class="follow-avatar">{{ u.username[0].toUpperCase() }}</div>
        <div class="follow-info">
          <span class="follow-username">{{ u.username }}</span>
          <span v-if="u.isFavorite" class="fav-badge">&#9733; Favorito</span>
        </div>
        <span class="follow-date">{{ u.since }}</span>
      </li>
    </ul>

    <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px;justify-content:center" @click="loadFollows">
      Recargar
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { auth } from '@/stores/auth'
import { userApi } from '@/services/api'

interface FollowedUser {
  username: string
  isFavorite: boolean
  since: string
}

const showForm = ref(false)
const targetUsername = ref('')
const isFavorite = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')

const followedUsers = ref<FollowedUser[]>([])
const loadingList = ref(false)

const canSubmit = computed(() =>
  targetUsername.value.trim() !== '' && targetUsername.value.trim() !== auth.username
)

async function submit() {
  if (!canSubmit.value) return
  formLoading.value = true; formError.value = ''; formSuccess.value = ''
  try {
    const today = new Date().toISOString().slice(0, 10)
    await userApi.createFollows({
      fromUsername: auth.username,
      toUsername: targetUsername.value.trim(),
      date: today,
      isMutual: false,
      isFavorite: isFavorite.value,
    })
    formSuccess.value = `Ahora sigues a ${targetUsername.value.trim()}.`
    followedUsers.value.push({
      username: targetUsername.value.trim(),
      isFavorite: isFavorite.value,
      since: today,
    })
    targetUsername.value = ''
    isFavorite.value = false
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Error al seguir usuario'
  } finally { formLoading.value = false }
}

async function loadFollows() {
  loadingList.value = true
  try {
    followedUsers.value = []
  } finally { loadingList.value = false }
}

onMounted(loadFollows)
</script>

<style scoped>
.friends-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 4px;
}

.field-error {
  font-size: 12px;
  color: var(--red);
  margin-top: 4px;
}

.loading-row { display: flex; justify-content: center; padding: 24px; }

.follows-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.follow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.follow-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid rgba(232,184,75,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; color: var(--accent);
  flex-shrink: 0;
}

.follow-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.follow-username {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fav-badge {
  font-size: 11px;
  color: var(--accent);
}

.follow-date {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>