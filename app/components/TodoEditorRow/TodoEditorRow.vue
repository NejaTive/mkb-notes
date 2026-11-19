<script setup lang="ts">
import { ref } from 'vue'
import type { TodoItem } from '~/types/note'

const props = defineProps<{ todo: TodoItem; index: number }>()
const emit = defineEmits<{
  toggle: []
  input: [string]
  commit: []
  remove: []
  split: []
  removeEmpty: []
  navigate: [-1 | 1]
}>()

const input = ref<HTMLInputElement | null>(null)

function onKeydown(event: KeyboardEvent): void {
  if (event.isComposing) return
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('split')
  } else if (event.key === 'Backspace' && props.todo.text === '') {
    event.preventDefault()
    emit('removeEmpty')
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    emit('navigate', event.key === 'ArrowUp' ? -1 : 1)
  }
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <li class="row" :class="{ 'is-done': todo.done }">
    <AppCheckbox :checked="todo.done" :label="`Выполнено: ${todo.text || 'пустой пункт'}`" @toggle="emit('toggle')" />
    <input
      ref="input"
      class="row__input"
      type="text"
      :value="todo.text"
      :data-field="`todo:${todo.id}`"
      :aria-label="`Пункт ${index + 1}`"
      placeholder="Пустой пункт — удалится при сохранении"
      maxlength="500"
      enterkeyhint="next"
      @input="emit('input', ($event.target as HTMLInputElement).value)"
      @blur="emit('commit')"
      @keydown="onKeydown"
    />
    <BaseButton
      class="row__remove"
      variant="ghost"
      size="sm"
      icon="close"
      icon-only
      :label="`Удалить пункт ${index + 1}`"
      @click="emit('remove')"
    />
  </li>
</template>

<style scoped lang="scss" src="./TodoEditorRow.scss"></style>
