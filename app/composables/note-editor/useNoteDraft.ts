import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useEditorStore } from '~/stores/editor'
import { useConfirm } from '~/composables/useConfirm'
import { cloneContent, isBlankContent, isSameContent } from '~/utils/note'
import { debounce } from '~/utils/debounce'
import { loadDraft, removeDraft, saveDraft } from '~/utils/storage'

const DRAFT_DELAY = 500

export function useNoteDraft(isActive: () => boolean) {
  const editor = useEditorStore()
  const { confirm } = useConfirm()

  const writer = debounce(() => {
    if (!isActive()) return
    if (editor.isDirty) {
      saveDraft({ noteId: editor.noteId, baseUpdatedAt: editor.baseUpdatedAt, content: cloneContent(editor.draft) })
    } else {
      removeDraft(editor.noteId)
    }
  }, DRAFT_DELAY)

  watch(
    () => editor.draft,
    () => writer(),
    { deep: true },
  )

  function drop(noteId: string | null): void {
    writer.cancel()
    removeDraft(noteId)
  }

  async function offerRestore(noteId: string | null): Promise<void> {
    const draft = loadDraft(noteId)
    if (!draft) return
    const useless = isSameContent(draft.content, editor.base) || (noteId === null && isBlankContent(draft.content))
    if (useless) {
      removeDraft(noteId)
      return
    }
    const when = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(draft.savedAt)
    const changedSince = noteId !== null && draft.baseUpdatedAt !== editor.baseUpdatedAt
    const ok = await confirm({
      title: 'Восстановить черновик?',
      message:
        `Найдены несохранённые изменения от ${when}.` +
        (changedSince ? ' Внимание: заметка с тех пор была изменена — восстановление заменит эти изменения.' : ''),
      confirmText: 'Восстановить',
      cancelText: 'Отбросить',
    })
    if (ok) editor.restore(draft.content)
    else removeDraft(noteId)
  }

  const flush = () => writer.flush()

  onMounted(() => window.addEventListener('pagehide', flush))
  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', flush)
    writer.cancel()
  })

  return { schedule: () => writer(), cancel: () => writer.cancel(), drop, offerRestore }
}
