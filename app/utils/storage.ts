import type { Note, NoteContent, TodoItem } from '../types/note'
import { isNoteColor } from './note'

export const SCHEMA_VERSION = 1
export const NOTES_KEY = 'mkb-notes:data'
export const DRAFT_KEY_PREFIX = 'mkb-notes:draft:'

export interface NotesPayload {
  version: number
  notes: Note[]
}

export interface DraftPayload {
  version: number
  noteId: string | null
  baseUpdatedAt: number | null
  savedAt: number
  content: NoteContent
}

export type LoadResult =
  { status: 'empty' } | { status: 'ok'; notes: Note[]; migrated: boolean } | { status: 'corrupted' }

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeTodo(raw: unknown): TodoItem | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  return {
    id: raw.id,
    text: typeof raw.text === 'string' ? raw.text : '',
    done: raw.done === true,
  }
}

export function sanitizeContent(raw: unknown): NoteContent | null {
  if (!isRecord(raw)) return null
  const todos = Array.isArray(raw.todos) ? raw.todos.map(sanitizeTodo).filter((t): t is TodoItem => t !== null) : []
  return {
    title: typeof raw.title === 'string' ? raw.title : '',
    color: isNoteColor(raw.color) ? raw.color : 'yellow',
    todos,
  }
}

function sanitizeNote(raw: unknown): Note | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  const content = sanitizeContent(raw)
  if (!content) return null
  const now = Date.now()
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : now
  return {
    id: raw.id,
    ...content,
    createdAt,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : createdAt,
  }
}

export function migrate(raw: unknown): { notes: Note[]; migrated: boolean } | null {
  let version: number
  let notesRaw: unknown

  if (Array.isArray(raw)) {
    version = 0
    notesRaw = raw
  } else if (isRecord(raw) && typeof raw.version === 'number' && Array.isArray(raw.notes)) {
    version = raw.version
    notesRaw = raw.notes
  } else {
    return null
  }

  if (version > SCHEMA_VERSION) return null

  const notes = (notesRaw as unknown[]).map(sanitizeNote).filter((n): n is Note => n !== null)
  return { notes, migrated: version !== SCHEMA_VERSION }
}

export function loadNotes(): LoadResult {
  const storage = getStorage()
  const raw = storage?.getItem(NOTES_KEY)
  if (raw == null) return { status: 'empty' }
  try {
    const result = migrate(JSON.parse(raw))
    return result ? { status: 'ok', ...result } : { status: 'corrupted' }
  } catch {
    return { status: 'corrupted' }
  }
}

export function saveNotes(notes: Note[]): boolean {
  const storage = getStorage()
  if (!storage) return false
  const payload: NotesPayload = { version: SCHEMA_VERSION, notes }
  try {
    storage.setItem(NOTES_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function backupCorrupted(): void {
  const storage = getStorage()
  const raw = storage?.getItem(NOTES_KEY)
  if (storage && raw != null) {
    try {
      storage.setItem(`${NOTES_KEY}:backup-${Date.now()}`, raw)
    } catch {
      console.error('error:backupCorrupted')
    }
  }
}

export function draftKey(noteId: string | null): string {
  return DRAFT_KEY_PREFIX + (noteId ?? 'new')
}

export function loadDraft(noteId: string | null): DraftPayload | null {
  const raw = getStorage()?.getItem(draftKey(noteId))
  if (raw == null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== SCHEMA_VERSION) return null
    const content = sanitizeContent(parsed.content)
    if (!content) return null
    return {
      version: SCHEMA_VERSION,
      noteId: typeof parsed.noteId === 'string' ? parsed.noteId : null,
      baseUpdatedAt: typeof parsed.baseUpdatedAt === 'number' ? parsed.baseUpdatedAt : null,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
      content,
    }
  } catch {
    return null
  }
}

export function saveDraft(draft: Omit<DraftPayload, 'version' | 'savedAt'>): void {
  const payload: DraftPayload = { version: SCHEMA_VERSION, savedAt: Date.now(), ...draft }
  try {
    getStorage()?.setItem(draftKey(draft.noteId), JSON.stringify(payload))
  } catch {
    console.error('error:saveDraft')
  }
}

export function removeDraft(noteId: string | null): void {
  try {
    getStorage()?.removeItem(draftKey(noteId))
  } catch {
    console.error('error:removeDraft')
  }
}
