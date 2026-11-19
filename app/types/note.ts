export const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'orange', 'violet'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface NoteContent {
  title: string
  color: NoteColor
  todos: TodoItem[]
}

export interface Note extends NoteContent {
  id: string
  createdAt: number
  updatedAt: number
}
