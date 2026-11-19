<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { IconName } from '../AppIcon/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'md' | 'sm'
    icon?: IconName
    iconOnly?: boolean
    label?: string
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    disabled?: boolean
    shortcut?: string
  }>(),
  { variant: 'secondary', size: 'md', type: 'button', iconOnly: false, disabled: false },
)

const title = computed(() => {
  if (!props.label) return undefined
  return props.shortcut ? `${props.label} (${props.shortcut})` : props.iconOnly ? props.label : undefined
})
</script>

<template>
  <NuxtLink
    v-if="to && !disabled"
    :to="to"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--icon': iconOnly }]"
    :aria-label="iconOnly ? label : undefined"
    :title="title"
  >
    <AppIcon v-if="icon" :name="icon" :size="size === 'sm' ? 18 : 20" />
    <span v-if="!iconOnly" class="btn__text"
      ><slot>{{ label }}</slot></span
    >
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--icon': iconOnly }]"
    :disabled="disabled"
    :aria-label="iconOnly ? label : undefined"
    :aria-keyshortcuts="shortcut"
    :title="title"
  >
    <AppIcon v-if="icon" :name="icon" :size="size === 'sm' ? 18 : 20" />
    <span v-if="!iconOnly" class="btn__text"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>

<style scoped lang="scss" src="./BaseButton.scss"></style>
