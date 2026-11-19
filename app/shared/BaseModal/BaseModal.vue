<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import type { NoteColor } from '~/types/note'
import { useFocusTrap } from '~/composables/useFocusTrap'
import { useModalStack } from '~/composables/useModalStack'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    color?: NoteColor
    role?: 'dialog' | 'alertdialog'
    persistent?: boolean
  }>(),
  { color: 'yellow', role: 'dialog', persistent: false },
)

const emit = defineEmits<{ close: [] }>()

const id = useId()
const titleId = `${id}-title`
const bodyId = `${id}-body`
const dialog = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.open)
const { onKeydown: trapTab } = useFocusTrap(dialog, isOpen)
const stack = useModalStack()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('close')
    return
  }
  trapTab(event)
}

function onBackdrop(): void {
  if (!props.persistent) emit('close')
}

let locked = false
function lock(value: boolean): void {
  if (value === locked) return
  locked = value
  if (value) stack.push()
  else stack.pop()
  document.documentElement.style.overflow = stack.isAnyOpen.value ? 'hidden' : ''
}

watch(isOpen, lock, { immediate: true })
onBeforeUnmount(() => lock(false))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" data-modal-root @keydown="onKeydown">
        <div class="modal__backdrop" aria-hidden="true" @click="onBackdrop" />
        <div
          ref="dialog"
          class="modal__dialog"
          :role="role"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="$slots.default ? bodyId : undefined"
          tabindex="-1"
        >
          <StickerPaper :color="color" :tilt="-0.8" class="modal__paper">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <div v-if="$slots.default" :id="bodyId" class="modal__body">
              <slot />
            </div>
            <div class="modal__actions">
              <slot name="actions" />
            </div>
          </StickerPaper>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss" src="./BaseModal.scss"></style>
