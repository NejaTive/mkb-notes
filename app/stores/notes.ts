import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note, NoteContent } from '../types/note'
import { createId } from '../utils/id'
import { cloneContent, normalizeContent } from '../utils/note'
import { debounce } from '../utils/debounce'
import { backupCorrupted, loadNotes, removeDraft, saveNotes } from '../utils/storage'
import { createDemoNotes } from '../utils/demo'

export const PERSIST_DELAY = 300

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const hydrated = ref(false)
  const persistError = ref(false)

  const sorted = computed(() => [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt))

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id)
  }

  const writer = debounce(() => {
    persistError.value = !saveNotes(notes.value)
  }, PERSIST_DELAY)

  function hydrate(options: { seedDemo?: boolean } = {}): void {
    const result = loadNotes()
    if (result.status === 'ok') {
      notes.value = result.notes
      if (result.migrated) writer()
    } else if (result.status === 'corrupted') {
      backupCorrupted()
      notes.value = []
      writer()
    } else {
      notes.value = options.seedDemo ? createDemoNotes() : []
      if (options.seedDemo) writer()
    }
    hydrated.value = true
  }

  function syncFromStorage(): void {
    writer.cancel()
    const result = loadNotes()
    notes.value = result.status === 'ok' ? result.notes : []
  }

  function create(content: NoteContent): Note {
    const now = Date.now()
    const note: Note = { id: createId(), ...normalizeContent(cloneContent(content)), createdAt: now, updatedAt: now }
    notes.value.push(note)
    writer()
    return note
  }

  function save(id: string, content: NoteContent): Note {
    const now = Date.now()
    const existing = getById(id)
    const normalized = normalizeContent(cloneContent(content))
    if (existing) {
      Object.assign(existing, normalized, { updatedAt: now })
      writer()
      return existing
    }
    const note: Note = { id, ...normalized, createdAt: now, updatedAt: now }
    notes.value.push(note)
    writer()
    return note
  }

  function remove(id: string): boolean {
    const index = notes.value.findIndex((note) => note.id === id)
    removeDraft(id)
    if (index === -1) return false
    notes.value.splice(index, 1)
    writer()
    return true
  }

  function flush(): void {
    writer.flush()
  }

  return { notes, hydrated, persistError, sorted, getById, hydrate, syncFromStorage, create, save, remove, flush }
})
