<script setup lang="ts">
export type IconName =
  'plus' | 'edit' | 'trash' | 'undo' | 'redo' | 'check' | 'close' | 'back' | 'save' | 'alert' | 'list'

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 20 })

const paths: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  redo: 'm15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3',
  check: 'm5 12.5 4.5 4.5L19 7',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M15 5l-7 7 7 7',
  save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  alert: 'M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
}
</script>

<template>
  <svg
    class="icon"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[props.name]" />
  </svg>
</template>

<style scoped lang="scss" src="./AppIcon.scss"></style>
