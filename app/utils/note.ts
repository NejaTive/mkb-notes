import { NOTE_COLORS, type Note, type NoteColor, type NoteContent, type TodoItem } from '../types/note'

export const UNTITLED = 'Без названия'

export function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === 'string' && (NOTE_COLORS as readonly string[]).includes(value)
}

export function cloneTodo(todo: TodoItem): TodoItem {
  return { id: todo.id, text: todo.text, done: todo.done }
}

export function cloneContent(content: NoteContent): NoteContent {
  return { title: content.title, color: content.color, todos: content.todos.map(cloneTodo) }
}

export function pickContent(note: Note): NoteContent {
  return cloneContent(note)
}

export function emptyContent(color: NoteColor = 'yellow'): NoteContent {
  return { title: '', color, todos: [] }
}

export function isSameContent(a: NoteContent, b: NoteContent): boolean {
  if (a.title !== b.title || a.color !== b.color || a.todos.length !== b.todos.length) return false
  return a.todos.every((todo, i) => {
    const other = b.todos[i]
    return other !== undefined && todo.id === other.id && todo.text === other.text && todo.done === other.done
  })
}

export function normalizeContent(content: NoteContent): NoteContent {
  const title = content.title.trim()
  return {
    title: title || UNTITLED,
    color: content.color,
    todos: content.todos.map((todo) => ({ ...todo, text: todo.text.trim() })).filter((todo) => todo.text.length > 0),
  }
}

export function isBlankContent(content: NoteContent): boolean {
  return content.title.trim() === '' && content.todos.every((todo) => todo.text.trim() === '')
}

export function tiltFor(id: string, max = 2.4): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  const unit = (((hash % 1000) + 1000) % 1000) / 999 // 0..1
  return Math.round((unit * 2 - 1) * max * 10) / 10
}

export function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}
