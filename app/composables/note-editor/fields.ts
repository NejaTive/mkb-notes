import { nextTick } from 'vue'
import type { TextField } from '~/stores/editor'

export const FIELD_TITLE = 'title'
export const FIELD_NEW_ITEM = 'new'
export const todoField = (id: string) => `todo:${id}`

export function focusField(key: string): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>(`[data-field="${CSS.escape(key)}"]`)?.focus()
  })
}

export function parseField(target: EventTarget | null): TextField | 'new' | null {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return null
  const raw = target.dataset.field
  if (raw === FIELD_TITLE) return { kind: 'title' }
  if (raw === FIELD_NEW_ITEM) return 'new'
  if (raw?.startsWith('todo:')) return { kind: 'todo', id: raw.slice(5) }
  return null
}
