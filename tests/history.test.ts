import { describe, expect, it } from 'vitest'
import { UndoHistory } from '~/utils/history'
import { applyOp, invertOp, type NoteOp } from '~/utils/noteOps'
import type { NoteContent } from '~/types/note'

describe('UndoHistory', () => {
  it('undo/redo в правильном порядке', () => {
    const h = new UndoHistory<number>()
    h.record(1)
    h.record(2)
    expect(h.undo()).toBe(2)
    expect(h.undo()).toBe(1)
    expect(h.undo()).toBeUndefined()
    expect(h.redo()).toBe(1)
    expect(h.redo()).toBe(2)
    expect(h.redo()).toBeUndefined()
  })

  it('новое изменение после undo очищает redo-ветку', () => {
    const h = new UndoHistory<string>()
    h.record('a')
    h.record('b')
    h.undo()
    expect(h.canRedo).toBe(true)
    h.record('c')
    expect(h.canRedo).toBe(false)
    expect(h.past).toEqual(['a', 'c'])
  })

  it('ограничивает историю лимитом, отбрасывая самые старые шаги', () => {
    const h = new UndoHistory<number>(50)
    for (let i = 1; i <= 60; i++) h.record(i)
    expect(h.past).toHaveLength(50)
    expect(h.past[0]).toBe(11)
    let count = 0
    while (h.undo() !== undefined) count++
    expect(count).toBe(50)
  })

  it('clear сбрасывает обе ветки', () => {
    const h = new UndoHistory<number>()
    h.record(1)
    h.record(2)
    h.undo()
    h.clear()
    expect(h.canUndo).toBe(false)
    expect(h.canRedo).toBe(false)
  })

  it('не принимает некорректный лимит', () => {
    expect(() => new UndoHistory(0)).toThrow(RangeError)
  })
})

describe('операции над заметкой', () => {
  const make = (): NoteContent => ({
    title: 'Заметка',
    color: 'yellow',
    todos: [
      { id: 'a', text: 'Первый', done: false },
      { id: 'b', text: 'Второй', done: true },
    ],
  })

  const ops: NoteOp[] = [
    { type: 'setTitle', from: 'Заметка', to: 'Новое' },
    { type: 'setColor', from: 'yellow', to: 'pink' },
    { type: 'setTodoText', id: 'a', from: 'Первый', to: 'Изменён' },
    { type: 'setTodoDone', id: 'b', from: true, to: false },
    { type: 'addTodo', index: 1, todo: { id: 'c', text: 'Вставка', done: false } },
    { type: 'removeTodo', index: 0, todo: { id: 'a', text: 'Первый', done: false } },
  ]

  it.each(ops)('$type: применение и обратная операция возвращают исходное состояние', (op) => {
    const content = make()
    applyOp(content, op)
    expect(content).not.toEqual(make())
    applyOp(content, invertOp(op))
    expect(content).toEqual(make())
  })

  it('addTodo вставляет в указанную позицию', () => {
    const content = make()
    applyOp(content, ops[4]!)
    expect(content.todos.map((t) => t.id)).toEqual(['a', 'c', 'b'])
  })

  it('removeTodo при откате возвращает пункт на прежнее место', () => {
    const content = make()
    const op: NoteOp = { type: 'removeTodo', index: 1, todo: { id: 'b', text: 'Второй', done: true } }
    applyOp(content, op)
    expect(content.todos.map((t) => t.id)).toEqual(['a'])
    applyOp(content, invertOp(op))
    expect(content.todos).toEqual(make().todos)
  })

  it('операции текста/чекбокса хранят дельту, а не копию заметки', () => {
    const op: NoteOp = { type: 'setTodoDone', id: 'a', from: false, to: true }
    expect(Object.keys(op)).not.toContain('todos')
    expect(JSON.stringify(op).length).toBeLessThan(80)
  })
})
