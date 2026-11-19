<script setup lang="ts">
import { ref } from 'vue'
import { FIELD_NEW_ITEM } from '~/composables/note-editor/fields'

const emit = defineEmits<{
  add: [string]
  up: []
}>()

const text = ref('')

function submit(): void {
  const value = text.value.trim()
  if (!value) return
  emit('add', value)
  text.value = ''
}

function onKeydown(event: KeyboardEvent): void {
  if (event.isComposing) return
  if (event.key === 'Enter') {
    event.preventDefault()
    submit()
  } else if (event.key === 'ArrowUp' && text.value === '') {
    event.preventDefault()
    emit('up')
  }
}
</script>

<template>
  <form class="add" @submit.prevent="submit">
    <span class="add__icon" aria-hidden="true"><AppIcon name="plus" :size="22" /></span>
    <label class="visually-hidden" for="new-item">Новый пункт</label>
    <input
      id="new-item"
      v-model="text"
      class="add__input"
      type="text"
      :data-field="FIELD_NEW_ITEM"
      placeholder="Новый пункт и Enter"
      maxlength="500"
      autocomplete="off"
      enterkeyhint="done"
      @keydown="onKeydown"
    />
  </form>
</template>

<style scoped lang="scss" src="./TodoAddField.scss"></style>
