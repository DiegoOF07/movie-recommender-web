<template>
  <div class="movie-card card">
    <div class="poster-wrap">
      <img
        v-if="movie.posterUrl"
        :src="movie.posterUrl"
        :alt="movie.title"
        class="poster"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-else class="poster-placeholder">
        <span>&#9654;</span>
      </div>
    </div>
    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>
      <div class="meta">
        <span class="rating">&#9733; {{ movie.avgRating?.toFixed(1) ?? 'N/A' }}</span>
        <span class="year">{{ movie.releaseDate?.slice(0, 4) }}</span>
        <span class="tag">{{ movie.classification }}</span>
      </div>
      <p v-if="movie.synopsis" class="synopsis">{{ movie.synopsis }}</p>
      <div v-if="movie.tags?.length" class="tags">
        <span v-for="t in movie.tags.slice(0, 3)" :key="t" class="tag tag-accent">{{ t }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Movie } from '@/types'

defineProps<{ movie: Movie }>()
const imgError = ref(false)
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

.info { padding: 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }

.title {
  font-size: 14px; font-weight: 500;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rating { font-size: 12px; color: var(--accent); font-weight: 600; }
.year { font-size: 12px; color: var(--text-muted); }

.synopsis {
  font-size: 12px; color: var(--text-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.tags { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
