<script setup lang="ts">
import { useModKey } from '~/composables/usePlatform'

defineProps<{
  canUndo: boolean
  canRedo: boolean
  isNew: boolean
  isDirty: boolean
}>()

defineEmits<{ undo: []; redo: []; delete: []; cancel: []; save: [] }>()

const mod = useModKey()
</script>

<template>
  <nav class="toolbar" aria-label="Действия с заметкой">
    <div class="toolbar__group">
      <BaseButton to="/" variant="ghost" icon="back" icon-only label="К списку заметок" class="toolbar__back" />
      <BaseButton
        icon="undo"
        icon-only
        label="Отменить изменение"
        :shortcut="`${mod}+Z`"
        :disabled="!canUndo"
        @click="$emit('undo')"
      />
      <BaseButton
        icon="redo"
        icon-only
        label="Повторить изменение"
        :shortcut="`${mod}+Shift+Z`"
        :disabled="!canRedo"
        @click="$emit('redo')"
      />
    </div>
    <div class="toolbar__group toolbar__group--end">
      <BaseButton
        v-if="!isNew"
        variant="ghost"
        icon="trash"
        label="Удалить"
        class="toolbar__delete"
        @click="$emit('delete')"
      />
      <BaseButton :disabled="!isDirty" label="Отменить" @click="$emit('cancel')" />
      <BaseButton variant="primary" icon="check" :shortcut="`${mod}+S`" label="Сохранить" @click="$emit('save')" />
    </div>
  </nav>
</template>

<style scoped lang="scss" src="./NoteEditorToolbar.scss"></style>
