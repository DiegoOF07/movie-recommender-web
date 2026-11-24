<script setup lang="ts">
import { computed } from 'vue'
import { radialLayout } from './miniGraphLayout'
import type { Group, NodeRef } from '@/types'

const props = withDefaults(
  defineProps<{
    center: NodeRef
    groups: Group[]
    size?: number
    relLabel?: (type: string, direction: 'out' | 'in') => string
  }>(),
  { size: 220, relLabel: (type: string) => type },
)
const emit = defineEmits<{ open: [ref: NodeRef] }>()

const layout = computed(() => radialLayout(props.groups, props.size))
const c = computed(() => props.size / 2)
</script>

<template>
  <svg
    class="mini-graph"
    :viewBox="`0 0 ${size} ${size}`"
    :width="size"
    :height="size"
    role="group"
    :aria-label="`Vecinos de ${center.key}`"
  >
    <g class="edges" aria-hidden="true">
      <line v-for="n in layout.nodes" :key="`e-${n.relType}-${n.direction}-${n.ref.key}`" :x1="c" :y1="c" :x2="n.x" :y2="n.y" />
    </g>
    <circle class="center" :cx="c" :cy="c" r="15" aria-hidden="true" />
    <a
      v-for="n in layout.nodes"
      :key="`n-${n.relType}-${n.direction}-${n.ref.key}`"
      href="#"
      :aria-label="`${relLabel(n.relType, n.direction)}: ${n.ref.key}`"
      @click.prevent="emit('open', n.ref)"
    >
      <title>{{ relLabel(n.relType, n.direction) }}: {{ n.ref.key }}</title>
      <circle :class="['node', `node--${n.ref.label.toLowerCase()}`]" :cx="n.x" :cy="n.y" r="8" />
    </a>
    <text v-if="layout.overflow > 0" class="overflow" :x="size - 6" :y="size - 8" text-anchor="end">
      +{{ layout.overflow }}
    </text>
  </svg>
</template>

<style scoped>
.mini-graph {
  display: block;
  max-width: 100%;
  height: auto;
}

.edges line {
  stroke: var(--line);
  stroke-width: 1.2;
}

.center {
  fill: var(--safelight);
}

.node {
  stroke: var(--surface);
  stroke-width: 2;
  transition: r var(--ease);
  cursor: pointer;
}

a:hover .node,
a:focus-visible .node {
  r: 10;
  stroke: var(--ink);
}

a:focus-visible {
  outline: none;
}

.node--movie { fill: var(--node-movie); }
.node--user { fill: var(--node-user); }
.node--genre { fill: var(--node-genre); }
.node--actor { fill: var(--node-actor); }
.node--director { fill: var(--node-director); }

.overflow {
  font-family: var(--font-mono);
  font-size: 11px;
  fill: var(--ink-mute);
}
</style>
