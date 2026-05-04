<template>
  <div class="movie-card card">
    <div class="poster-wrap">
      <img
        v-if="movie.posterUrl && !imgError"
        :src="movie.posterUrl"
        :alt="movie.title"
        class="poster"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-else class="poster-placeholder">
        <span>&#9654;</span>
      </div>
      <button
        class="watch-badge"
        :class="{ watched: isWatched }"
        :disabled="watchLoading"
        :title="isWatched ? 'Marcar como no vista' : 'Marcar como vista'"
        @click.stop="toggleWatched"
      >
        <span v-if="watchLoading" class="spinner" style="width:10px;height:10px;margin:0" />
        <span v-else>{{ isWatched ? '&#10003; Vista' : '+ Marcar vista' }}</span>
      </button>
    </div>

    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>

      <div class="meta">
        <span class="rating">&#9733; {{ movie.avgRating?.toFixed(1) ?? 'N/A' }}</span>
        <span class="year">{{ movie.releaseDate?.slice(0, 4) }}</span>
        <span class="tag">{{ movie.classification }}</span>
      </div>

      <div class="star-section">
        <div
          class="stars"
          :class="{ disabled: !isWatched || rateLoading }"
          :title="!isWatched ? 'Debes marcar la pelicula como vista primero' : ''"
        >
          <button
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ filled: n <= hoverRating || (hoverRating === 0 && n <= userRating) }"
            :disabled="!isWatched || rateLoading"
            @mouseenter="hoverRating = n"
            @mouseleave="hoverRating = 0"
            @click="setRating(n)"
          >&#9733;</button>
        </div>
        <span v-if="rateLoading" class="spinner" style="width:10px;height:10px;margin:0" />
        <span v-else-if="isWatched && userRating > 0" class="user-rating-label">{{ userRating }}/5</span>
        <span v-else-if="!isWatched" class="lock-hint">Ver para calificar</span>
      </div>

      <p v-if="watchError" class="field-error">{{ watchError }}</p>
      <p v-if="rateError" class="field-error">{{ rateError }}</p>

      <p v-if="movie.synopsis" class="synopsis">{{ movie.synopsis }}</p>
      <div v-if="movie.tags?.length" class="tags">
        <span v-for="t in movie.tags.slice(0, 3)" :key="t" class="tag tag-accent">{{ t }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Movie } from '@/types'
import { auth } from '@/stores/auth'
import { userApi } from '@/services/api'

const props = defineProps<{ movie: Movie }>()

const imgError = ref(false)
const hoverRating = ref(0)
const watchLoading = ref(false)
const rateLoading = ref(false)
const watchError = ref('')
const rateError = ref('')

// localStorage como cache para no perder estado entre renders del mismo usuario
const storageKey = computed(() => `movie_state:${auth.username}:${props.movie.title}`)

function loadState(): { watched: boolean; rating: number } {
  try {
    const raw = localStorage.getItem(storageKey.value)
    return raw ? JSON.parse(raw) : { watched: false, rating: 0 }
  } catch {
    return { watched: false, rating: 0 }
  }
}

function saveState(s: { watched: boolean; rating: number }) {
  localStorage.setItem(storageKey.value, JSON.stringify(s))
}

const state = ref(loadState())
const isWatched = computed(() => state.value.watched)
const userRating = computed(() => state.value.rating)

async function toggleWatched() {
  if (isWatched.value) {
    // no existe endpoint DELETE para watched, solo se limpia localmente
    const next = { watched: false, rating: 0 }
    state.value = next
    saveState(next)
    return
  }
  watchLoading.value = true
  watchError.value = ''
  try {
    await userApi.createWatched({
      username: auth.username,
      movieTitle: props.movie.title,
      watchedAt: new Date().toISOString().slice(0, 10),
      completionPct: 100,
      deviceType: 'web',
    })
    const next = { ...state.value, watched: true }
    state.value = next
    saveState(next)
  } catch (e: unknown) {
    watchError.value = e instanceof Error ? e.message : 'Error al registrar'
  } finally {
    watchLoading.value = false
  }
}

async function setRating(n: number) {
  if (!isWatched.value) return
  const newRating = state.value.rating === n ? 0 : n
  rateLoading.value = true
  rateError.value = ''
  try {
    if (newRating > 0) {
      await userApi.createRated({
        username: auth.username,
        movieTitle: props.movie.title,
        rating: newRating * 2, // BD maneja escala 0-10, estrellas son 0-5
        ratedAt: new Date().toISOString().slice(0, 10),
        isVerified: false,
      })
    }
    const next = { ...state.value, rating: newRating }
    state.value = next
    saveState(next)
  } catch (e: unknown) {
    rateError.value = e instanceof Error ? e.message : 'Error al calificar'
  } finally {
    rateLoading.value = false
  }
}
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}
.movie-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--bg-elevated);
  flex-shrink: 0;
}
.poster { width: 100%; height: 100%; object-fit: cover; display: block; }
.poster-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 40px; color: var(--text-muted);
}

.watch-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(8,10,14,0.75);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  backdrop-filter: blur(6px);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.watch-badge:hover:not(:disabled) {
  background: rgba(232,184,75,0.15);
  border-color: var(--accent);
  color: var(--accent);
}
.watch-badge.watched {
  background: rgba(232,184,75,0.18);
  border-color: var(--accent);
  color: var(--accent);
}
.watch-badge:disabled { opacity: 0.6; cursor: default; }

.info { padding: 12px 14px; display: flex; flex-direction: column; gap: 7px; flex: 1; }

.title {
  font-size: 13px; font-weight: 500;
  color: var(--text-primary); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rating { font-size: 12px; color: var(--accent); font-weight: 600; }
.year  { font-size: 12px; color: var(--text-muted); }

.star-section { display: flex; align-items: center; gap: 6px; }

.stars { display: flex; gap: 2px; }
.stars.disabled .star { cursor: default; opacity: 0.35; }

.star {
  background: none;
  border: none;
  padding: 0;
  font-size: 16px;
  color: var(--border);
  cursor: pointer;
  line-height: 1;
  transition: color 0.1s, transform 0.1s;
}
.star:not(:disabled):hover,
.star.filled { color: var(--accent); }
.star:not(:disabled):hover { transform: scale(1.15); }

.user-rating-label { font-size: 11px; color: var(--accent); font-weight: 600; }
.lock-hint { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
.field-error { font-size: 11px; color: var(--red); margin: 0; }

.synopsis {
  font-size: 12px; color: var(--text-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.tags { display: flex; flex-wrap: wrap; gap: 4px; }
</style>