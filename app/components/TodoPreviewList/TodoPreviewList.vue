<script setup lang="ts">
import { computed } from 'vue'
import type { TodoItem } from '~/types/note'
import { pluralize } from '~/utils/note'

const props = withDefaults(defineProps<{ todos: TodoItem[]; limit?: number }>(), { limit: 4 })

const visible = computed(() => props.todos.slice(0, props.limit))
const rest = computed(() => Math.max(0, props.todos.length - props.limit))
</script>

<template>
  <ul v-if="todos.length" class="preview">
    <li v-for="todo in visible" :key="todo.id" class="preview__item" :class="{ 'is-done': todo.done }">
      <AppCheckbox :checked="todo.done" :label="todo.text" readonly size="sm" />
      <span class="preview__text">{{ todo.text }}</span>
    </li>
    <li v-if="rest > 0" class="preview__more">
      и ещё {{ rest }} {{ pluralize(rest, ['пункт', 'пункта', 'пунктов']) }}…
    </li>
  </ul>
  <p v-else class="preview__empty">Пунктов пока нет</p>
</template>

<style scoped lang="scss" src="./TodoPreviewList.scss"></style>
