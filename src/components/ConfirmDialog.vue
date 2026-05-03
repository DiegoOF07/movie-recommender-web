<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <span class="modal-title">{{ title }}</span>
      </div>
      <p style="font-size:14px; color:var(--text-secondary); margin-bottom:24px">{{ message }}</p>
      <div style="display:flex; gap:10px; justify-content:flex-end">
        <button class="btn btn-ghost" @click="$emit('cancel')">Cancelar</button>
        <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ show: boolean; title: string; message: string; confirmLabel?: string }>()
defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>
