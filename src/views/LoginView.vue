<template>
  <div class="login-page">
    <div class="bg-noise" />
    <div class="login-box card">
      <div class="brand">
        <span class="brand-icon">&#9654;</span>
        <h1 class="brand-name">CINEGRAFO</h1>
      </div>
      <p class="brand-tagline">Tu motor de recomendacion cinematografica</p>

      <hr class="divider" />

      <form @submit.prevent="submit">
        <div class="form-group">
          <label for="username">Nombre de usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Ingresa tu username"
            autocomplete="username"
            required
          />
        </div>

        <p v-if="error" class="error-msg" style="margin-top: 12px">{{ error }}</p>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%; margin-top: 18px; padding: 12px; font-size: 15px; justify-content: center"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" style="width:16px;height:16px;margin:0" />
          <span v-else>Entrar</span>
        </button>
      </form>

      <button class="btn btn-ghost btn-sm" style="margin-top: 12px; width: 100%; justify-content: center" @click="goAdmin">
        Panel de administracion
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import { userApi } from '@/services/api'

const router = useRouter()
const username = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!username.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    await userApi.getOne(username.value.trim())
    auth.login(username.value.trim())
    router.push('/dashboard')
  } catch {
    error.value = 'Usuario no encontrado. Verifica el username e intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

function goAdmin() {
  router.push('/admin/login')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 60% 20%, rgba(232,184,75,0.07) 0%, transparent 60%),
              var(--bg-base);
  padding: 24px;
}

.bg-noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
}

.login-box {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
  padding: 40px 36px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.brand-icon {
  font-size: 28px;
  color: var(--accent);
  line-height: 1;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 38px;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  line-height: 1;
}

.brand-tagline {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
</style>
