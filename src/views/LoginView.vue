<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import { userApi } from '@/services/api'
import Button from '@/ui/Button.vue'
import FieldGroup from '@/ui/FieldGroup.vue'

const router = useRouter()
const username = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  const name = username.value.trim()
  if (!name) return
  loading.value = true
  error.value = ''
  try {
    await userApi.getOne(name)
    auth.login(name)
    router.push('/dashboard')
  } catch {
    error.value = 'No encontramos ese usuario. Revisa cómo está escrito.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login">
    <section class="login-box" aria-labelledby="login-title">
      <p class="mono-label">▸ Sala de revelado</p>
      <h1 id="login-title" class="brand">CINEGRAFO</h1>
      <p class="tagline">Recomendaciones que salen de recorrer un grafo: lo que viste, lo que te gustó y quién piensa como tú.</p>

      <form class="login-form" @submit.prevent="submit">
        <FieldGroup label="Usuario" :error="error" hint="Prueba con jorge.vasquez">
          <template #default="{ id, describedBy, invalid }">
            <input
              :id="id"
              v-model="username"
              type="text"
              autocomplete="username"
              spellcheck="false"
              required
              :aria-describedby="describedBy"
              :aria-invalid="invalid || undefined"
            />
          </template>
        </FieldGroup>
        <Button type="submit" variant="primary" :loading="loading">Entrar</Button>
      </form>

      <RouterLink to="/admin/login" class="admin-link">Panel de administración →</RouterLink>
    </section>
    <p class="edge mono-label" aria-hidden="true">KODAK 5219 · 23 · ▸▸ · CINEGRAFO · 24</p>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(ellipse 60% 45% at 50% 38%, rgba(255, 90, 54, 0.1), transparent 70%),
    var(--bg);
}

.login-box {
  width: min(400px, 100%);
  padding: 32px 30px 26px;
  border-radius: var(--r);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.brand {
  margin: 6px 0 8px;
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: 0.02em;
  color: var(--safelight);
}

.tagline {
  color: var(--ink-dim);
  font-size: 14px;
}

.login-form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.admin-link {
  display: inline-block;
  margin-top: 18px;
  font-size: 13px;
  color: var(--ink-mute);
  text-decoration: none;
}

.admin-link:hover {
  color: var(--ink);
}

/* Como el código impreso en el borde del celuloide */
.edge {
  position: fixed;
  bottom: 14px;
  left: 0;
  right: 0;
  text-align: center;
  color: #4a3630;
}
</style>
