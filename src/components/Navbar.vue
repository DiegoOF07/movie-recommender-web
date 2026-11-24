<script setup lang="ts">
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import Button from '@/ui/Button.vue'

const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <RouterLink to="/dashboard" class="brand">CINEGRAFO</RouterLink>
    <nav class="nav-right" aria-label="Cuenta">
      <span class="user mono-label">▸ {{ auth.username }}</span>
      <Button v-if="auth.isAdmin" to="/admin" size="sm">Administración</Button>
      <Button size="sm" @click="logout">Salir</Button>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 56px;
  padding: 0 28px;
  background: rgba(18, 13, 12, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.brand {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--safelight);
  text-decoration: none;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user {
  color: var(--ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 599px) {
  .navbar {
    padding: 0 16px;
  }

  .user {
    display: none;
  }
}
</style>
