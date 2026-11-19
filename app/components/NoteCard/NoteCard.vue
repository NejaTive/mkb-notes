<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '~/types/note'
import { tiltFor } from '~/utils/note'

const props = defineProps<{ note: Note }>()
defineEmits<{ delete: [Note] }>()

const done = computed(() => props.note.todos.filter((t) => t.done).length)
const total = computed(() => props.note.todos.length)
const editPath = computed(() => `/notes/${props.note.id}`)
const updated = computed(() =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
    props.note.updatedAt,
  ),
)
</script>

<template>
  <StickerPaper tag="article" class="card" :color="note.color" :tilt="tiltFor(note.id)" lift>
    <header class="card__head">
      <h2 class="card__title">
        <NuxtLink :to="editPath" class="card__link">{{ note.title }}</NuxtLink>
      </h2>
      <span
        v-if="total"
        class="card__progress"
        :class="{ 'is-complete': done === total }"
        :aria-label="`Выполнено ${done} из ${total}`"
      >
        {{ done }}/{{ total }}
      </span>
    </header>

    <TodoPreviewList :todos="note.todos" class="card__todos" />

    <footer class="card__foot">
      <time class="card__date" :datetime="new Date(note.updatedAt).toISOString()">{{ updated }}</time>
      <div class="card__actions">
        <BaseButton
          :to="editPath"
          variant="ghost"
          size="sm"
          icon="edit"
          icon-only
          :label="`Изменить «${note.title}»`"
        />
        <BaseButton
          variant="ghost"
          size="sm"
          icon="trash"
          icon-only
          :label="`Удалить «${note.title}»`"
          @click="$emit('delete', note)"
        />
      </div>
    </footer>
  </StickerPaper>
</template>

<style scoped lang="scss" src="./NoteCard.scss"></style>
