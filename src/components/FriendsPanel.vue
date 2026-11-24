<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { auth } from '@/stores/auth'
import { graphApi, userApi } from '@/services/api'
import { useToast } from '@/ui/toast'
import Button from '@/ui/Button.vue'
import Combobox from '@/ui/Combobox.vue'
import type { NodeRef } from '@/types'

interface Followed {
  username: string
  isFavorite: boolean
  since: string
}

const toast = useToast()
const follows = ref<Followed[]>([])
const loading = ref(false)
const adding = ref(false)
const showForm = ref(false)
const target = ref<NodeRef | null>(null)
const favorite = ref(false)

const searchUsers = async (q: string) => (await graphApi.search(q, ['User'], 8)).filter((r) => r.key !== auth.username)
const canSubmit = computed(() => !!target.value && !follows.value.some((f) => f.username === target.value?.key))

async function load() {
  if (!auth.username) return
  loading.value = true
  try {
    const data = await userApi.getFollows(auth.username)
    follows.value = data.map((d) => ({
      username: String(d.username ?? ''),
      isFavorite: Boolean(d.isFavorite),
      since: typeof d.since === 'string' ? d.since.slice(0, 10) : '',
    }))
  } catch {
    follows.value = []
  } finally {
    loading.value = false
  }
}

async function follow() {
  if (!target.value || !canSubmit.value) return
  adding.value = true
  try {
    await userApi.createFollows({
      fromUsername: auth.username,
      toUsername: target.value.key,
      date: new Date().toISOString().slice(0, 10),
      isMutual: false,
      isFavorite: favorite.value,
    })
    toast.show(`Ahora sigues a ${target.value.key}`)
    target.value = null
    favorite.value = false
    showForm.value = false
    await load()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'No se pudo seguir', 'error')
  } finally {
    adding.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="friends" aria-labelledby="friends-title">
    <header class="head">
      <div>
        <p class="mono-label">▸ Tu red</p>
        <h2 id="friends-title" class="title">A QUIÉN SIGUES</h2>
      </div>
      <Button size="sm" :aria-expanded="showForm" @click="showForm = !showForm">{{ showForm ? 'Cerrar' : '+ Seguir' }}</Button>
    </header>

    <form v-if="showForm" class="add" @submit.prevent="follow">
      <label class="visually-hidden" for="follow-search">Buscar usuario</label>
      <Combobox v-model="target" input-id="follow-search" :search="searchUsers" placeholder="Buscar usuario…" />
      <label class="fav">
        <input v-model="favorite" type="checkbox" />
        Marcar como favorito
      </label>
      <Button type="submit" variant="primary" size="sm" :disabled="!canSubmit" :loading="adding">Seguir</Button>
    </form>

    <p v-if="loading" class="note">Cargando…</p>
    <p v-else-if="!follows.length" class="note">Todavía no sigues a nadie.</p>
    <ul v-else class="list">
      <li v-for="f in follows" :key="f.username" class="item">
        <span class="avatar" aria-hidden="true">{{ f.username[0]?.toUpperCase() }}</span>
        <span class="who">
          <span class="name">{{ f.username }}</span>
          <span v-if="f.isFavorite" class="fav-badge">★ favorito</span>
        </span>
        <span v-if="f.since" class="since">{{ f.since }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.friends {
  padding: 18px;
  border-radius: var(--r);
  border: 1px solid var(--line);
  background: var(--surface);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.title {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 0.02em;
  margin-top: 2px;
}

.add {
  display: grid;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.fav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-dim);
}

.note {
  padding: 18px 0 4px;
  color: var(--ink-mute);
  font-size: 13px;
}

.list {
  list-style: none;
  display: grid;
  gap: 2px;
  margin-top: 10px;
  max-height: 520px;
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: var(--r-sm);
}

.item:hover {
  background: var(--surface-2);
}

.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--node-user-bg);
  color: var(--node-user);
  font-family: var(--font-mono);
  font-size: 13px;
}

.who {
  display: grid;
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fav-badge {
  font-size: 11px;
  color: var(--amber);
}

.since {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
}
</style>
