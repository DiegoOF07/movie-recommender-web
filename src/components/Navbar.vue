<template>
  <nav class="navbar">
    <div class="nav-brand">
      <span class="nav-icon">&#9654;</span>
      <span class="nav-title">CINEGRAFO</span>
    </div>
    <div class="nav-right">
      <span class="nav-user">{{ auth.username }}</span>
      <RouterLink v-if="auth.isAdmin" to="/admin" class="btn btn-ghost btn-sm">Admin</RouterLink>
      <button class="btn btn-ghost btn-sm" @click="logout">Salir</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px;
  height: 56px;
  background: rgba(8,10,14,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-brand { display: flex; align-items: center; gap: 8px; }
.nav-icon { color: var(--accent); font-size: 16px; }
.nav-title { font-family: var(--font-display); font-size: 22px; letter-spacing: 0.12em; color: var(--text-primary); }
.nav-right { display: flex; align-items: center; gap: 10px; }
.nav-user { font-size: 13px; color: var(--text-secondary); }
</style>
