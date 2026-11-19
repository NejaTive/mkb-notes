import { onBeforeUnmount, onMounted } from 'vue'
import { useModalStack } from './useModalStack'

interface Options {
  undo: () => void
  redo: () => void
  preferNative?: (target: EventTarget | null) => boolean
}

export function useUndoHotkeys({ undo, redo, preferNative }: Options) {
  const modals = useModalStack()

  function onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.altKey || event.isComposing) return
    if (!(event.ctrlKey || event.metaKey)) return
    const isZ = event.code === 'KeyZ' || event.key.toLowerCase() === 'z'
    const isY = event.code === 'KeyY' || event.key.toLowerCase() === 'y'
    if (!isZ && !isY) return
    if (modals.isAnyOpen.value) return
    if (preferNative?.(event.target)) return

    event.preventDefault()
    if (isY || event.shiftKey) redo()
    else undo()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
