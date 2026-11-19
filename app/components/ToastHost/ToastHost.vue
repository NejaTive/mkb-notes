<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        class="toast"
        :class="`toast--${toast.tone}`"
        aria-label="Скрыть уведомление"
        @click="dismiss(toast.id)"
      >
        <AppIcon :name="toast.tone === 'warning' ? 'alert' : 'check'" :size="18" />
        <span>{{ toast.text }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss" src="./ToastHost.scss"></style>
