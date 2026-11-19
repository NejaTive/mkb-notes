<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { pluralize } from '~/utils/note'

useHead({ title: 'Мои заметки :)' })

const notes = useNotesStore()
const { confirm } = useConfirm()
const toast = useToast()

const count = computed(() => notes.notes.length)
const subtitle = computed(() =>
  count.value ? `${count.value} ${pluralize(count.value, ['стикер', 'стикера', 'стикеров'])}` : 'Пока пусто',
)

async function onDelete(note: Note): Promise<void> {
  const ok = await confirm({
    title: 'Удалить заметку?',
    message: `«${note.title}» и все её пункты будут удалены. Это действие нельзя отменить.`,
    confirmText: 'Удалить',
    cancelText: 'Оставить',
    tone: 'danger',
  })
  if (!ok) return
  notes.remove(note.id)
  toast.show('Заметка удалена')
}
</script>

<template>
  <main class="board">
    <header class="board__header">
      <div class="board__label">
        <h1 class="board__title">Мои заметки :)</h1>
        <p class="board__subtitle">{{ subtitle }}</p>
      </div>
    </header>

    <p v-if="notes.persistError" class="board__warning" role="alert">
      Не удалось записать данные в хранилище браузера — изменения могут не сохраниться после перезагрузки.
    </p>

    <TransitionGroup v-if="count" tag="ul" name="stick" class="board__grid" aria-label="Заметки">
      <li v-for="note in notes.sorted" :key="note.id" class="board__cell">
        <NoteCard :note="note" @delete="onDelete" />
      </li>
      <li key="__add" class="board__cell">
        <NuxtLink to="/notes/new" class="add-tile">
          <AppIcon name="plus" :size="34" />
          <span>Приклеить ещё</span>
        </NuxtLink>
      </li>
    </TransitionGroup>

    <div v-else class="board__empty">
      <StickerPaper color="yellow" :tilt="-1.5" class="empty">
        <h2 class="empty__title">Здесь пока пусто</h2>
        <p class="empty__text">Создайте первую заметку — список дел, покупок или идей.</p>
        <BaseButton to="/notes/new" variant="primary" icon="plus">Создать заметку</BaseButton>
      </StickerPaper>
    </div>
  </main>
</template>

<style scoped lang="scss" src="./index.scss"></style>
