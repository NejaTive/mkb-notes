import type { NoteColor, NoteContent, TodoItem } from '../types/note'
import { cloneTodo } from './note'

export type NoteOp =
  | { type: 'setTitle'; from: string; to: string }
  | { type: 'setColor'; from: NoteColor; to: NoteColor }
  | { type: 'setTodoText'; id: string; from: string; to: string }
  | { type: 'setTodoDone'; id: string; from: boolean; to: boolean }
  | { type: 'addTodo'; index: number; todo: TodoItem }
  | { type: 'removeTodo'; index: number; todo: TodoItem }

export function invertOp(op: NoteOp): NoteOp {
  switch (op.type) {
    case 'setTitle':
    case 'setColor':
    case 'setTodoText':
    case 'setTodoDone':
      return { ...op, from: op.to, to: op.from } as NoteOp
    case 'addTodo':
      return { type: 'removeTodo', index: op.index, todo: op.todo }
    case 'removeTodo':
      return { type: 'addTodo', index: op.index, todo: op.todo }
  }
}

function findTodo(content: NoteContent, id: string): TodoItem | undefined {
  return content.todos.find((todo) => todo.id === id)
}

export function applyOp(content: NoteContent, op: NoteOp): void {
  switch (op.type) {
    case 'setTitle':
      content.title = op.to
      return
    case 'setColor':
      content.color = op.to
      return
    case 'setTodoText': {
      const todo = findTodo(content, op.id)
      if (todo) todo.text = op.to
      return
    }
    case 'setTodoDone': {
      const todo = findTodo(content, op.id)
      if (todo) todo.done = op.to
      return
    }
    case 'addTodo': {
      const index = Math.min(Math.max(op.index, 0), content.todos.length)
      content.todos.splice(index, 0, cloneTodo(op.todo))
      return
    }
    case 'removeTodo': {
      const index = content.todos.findIndex((todo) => todo.id === op.todo.id)
      if (index !== -1) content.todos.splice(index, 1)
    }
  }
}
