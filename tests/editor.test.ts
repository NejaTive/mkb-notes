import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { HISTORY_LIMIT, TYPING_COMMIT_DELAY, useEditorStore } from '~/stores/editor'
import type { Note } from '~/types/note'

const note = (): Note => ({
  id: 'n1',
  title: 'Список',
  color: 'yellow',
  todos: [
    { id: 't1', text: 'Хлеб', done: false },
    { id: 't2', text: 'Молоко', done: false },
  ],
  createdAt: 1,
  updatedAt: 1,
})

function type(set: (v: string) => void, from: string, text: string) {
  let value = from
  for (const ch of text) {
    value += ch
    set(value)
  }
}

describe('editor store: история изменений', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('непрерывный ввод в одно поле — одна запись истории (по паузе)', () => {
    const editor = useEditorStore()
    editor.open(note())
    type(editor.setTitle, 'Список', ' покупок')
    expect(editor.history.past).toHaveLength(0)
    vi.advanceTimersByTime(TYPING_COMMIT_DELAY)
    expect(editor.history.past).toHaveLength(1)
    expect(editor.history.past[0]).toEqual({ type: 'setTitle', from: 'Список', to: 'Список покупок' })
  })

  it('фиксация по blur (commitTyping) без ожидания паузы', () => {
    const editor = useEditorStore()
    editor.open(note())
    type((v) => editor.setTodoText('t1', v), 'Хлеб', ' белый')
    editor.commitTyping()
    expect(editor.history.past).toEqual([{ type: 'setTodoText', id: 't1', from: 'Хлеб', to: 'Хлеб белый' }])
  })

  it('ввод с паузами — отдельные записи', () => {
    const editor = useEditorStore()
    editor.open(note())
    type(editor.setTitle, 'Список', ' А')
    vi.advanceTimersByTime(TYPING_COMMIT_DELAY)
    type(editor.setTitle, 'Список А', ' Б')
    vi.advanceTimersByTime(TYPING_COMMIT_DELAY)
    expect(editor.history.past).toHaveLength(2)
    editor.undo()
    expect(editor.draft.title).toBe('Список А')
  })

  it('переход к другому полю фиксирует предыдущий ввод', () => {
    const editor = useEditorStore()
    editor.open(note())
    type(editor.setTitle, 'Список', '!')
    type((v) => editor.setTodoText('t2', v), 'Молоко', '!')
    expect(editor.history.past).toHaveLength(1)
    editor.commitTyping()
    expect(editor.history.past).toHaveLength(2)
  })

  it('ввод, вернувший исходное значение, не создаёт запись', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.setTitle('Списокx')
    editor.setTitle('Список')
    editor.commitTyping()
    expect(editor.history.past).toHaveLength(0)
  })

  it('чекбокс, добавление и удаление пункта — атомарные записи', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.toggleTodo('t1')
    const added = editor.addTodo('Сыр')
    editor.removeTodo('t2')
    expect(editor.history.past.map((op) => op.type)).toEqual(['setTodoDone', 'addTodo', 'removeTodo'])

    editor.undo()
    expect(editor.draft.todos.map((t) => t.id)).toEqual(['t1', 't2', added.id])
    editor.undo()
    expect(editor.draft.todos.map((t) => t.id)).toEqual(['t1', 't2'])
    editor.undo()
    expect(editor.draft.todos[0]!.done).toBe(false)
    expect(editor.isDirty).toBe(false)

    editor.redo()
    editor.redo()
    editor.redo()
    expect(editor.draft.todos.map((t) => t.text)).toEqual(['Хлеб', 'Сыр'])
    expect(editor.draft.todos[0]!.done).toBe(true)
  })

  it('undo во время набора сначала фиксирует набранное, затем откатывает его', () => {
    const editor = useEditorStore()
    editor.open(note())
    type(editor.setTitle, 'Список', '123')
    expect(editor.canUndo).toBe(true)
    editor.undo()
    expect(editor.draft.title).toBe('Список')
    expect(editor.canRedo).toBe(true)
    editor.redo()
    expect(editor.draft.title).toBe('Список123')
  })

  it('новое изменение после undo очищает redo', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.toggleTodo('t1')
    editor.undo()
    expect(editor.canRedo).toBe(true)
    editor.toggleTodo('t2')
    expect(editor.canRedo).toBe(false)
    expect(editor.redo()).toBe(false)
  })

  it('набор текста после undo тоже очищает redo', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.toggleTodo('t1')
    editor.undo()
    editor.setTitle('Другое')
    expect(editor.canRedo).toBe(false)
    editor.commitTyping()
    expect(editor.history.future).toHaveLength(0)
  })

  it(`история ограничена ${HISTORY_LIMIT} шагами`, () => {
    const editor = useEditorStore()
    editor.open(note())
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) editor.toggleTodo('t1')
    expect(editor.history.past).toHaveLength(HISTORY_LIMIT)
    let steps = 0
    while (editor.undo()) steps++
    expect(steps).toBe(HISTORY_LIMIT)
  })

  it('сохранение и отмена редактирования сбрасывают историю', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.toggleTodo('t1')
    editor.setColor('green')
    editor.discard()
    expect(editor.canUndo).toBe(false)
    expect(editor.draft.color).toBe('yellow')
    expect(editor.isDirty).toBe(false)

    editor.toggleTodo('t1')
    const saved: Note = { ...note(), todos: editor.draft.todos.map((t) => ({ ...t })), updatedAt: 5 }
    editor.markSaved(saved)
    expect(editor.canUndo).toBe(false)
    expect(editor.canRedo).toBe(false)
    expect(editor.isDirty).toBe(false)
    expect(editor.baseUpdatedAt).toBe(5)
  })

  it('hasPendingIn сообщает о незафиксированном вводе в конкретном поле', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.setTodoText('t1', 'Хлебx')
    expect(editor.hasPendingIn({ kind: 'todo', id: 't1' })).toBe(true)
    expect(editor.hasPendingIn({ kind: 'title' })).toBe(false)
    vi.advanceTimersByTime(TYPING_COMMIT_DELAY)
    expect(editor.hasPendingIn({ kind: 'todo', id: 't1' })).toBe(false)
  })

  it('isDirty отражает отличие черновика от исходной заметки', () => {
    const editor = useEditorStore()
    editor.open(note())
    expect(editor.isDirty).toBe(false)
    editor.setColor('blue')
    expect(editor.isDirty).toBe(true)
    editor.undo()
    expect(editor.isDirty).toBe(false)
  })

  it('restore подставляет черновик и начинает историю заново', () => {
    const editor = useEditorStore()
    editor.open(note())
    editor.toggleTodo('t1')
    editor.restore({ title: 'Из черновика', color: 'pink', todos: [] })
    expect(editor.draft.title).toBe('Из черновика')
    expect(editor.isDirty).toBe(true)
    expect(editor.canUndo).toBe(false)
  })
})
