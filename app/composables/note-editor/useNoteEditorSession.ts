import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '~/stores/notes'
import { useEditorStore } from '~/stores/editor'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { isBlankContent } from '~/utils/note'
import { useNoteDraft } from './useNoteDraft'
import { FIELD_TITLE, focusField } from './fields'

export const NEW_NOTE_ID = 'new'

export type EditorStatus = 'loading' | 'ready' | 'not-found'

export function useNoteEditorSession() {
  const route = useRoute()
  const router = useRouter()
  const notes = useNotesStore()
  const editor = useEditorStore()
  const { confirm } = useConfirm()
  const toast = useToast()

  const status = ref<EditorStatus>('loading')
  const error = ref('')
  let allowLeave = false

  const draft = useNoteDraft(() => status.value === 'ready')
  const routeId = computed(() => String(route.params.id ?? ''))
  const pageTitle = computed(() => (editor.isNew ? 'Новая заметка' : editor.draft.title.trim() || 'Без названия'))

  async function open(id: string): Promise<void> {
    error.value = ''
    draft.cancel()
    if (id === NEW_NOTE_ID) {
      editor.open(null)
      status.value = 'ready'
      await draft.offerRestore(null)
      focusField(FIELD_TITLE)
      return
    }
    const note = notes.getById(id)
    if (!note) {
      status.value = 'not-found'
      return
    }
    editor.open(note)
    status.value = 'ready'
    await draft.offerRestore(id)
  }

  watch(
    routeId,
    (id) => {
      if (status.value === 'ready' && (editor.noteId ?? NEW_NOTE_ID) === id) return
      void open(id)
    },
    { immediate: true },
  )

  watch(
    () => (editor.noteId ? notes.getById(editor.noteId) : null),
    async (note, previous) => {
      if (status.value !== 'ready' || note !== undefined || previous === undefined || allowLeave) return
      const deletedId = editor.noteId
      editor.detach()
      draft.drop(deletedId)
      draft.schedule()
      const ok = await confirm({
        title: 'Заметку удалили',
        message:
          'Эта заметка была удалена в другой вкладке. Ваши правки здесь сохранились — можно сохранить их как новую заметку.',
        confirmText: 'Сохранить как новую',
        cancelText: 'Продолжить редактирование',
      })
      if (ok) save()
      else void router.replace(`/notes/${NEW_NOTE_ID}`)
    },
  )

  function save(): void {
    if (status.value !== 'ready') return
    editor.commitTyping()
    if (isBlankContent(editor.draft)) {
      error.value = 'Пустую заметку сохранить нельзя: добавьте название или хотя бы один пункт.'
      focusField(FIELD_TITLE)
      return
    }
    error.value = ''
    const wasNew = editor.isNew
    const saved = wasNew ? notes.create(editor.draft) : notes.save(editor.noteId!, editor.draft)
    draft.drop(wasNew ? null : saved.id)
    editor.markSaved(saved)
    toast.show('Сохранено', 'success')
    if (wasNew) void router.replace(`/notes/${saved.id}`)
  }

  async function cancelEditing(): Promise<void> {
    if (!editor.isDirty) return
    const ok = await confirm({
      title: 'Отменить редактирование?',
      message: 'Все несохранённые изменения будут потеряны.',
      confirmText: 'Отменить изменения',
      cancelText: 'Продолжить',
      tone: 'danger',
    })
    if (!ok) return
    const id = editor.noteId
    editor.discard()
    draft.drop(id)
    allowLeave = true
    await router.push('/')
  }

  async function deleteNote(): Promise<void> {
    const id = editor.noteId
    if (!id) return
    const ok = await confirm({
      title: 'Удалить заметку?',
      message: `«${pageTitle.value}» будет удалена без возможности восстановления.`,
      confirmText: 'Удалить',
      cancelText: 'Оставить',
      tone: 'danger',
    })
    if (!ok) return
    allowLeave = true
    draft.drop(id)
    notes.remove(id)
    toast.show('Заметка удалена')
    await router.push('/')
  }

  onBeforeRouteLeave(async () => {
    if (allowLeave || status.value !== 'ready') return true
    editor.commitTyping()
    if (!editor.isDirty) {
      draft.drop(editor.noteId)
      return true
    }
    const ok = await confirm({
      title: 'Уйти без сохранения?',
      message: 'В заметке есть несохранённые изменения. Они будут потеряны.',
      confirmText: 'Уйти',
      cancelText: 'Остаться',
      tone: 'danger',
    })
    if (ok) draft.drop(editor.noteId)
    return ok
  })

  return { status, error, pageTitle, save, cancelEditing, deleteNote }
}
