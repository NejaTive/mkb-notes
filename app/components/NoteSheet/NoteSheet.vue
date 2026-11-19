<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '~/stores/editor'
import { FIELD_NEW_ITEM, FIELD_TITLE, focusField, todoField } from '~/composables/note-editor/fields'
import { pluralize } from '~/utils/note'

defineProps<{ error?: string }>()

const editor = useEditorStore()
const doneCount = computed(() => editor.draft.todos.filter((t) => t.done).length)

function onTitleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const first = editor.draft.todos[0]
  focusField(first ? todoField(first.id) : FIELD_NEW_ITEM)
}

function focusLastTodo(): void {
  const last = editor.draft.todos.at(-1)
  if (last) focusField(todoField(last.id))
}
</script>

<template>
  <StickerPaper :color="editor.draft.color" :tilt="-0.4" lined class="sheet" tag="section" aria-label="Заметка">
    <div class="sheet__top">
      <ColorPicker :model-value="editor.draft.color" @update:model-value="editor.setColor" />
      <span class="sheet__status" :class="{ 'is-dirty': editor.isDirty }" aria-live="polite">
        {{ editor.isDirty ? 'Есть несохранённые изменения' : editor.isNew ? 'Новая заметка' : '' }}
      </span>
    </div>

    <label class="visually-hidden" for="note-title">Название заметки</label>
    <input
      id="note-title"
      class="sheet__title"
      :class="{ 'has-error': error }"
      type="text"
      :data-field="FIELD_TITLE"
      :value="editor.draft.title"
      placeholder="Название заметки"
      maxlength="120"
      autocomplete="off"
      enterkeyhint="next"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? 'note-error' : undefined"
      @input="editor.setTitle(($event.target as HTMLInputElement).value)"
      @blur="editor.commitTyping()"
      @keydown="onTitleKeydown"
    />
    <p v-if="error" id="note-error" class="sheet__error" role="alert">{{ error }}</p>

    <div class="sheet__meta">
      <span v-if="editor.draft.todos.length">
        Выполнено {{ doneCount }} из {{ editor.draft.todos.length }}
        {{ pluralize(editor.draft.todos.length, ['пункта', 'пунктов', 'пунктов']) }}
      </span>
      <span v-else>Добавьте первый пункт ниже</span>
    </div>

    <NoteTodoList />
    <TodoAddField @add="editor.addTodo($event)" @up="focusLastTodo" />
  </StickerPaper>
</template>

<style scoped lang="scss" src="./NoteSheet.scss"></style>
