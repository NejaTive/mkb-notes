<script setup lang="ts">
import { useModKey } from '~/composables/usePlatform'

const mod = useModKey()
</script>

<template>
  <p class="hints" aria-hidden="true">
    <kbd>Enter</kbd> — новый пункт · <kbd>Backspace</kbd> в пустом — удалить · <kbd>{{ mod }}+Z</kbd> /
    <kbd>{{ mod }}+Shift+Z</kbd> — отмена и повтор · <kbd>{{ mod }}+S</kbd> — сохранить
  </p>
</template>

<style scoped lang="scss" src="./EditorHints.scss"></style>
