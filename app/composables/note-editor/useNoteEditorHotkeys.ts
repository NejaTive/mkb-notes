import { onBeforeUnmount, onMounted } from 'vue'
import { useEditorStore } from '~/stores/editor'
import { useModalStack } from '~/composables/useModalStack'
import { useUndoHotkeys } from '~/composables/useUndoHotkeys'
import { parseField } from './fields'

interface Options {
  isReady: () => boolean
  save: () => void
}

export function useNoteEditorHotkeys({ isReady, save }: Options) {
  const editor = useEditorStore()
  const modals = useModalStack()

  useUndoHotkeys({
    undo: () => editor.undo(),
    redo: () => editor.redo(),
    preferNative: (target) => {
      if (!isReady()) return true
      const field = parseField(target)
      if (field === null) return false
      if (field === 'new') return (target as HTMLInputElement).value !== ''
      return editor.hasPendingIn(field)
    },
  })

  function onKeydown(event: KeyboardEvent): void {
    if (modals.isAnyOpen.value || !isReady()) return
    if ((event.ctrlKey || event.metaKey) && (event.code === 'KeyS' || event.key.toLowerCase() === 's')) {
      event.preventDefault()
      save()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
