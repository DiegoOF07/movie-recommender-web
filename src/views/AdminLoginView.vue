<template>
  <div class="login-page">
    <div class="login-box card">
      <div class="brand">
        <span class="brand-icon">&#9881;</span>
        <h1 class="brand-name">ADMIN</h1>
      </div>
      <p class="brand-tagline">Acceso restringido — Panel de administracion</p>

      <hr class="divider" />

      <form @submit.prevent="submit">
        <div class="form-group">
          <label for="password">Contrasena de administrador</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa la contrasena"
            required
          />
        </div>

        <p v-if="error" class="error-msg" style="margin-top:12px">{{ error }}</p>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:18px; padding:12px; font-size:15px; justify-content:center"
        >
          Ingresar
        </button>
      </form>

      <button class="btn btn-ghost btn-sm" style="margin-top:12px; width:100%; justify-content:center" @click="router.push('/login')">
        Volver al inicio
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const router = useRouter()
const password = ref('')
const error = ref('')

function submit() {
  if (auth.checkAdminPassword(password.value)) {
    auth.loginAdmin()
    router.push('/admin')
  } else {
    error.value = 'Contrasena incorrecta.'
    password.value = ''
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 40% 30%, rgba(91,156,246,0.06) 0%, transparent 55%), var(--bg-base);
  padding: 24px;
}
.login-box { width: 100%; max-width: 380px; padding: 40px 36px; }
.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.brand-icon { font-size: 28px; color: var(--blue); }
.brand-name { font-family: var(--font-display); font-size: 38px; letter-spacing: 0.1em; color: var(--text-primary); }
.brand-tagline { font-size: 13px; color: var(--text-secondary); }
</style>
