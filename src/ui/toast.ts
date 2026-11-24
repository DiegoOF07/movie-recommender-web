import { ref } from 'vue'

export interface ToastMessage {
  id: number
  text: string
  kind: 'ok' | 'error'
}

const messages = ref<ToastMessage[]>([])
let next = 1

// Un solo store para toda la app; Toast.vue se monta una vez en App.vue
export function useToast() {
  function show(text: string, kind: 'ok' | 'error' = 'ok') {
    const id = next++
    messages.value.push({ id, text, kind })
    setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500)
  }
  function dismiss(id: number) {
    messages.value = messages.value.filter((m) => m.id !== id)
  }
  return { messages, show, dismiss }
}
