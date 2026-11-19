import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PERSIST_DELAY, useNotesStore } from '~/stores/notes'
import { NOTES_KEY, SCHEMA_VERSION, draftKey, loadDraft, migrate, removeDraft, saveDraft } from '~/utils/storage'
import { UNTITLED } from '~/utils/note'

const stored = () => JSON.parse(localStorage.getItem(NOTES_KEY) ?? 'null')

describe('notes store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('пустое хранилище без демо — пустой список', () => {
    const store = useNotesStore()
    store.hydrate()
    expect(store.notes).toEqual([])
    expect(store.hydrated).toBe(true)
  })

  it('при первом запуске может засеять демо-заметки', () => {
    const store = useNotesStore()
    store.hydrate({ seedDemo: true })
    expect(store.notes.length).toBeGreaterThan(0)
  })

  it('пишет в хранилище не на каждое изменение, а пачкой — с версией схемы', () => {
    const store = useNotesStore()
    store.hydrate()
    const setItem = vi.spyOn(localStorage, 'setItem')
    store.create({ title: 'A', color: 'yellow', todos: [] })
    store.create({ title: 'B', color: 'pink', todos: [] })
    store.create({ title: 'C', color: 'blue', todos: [] })
    expect(setItem).not.toHaveBeenCalled()
    vi.advanceTimersByTime(PERSIST_DELAY)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(stored().version).toBe(SCHEMA_VERSION)
    expect(stored().notes).toHaveLength(3)
    setItem.mockRestore()
  })

  it('данные переживают «перезагрузку»', () => {
    const first = useNotesStore()
    first.hydrate()
    const note = first.create({ title: 'Живу', color: 'green', todos: [{ id: 'x', text: 'пункт', done: true }] })
    first.flush()

    setActivePinia(createPinia())
    const second = useNotesStore()
    second.hydrate({ seedDemo: true })
    expect(second.notes).toHaveLength(1)
    expect(second.getById(note.id)?.todos[0]).toEqual({ id: 'x', text: 'пункт', done: true })
  })

  it('нормализует пустое название и пустые пункты при сохранении', () => {
    const store = useNotesStore()
    store.hydrate()
    const note = store.create({
      title: '   ',
      color: 'yellow',
      todos: [
        { id: '1', text: '  ', done: false },
        { id: '2', text: ' Дело ', done: false },
      ],
    })
    expect(note.title).toBe(UNTITLED)
    expect(note.todos).toEqual([{ id: '2', text: 'Дело', done: false }])
  })

  it('save обновляет существующую заметку и её updatedAt', () => {
    const store = useNotesStore()
    store.hydrate()
    const note = store.create({ title: 'A', color: 'yellow', todos: [] })
    vi.setSystemTime(note.updatedAt + 1000)
    const saved = store.save(note.id, { title: 'B', color: 'pink', todos: [] })
    expect(store.notes).toHaveLength(1)
    expect(saved.title).toBe('B')
    expect(saved.updatedAt).toBeGreaterThan(saved.createdAt)
  })

  it('save пересоздаёт заметку, если её удалили (например, в другой вкладке)', () => {
    const store = useNotesStore()
    store.hydrate()
    const note = store.create({ title: 'A', color: 'yellow', todos: [] })
    store.remove(note.id)
    store.save(note.id, { title: 'A2', color: 'yellow', todos: [] })
    expect(store.getById(note.id)?.title).toBe('A2')
  })

  it('remove удаляет заметку и её черновик; несуществующий id — без ошибки', () => {
    const store = useNotesStore()
    store.hydrate()
    const note = store.create({ title: 'A', color: 'yellow', todos: [] })
    saveDraft({ noteId: note.id, baseUpdatedAt: note.updatedAt, content: { title: 'X', color: 'yellow', todos: [] } })
    expect(store.remove(note.id)).toBe(true)
    expect(localStorage.getItem(draftKey(note.id))).toBeNull()
    expect(store.remove('missing')).toBe(false)
  })

  it('sorted — сначала недавно изменённые', () => {
    const store = useNotesStore()
    store.hydrate()
    vi.setSystemTime(1000)
    const a = store.create({ title: 'A', color: 'yellow', todos: [] })
    vi.setSystemTime(2000)
    const b = store.create({ title: 'B', color: 'yellow', todos: [] })
    expect(store.sorted.map((n) => n.id)).toEqual([b.id, a.id])
  })

  it('syncFromStorage подхватывает изменения другой вкладки', () => {
    const store = useNotesStore()
    store.hydrate()
    const note = store.create({ title: 'A', color: 'yellow', todos: [] })
    store.flush()
    localStorage.setItem(NOTES_KEY, JSON.stringify({ version: SCHEMA_VERSION, notes: [] }))
    store.syncFromStorage()
    expect(store.getById(note.id)).toBeUndefined()
  })

  it('повреждённые данные не ломают приложение и уходят в резервную копию', () => {
    localStorage.setItem(NOTES_KEY, '{oops')
    const store = useNotesStore()
    store.hydrate({ seedDemo: true })
    expect(store.notes).toEqual([])
    const backups = Object.keys(localStorage).filter((k) => k.startsWith(`${NOTES_KEY}:backup-`))
    expect(backups).toHaveLength(1)
  })

  it('ошибка записи (переполнение хранилища) не роняет стор', () => {
    const store = useNotesStore()
    store.hydrate()
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    store.create({ title: 'A', color: 'yellow', todos: [] })
    store.flush()
    expect(store.persistError).toBe(true)
    expect(store.notes).toHaveLength(1)
    setItem.mockRestore()
  })
})

describe('storage: схема и черновики', () => {
  beforeEach(() => localStorage.clear())

  it('мигрирует данные версии 0 (массив без обёртки) и чинит невалидные поля', () => {
    const result = migrate([
      { id: 'a', title: 'Старая', todos: [{ id: 't', text: 'x', done: 1 }, { bad: true }] },
      'мусор',
    ])
    expect(result?.migrated).toBe(true)
    expect(result?.notes).toHaveLength(1)
    expect(result?.notes[0]).toMatchObject({
      id: 'a',
      title: 'Старая',
      color: 'yellow',
      todos: [{ id: 't', text: 'x', done: false }],
    })
  })

  it('не трогает данные из более новой версии схемы', () => {
    expect(migrate({ version: SCHEMA_VERSION + 1, notes: [] })).toBeNull()
  })

  it('черновик сохраняется и читается с версией схемы', () => {
    saveDraft({ noteId: null, baseUpdatedAt: null, content: { title: 'Черновик', color: 'blue', todos: [] } })
    const draft = loadDraft(null)
    expect(draft?.version).toBe(SCHEMA_VERSION)
    expect(draft?.content.title).toBe('Черновик')
    removeDraft(null)
    expect(loadDraft(null)).toBeNull()
  })
})
