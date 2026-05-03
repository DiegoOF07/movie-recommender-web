<template>
  <div class="admin-layout">
    <AdminNav :active="activeSection" @change="activeSection = $event" />

    <main class="admin-main">
      <Transition name="fade" mode="out-in">
        <MoviesPanel     v-if="activeSection === 'movies'" />
        <UsersPanel      v-else-if="activeSection === 'users'" />
        <GenresPanel     v-else-if="activeSection === 'genres'" />
        <ActorsPanel     v-else-if="activeSection === 'actors'" />
        <DirectorsPanel  v-else-if="activeSection === 'directors'" />
        <RelationshipsPanel v-else-if="activeSection === 'relationships'" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminNav from '@/components/AdminNav.vue'
import MoviesPanel from '@/components/admin/MoviesPanel.vue'
import UsersPanel from '@/components/admin/UsersPanel.vue'
import GenresPanel from '@/components/admin/GenresPanel.vue'
import ActorsPanel from '@/components/admin/ActorsPanel.vue'
import DirectorsPanel from '@/components/admin/DirectorsPanel.vue'
import RelationshipsPanel from '@/components/admin/RelationshipsPanel.vue'

const activeSection = ref('movies')
</script>

<style scoped>
.admin-layout { min-height: 100vh; background: var(--bg-base); }
.admin-main { padding: 0; }
</style>
