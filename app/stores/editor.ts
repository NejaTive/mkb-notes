import { defineStore } from 'pinia'
import { computed, reactive, ref, shallowRef } from 'vue'
import type { Note, NoteColor, NoteContent, TodoItem } from '../types/note'
import { UndoHistory } from '../utils/history'
import { applyOp, invertOp, type NoteOp } from '../utils/noteOps'
import { cloneContent, emptyContent, isSameContent, pickContent } from '../utils/note'
import { createId } from '../utils/id'

export const HISTORY_LIMIT = 50
export const TYPING_COMMIT_DELAY = 700

export type TextField = { kind: 'title' } | { kind: 'todo'; id: string }

interface PendingText {
  field: TextField
  from: string
}

function sameField(a: TextField, b: TextField): boolean {
  return a.kind === b.kind && (a.kind === 'title' || (b.kind === 'todo' && a.id === b.id))
}

export const useEditorStore = defineStore('editor', () => {
  const noteId = ref<string | null>(null)
  const baseUpdatedAt = ref<number | null>(null)
  const base = shallowRef<NoteContent>(emptyContent())
  const draft = reactive<NoteContent>(emptyContent())
  const history = reactive(new UndoHistory<NoteOp>(HISTORY_LIMIT)) as UndoHistory<NoteOp>
  const pending = shallowRef<PendingText | null>(null)
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  const isNew = computed(() => noteId.value === null)
  const isDirty = computed(() => !isSameContent(draft, base.value))
  const canUndo = computed(() => history.canUndo || hasPendingChange())
  const canRedo = computed(() => history.canRedo && !hasPendingChange())

  function setDraft(content: NoteContent): void {
    const copy = cloneContent(content)
    draft.title = copy.title
    draft.color = copy.color
    draft.todos.splice(0, draft.todos.length, ...copy.todos)
  }

  function clearTypingTimer(): void {
    if (typingTimer !== null) clearTimeout(typingTimer)
    typingTimer = null
  }

  function resetHistory(): void {
    clearTypingTimer()
    pending.value = null
    history.clear()
  }

  function open(note: Note | null, color: NoteColor = 'yellow'): void {
    noteId.value = note?.id ?? null
    baseUpdatedAt.value = note?.updatedAt ?? null
    base.value = note ? pickContent(note) : emptyContent(color)
    setDraft(base.value)
    resetHistory()
  }

  function restore(content: NoteContent): void {
    setDraft(content)
    resetHistory()
  }

  function markSaved(note: Note): void {
    noteId.value = note.id
    baseUpdatedAt.value = note.updatedAt
    base.value = pickContent(note)
    setDraft(base.value)
    resetHistory()
  }

  function discard(): void {
    setDraft(base.value)
    resetHistory()
  }

  function detach(): void {
    noteId.value = null
    baseUpdatedAt.value = null
    base.value = emptyContent(draft.color)
  }

  function readText(field: TextField): string | undefined {
    if (field.kind === 'title') return draft.title
    return draft.todos.find((todo) => todo.id === field.id)?.text
  }

  function writeText(field: TextField, value: string): void {
    if (field.kind === 'title') {
      draft.title = value
      return
    }
    const todo = draft.todos.find((t) => t.id === field.id)
    if (todo) todo.text = value
  }

  function hasPendingChange(): boolean {
    const p = pending.value
    return p !== null && readText(p.field) !== p.from
  }

  function hasPendingIn(field: TextField): boolean {
    const p = pending.value
    return p !== null && sameField(p.field, field)
  }

  function commitTyping(): void {
    clearTypingTimer()
    const p = pending.value
    pending.value = null
    if (!p) return
    const to = readText(p.field)
    if (to === undefined || to === p.from) return
    history.record(
      p.field.kind === 'title'
        ? { type: 'setTitle', from: p.from, to }
        : { type: 'setTodoText', id: p.field.id, from: p.from, to },
    )
  }

  function inputText(field: TextField, value: string): void {
    const current = readText(field)
    if (current === undefined) return
    if (pending.value && !sameField(pending.value.field, field)) commitTyping()
    if (!pending.value) pending.value = { field, from: current }
    writeText(field, value)
    clearTypingTimer()
    typingTimer = setTimeout(commitTyping, TYPING_COMMIT_DELAY)
  }

  const setTitle = (value: string) => inputText({ kind: 'title' }, value)
  const setTodoText = (id: string, value: string) => inputText({ kind: 'todo', id }, value)

  function perform(op: NoteOp): void {
    commitTyping()
    applyOp(draft, op)
    history.record(op)
  }

  function setColor(color: NoteColor): void {
    if (draft.color === color) return
    perform({ type: 'setColor', from: draft.color, to: color })
  }

  function toggleTodo(id: string): void {
    const todo = draft.todos.find((t) => t.id === id)
    if (!todo) return
    perform({ type: 'setTodoDone', id, from: todo.done, to: !todo.done })
  }

  function addTodo(text = '', index = draft.todos.length): TodoItem {
    const todo: TodoItem = { id: createId(), text, done: false }
    perform({ type: 'addTodo', index: Math.min(Math.max(index, 0), draft.todos.length), todo })
    return todo
  }

  function removeTodo(id: string): void {
    commitTyping()
    const index = draft.todos.findIndex((t) => t.id === id)
    const todo = draft.todos[index]
    if (!todo) return
    perform({ type: 'removeTodo', index, todo: { ...todo } })
  }

  function undo(): boolean {
    commitTyping()
    const op = history.undo()
    if (!op) return false
    applyOp(draft, invertOp(op))
    return true
  }

  function redo(): boolean {
    commitTyping()
    const op = history.redo()
    if (!op) return false
    applyOp(draft, op)
    return true
  }

  return {
    noteId,
    baseUpdatedAt,
    base,
    draft,
    history,
    isNew,
    isDirty,
    canUndo,
    canRedo,
    open,
    restore,
    markSaved,
    discard,
    detach,
    hasPendingIn,
    commitTyping,
    setTitle,
    setTodoText,
    setColor,
    toggleTodo,
    addTodo,
    removeTodo,
    undo,
    redo,
  }
})
