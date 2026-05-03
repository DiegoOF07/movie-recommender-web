<template>
  <nav class="admin-nav">
    <div class="nav-brand">
      <span style="color:var(--blue)">&#9881;</span>
      <span class="nav-title">ADMIN</span>
    </div>
    <div class="nav-links">
      <button
        v-for="s in sections"
        :key="s.key"
        class="nav-link"
        :class="{ active: active === s.key }"
        @click="$emit('change', s.key)"
      >
        {{ s.label }}
      </button>
    </div>
    <div class="nav-right">
      <RouterLink to="/dashboard" class="btn btn-ghost btn-sm">Dashboard</RouterLink>
      <button class="btn btn-danger btn-sm" @click="doLogout">Cerrar admin</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

defineProps<{ active: string }>()
defineEmits<{ (e: 'change', s: string): void }>()

const sections = [
  { key: 'movies',        label: 'Peliculas' },
  { key: 'users',         label: 'Usuarios' },
  { key: 'genres',        label: 'Generos' },
  { key: 'actors',        label: 'Actores' },
  { key: 'directors',     label: 'Directores' },
  { key: 'relationships', label: 'Relaciones' },
]

const router = useRouter()

function doLogout() {
  auth.logoutAdmin()
  router.push('/login')
}
</script>

<style scoped>
.admin-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 20px;
  padding: 0 24px;
  height: 56px;
  background: rgba(8,10,14,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
.nav-brand { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nav-title { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.1em; color: var(--blue); }
.nav-links { display: flex; gap: 2px; }
.nav-link {
  padding: 6px 14px; font-size: 13px; font-weight: 500;
  background: none; border: none; color: var(--text-secondary);
  border-radius: var(--radius-sm); cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.nav-link.active { background: var(--bg-elevated); color: var(--accent); }
.nav-link:hover:not(.active) { color: var(--text-primary); background: rgba(255,255,255,0.04); }
.nav-right { display: flex; gap: 8px; margin-left: auto; flex-shrink: 0; }
</style>
