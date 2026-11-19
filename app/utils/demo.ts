import type { Note } from '../types/note'
import { createId } from './id'

function todos(items: Array<[string, boolean]>) {
  return items.map(([text, done]) => ({ id: createId(), text, done }))
}

export function createDemoNotes(): Note[] {
  const now = Date.now()
  return [
    {
      id: createId(),
      title: 'Покупки на выходные',
      color: 'yellow',
      todos: todos([
        ['Молоко и хлеб', true],
        ['Яблоки', false],
        ['Кофе в зёрнах', false],
        ['Батарейки AA', false],
        ['Корм коту', true],
        ['Свечи на торт', false],
      ]),
      createdAt: now - 3000,
      updatedAt: now - 3000,
    },
    {
      id: createId(),
      title: 'Подготовка к релизу',
      color: 'blue',
      todos: todos([
        ['Прогнать тесты', true],
        ['Обновить changelog', false],
        ['Собрать Docker-образ', false],
      ]),
      createdAt: now - 2000,
      updatedAt: now - 2000,
    },
    {
      id: createId(),
      title: 'Идеи для отпуска',
      color: 'pink',
      todos: todos([
        ['Карелия на машине', false],
        ['Сплав по реке', false],
      ]),
      createdAt: now - 1000,
      updatedAt: now - 1000,
    },
  ]
}
