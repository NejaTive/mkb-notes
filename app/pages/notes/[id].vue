<script setup lang="ts">
import { useEditorStore } from '~/stores/editor'
import { useNoteEditorSession } from '~/composables/note-editor/useNoteEditorSession'
import { useNoteEditorHotkeys } from '~/composables/note-editor/useNoteEditorHotkeys'

const editor = useEditorStore()
const { status, error, pageTitle, save, cancelEditing, deleteNote } = useNoteEditorSession()

useNoteEditorHotkeys({ isReady: () => status.value === 'ready', save })
useHead({ title: () => (status.value === 'not-found' ? 'Заметка не найдена' : pageTitle.value) })
</script>

<template>
  <main class="editor">
    <NoteNotFound v-if="status === 'not-found'" />

    <template v-else-if="status === 'ready'">
      <NoteEditorToolbar
        :can-undo="editor.canUndo"
        :can-redo="editor.canRedo"
        :is-new="editor.isNew"
        :is-dirty="editor.isDirty"
        @undo="editor.undo()"
        @redo="editor.redo()"
        @delete="deleteNote"
        @cancel="cancelEditing"
        @save="save"
      />
      <NoteSheet :error="error" />
      <EditorHints />
    </template>
  </main>
</template>

<style scoped lang="scss" src="./[id].scss"></style>
