<script setup lang="ts">
import type { NoteColor } from '~/types/note'

withDefaults(
  defineProps<{
    color?: NoteColor
    tilt?: number
    tag?: string
    tape?: boolean
    lined?: boolean
    lift?: boolean
  }>(),
  { color: 'yellow', tilt: 0, tag: 'div', tape: true, lined: false, lift: false },
)
</script>

<template>
  <component
    :is="tag"
    class="paper"
    :class="[`paper--${color}`, { 'paper--lined': lined, 'paper--lift': lift }]"
    :style="{ '--tilt': `${tilt}deg` }"
  >
    <span v-if="tape" class="paper__tape" aria-hidden="true" />
    <div class="paper__sheet">
      <slot />
    </div>
  </component>
</template>

<style scoped lang="scss" src="./StickerPaper.scss"></style>
