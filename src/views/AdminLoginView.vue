<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import Button from '@/ui/Button.vue'
import FieldGroup from '@/ui/FieldGroup.vue'

const router = useRouter()
const password = ref('')
const error = ref('')

// Control de demo: la contraseña se compara en el navegador (ver README)
function submit() {
  if (auth.checkAdminPassword(password.value)) {
    auth.loginAdmin()
    router.push({ name: 'admin', params: { label: 'Movie' } })
  } else {
    error.value = 'Contraseña incorrecta.'
    password.value = ''
  }
}
</script>

<template>
  <main class="login">
    <section class="login-box" aria-labelledby="admin-title">
      <p class="mono-label">▸ Acceso restringido</p>
      <h1 id="admin-title" class="brand">ADMINISTRACIÓN</h1>
      <p class="tagline">Edita el grafo: películas, personas, usuarios y cómo se conectan.</p>

      <form class="login-form" @submit.prevent="submit">
        <FieldGroup label="Contraseña" :error="error">
          <template #default="{ id, describedBy, invalid }">
            <input
              :id="id"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :aria-describedby="describedBy"
              :aria-invalid="invalid || undefined"
            />
          </template>
        </FieldGroup>
        <Button type="submit" variant="primary">Entrar</Button>
      </form>

      <RouterLink to="/login" class="back">← Volver a la app</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(ellipse 60% 45% at 50% 38%, rgba(232, 163, 61, 0.08), transparent 70%),
    var(--bg);
}

.login-box {
  width: min(400px, 100%);
  padding: 32px 30px 26px;
  border-radius: var(--r);
  border: 1px solid var(--line);
  background: var(--surface);
}

.brand {
  margin: 6px 0 8px;
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 800;
  line-height: 0.95;
  color: var(--amber);
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

.back {
  display: inline-block;
  margin-top: 18px;
  font-size: 13px;
  color: var(--ink-mute);
  text-decoration: none;
}

.back:hover {
  color: var(--ink);
}
</style>
