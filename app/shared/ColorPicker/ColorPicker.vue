<script setup lang="ts">
import { NOTE_COLORS, type NoteColor } from '~/types/note'

defineProps<{ modelValue: NoteColor; name?: string }>()
const emit = defineEmits<{ 'update:modelValue': [NoteColor] }>()

const labels: Record<NoteColor, string> = {
  yellow: 'Жёлтый',
  pink: 'Розовый',
  green: 'Зелёный',
  blue: 'Голубой',
  orange: 'Оранжевый',
  violet: 'Сиреневый',
}
</script>

<template>
  <fieldset class="colors">
    <legend class="visually-hidden">Цвет стикера</legend>
    <label
      v-for="color in NOTE_COLORS"
      :key="color"
      class="colors__item"
      :class="`paper--${color}`"
      :title="labels[color]"
    >
      <input
        class="colors__input"
        type="radio"
        :name="name ?? 'note-color'"
        :value="color"
        :checked="modelValue === color"
        :aria-label="labels[color]"
        @change="emit('update:modelValue', color)"
      />
      <span class="colors__swatch" aria-hidden="true" />
    </label>
  </fieldset>
</template>

<style scoped lang="scss" src="./ColorPicker.scss"></style>
