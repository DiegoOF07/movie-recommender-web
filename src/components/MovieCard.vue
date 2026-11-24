<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Movie } from '@/types'
import { useActivity } from '@/stores/activity'
import Chip from '@/ui/Chip.vue'
import StarRating from '@/ui/StarRating.vue'
import ConfirmDialog from '@/ui/ConfirmDialog.vue'

const props = defineProps<{ movie: Movie; frame?: number; strategy?: string }>()

const activity = useActivity()
const imgError = ref(false)
const confirmUnwatch = ref(false)

const title = computed(() => props.movie.title)
const watched = computed(() => activity.isWatched(title.value))
const rating = computed(() => activity.rating(title.value))
const busy = computed(() => activity.pending(title.value))
const year = computed(() => props.movie.releaseDate?.slice(0, 4))
const frameLabel = computed(() =>
  props.frame ? `▸ Fotograma ${String(props.frame).padStart(3, '0')}` : '',
)

function toggleWatched() {
  if (watched.value) confirmUnwatch.value = true
  else activity.markWatched(title.value)
}

async function unwatch() {
  await activity.unwatch(title.value)
  confirmUnwatch.value = false
}
</script>

<template>
  <article class="card" :aria-label="title">
    <div class="poster" tabindex="0">
      <img
        v-if="movie.posterUrl && !imgError"
        :src="movie.posterUrl"
        :alt="`Póster de ${title}`"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-else class="poster-fallback" aria-hidden="true">{{ title }}</div>
      <div v-if="movie.synopsis" class="synopsis">
        <p>{{ movie.synopsis }}</p>
      </div>
    </div>

    <div class="body">
      <p v-if="frameLabel" class="mono-label frame">{{ frameLabel }}</p>
      <h3 class="title" :title="title">{{ title }}</h3>
      <p class="meta">
        <span class="avg" :aria-label="`Promedio ${movie.avgRating?.toFixed(1)} de 5`">★ {{ movie.avgRating?.toFixed(1) ?? '—' }}</span>
        <span v-if="year" class="year">{{ year }}</span>
      </p>
      <div v-if="movie.genres?.length" class="genres">
        <Chip v-for="g in movie.genres.slice(0, 2)" :key="g" node="Genre">{{ g }}</Chip>
      </div>

      <div class="actions">
        <button
          type="button"
          class="seen"
          :class="{ on: watched }"
          :aria-pressed="watched ? 'true' : 'false'"
          :disabled="busy"
          @click="toggleWatched"
        >
          {{ watched ? '✓ Vista' : '+ Vista' }}
        </button>
        <StarRating
          :model-value="rating"
          :disabled="!watched || busy"
          disabled-hint="Márcala como vista para calificarla"
          :label="`Tu calificación de ${title}`"
          @update:model-value="(v) => activity.rate(title, v)"
        />
      </div>
    </div>

    <ConfirmDialog
      :open="confirmUnwatch"
      title="¿Desmarcar como vista?"
      :message="rating ? `Se borrará también tu calificación de ${rating} estrellas.` : `${title} dejará de contar como vista.`"
      confirm-label="Desmarcar"
      danger
      :loading="busy"
      @confirm="unwatch"
      @cancel="confirmUnwatch = false"
    />
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--r);
  background: var(--surface);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: border-color var(--ease);
}

.card:hover {
  border-color: #5a4038;
}

.poster {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--surface-2);
  overflow: hidden;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 12px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--ink-mute);
}

/* La sinopsis aparece sobre el póster al pasar el cursor o enfocar */
.synopsis {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 14px;
  background: linear-gradient(to top, rgba(18, 13, 12, 0.96) 55%, rgba(18, 13, 12, 0.55));
  opacity: 0;
  transition: opacity var(--ease);
}

.synopsis p {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 9;
  line-clamp: 9;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poster:hover .synopsis,
.poster:focus-visible .synopsis {
  opacity: 1;
}

.poster:focus-visible {
  outline-offset: -2px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  padding: 10px 12px 12px;
}

.frame {
  font-size: 9.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.avg {
  color: var(--amber);
}

.year {
  color: var(--ink-mute);
}

.genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #2e211d;
}

.seen {
  padding: 4px 9px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: none;
  color: var(--ink-dim);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.seen:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink-mute);
}

.seen.on {
  color: var(--safelight);
  border-color: rgba(255, 90, 54, 0.5);
  background: rgba(255, 90, 54, 0.08);
}

.seen:disabled {
  opacity: 0.6;
}
</style>
