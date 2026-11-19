import { ref } from 'vue'

export interface Toast {
  id: number
  text: string
  tone: 'info' | 'success' | 'warning'
}

const toasts = ref<Toast[]>([])
let seq = 0

export function useToast() {
  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(text: string, tone: Toast['tone'] = 'info', timeout = 2600): void {
    const id = ++seq
    toasts.value = [...toasts.value.slice(-2), { id, text, tone }]
    setTimeout(() => dismiss(id), timeout)
  }

  return { toasts, show, dismiss }
}
