<script setup lang="ts">
import { useEditorStore } from '~/stores/editor'
import { FIELD_NEW_ITEM, FIELD_TITLE, focusField, todoField } from '~/composables/note-editor/fields'

const editor = useEditorStore()

function focusRow(index: number): void {
  const todo = editor.draft.todos[index]
  if (todo) focusField(todoField(todo.id))
}

function splitAt(index: number): void {
  editor.addTodo('', index + 1)
  focusRow(index + 1)
}

function removeAt(index: number, focusPrev: boolean): void {
  const todo = editor.draft.todos[index]
  if (!todo) return
  editor.removeTodo(todo.id)
  if (!focusPrev) return
  if (index > 0) focusRow(index - 1)
  else focusField(FIELD_TITLE)
}

function navigate(index: number, dir: -1 | 1): void {
  const target = index + dir
  if (target < 0) focusField(FIELD_TITLE)
  else if (target >= editor.draft.todos.length) focusField(FIELD_NEW_ITEM)
  else focusRow(target)
}
</script>

<template>
  <TransitionGroup tag="ul" name="row" class="todos" aria-label="Список задач">
    <TodoEditorRow
      v-for="(todo, index) in editor.draft.todos"
      :key="todo.id"
      :todo="todo"
      :index="index"
      @toggle="editor.toggleTodo(todo.id)"
      @input="editor.setTodoText(todo.id, $event)"
      @commit="editor.commitTyping()"
      @remove="removeAt(index, false)"
      @remove-empty="removeAt(index, true)"
      @split="splitAt(index)"
      @navigate="navigate(index, $event)"
    />
  </TransitionGroup>
</template>

<style scoped lang="scss" src="./NoteTodoList.scss"></style>
