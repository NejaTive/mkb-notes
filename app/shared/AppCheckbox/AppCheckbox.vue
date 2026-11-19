<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    checked: boolean
    label: string
    disabled?: boolean
    readonly?: boolean
    size?: 'md' | 'sm'
  }>(),
  { disabled: false, readonly: false, size: 'md' },
)

const emit = defineEmits<{ toggle: [] }>()

function onChange(event: Event): void {
  ;(event.target as HTMLInputElement).checked = props.checked
  if (!props.readonly) emit('toggle')
}
</script>

<template>
  <span
    v-if="readonly"
    class="check check--readonly"
    :class="`check--${size}`"
    role="img"
    :aria-label="`${label}: ${checked ? 'выполнено' : 'не выполнено'}`"
  >
    <span class="check__box" :class="{ 'is-checked': checked }" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 6.5" /></svg>
    </span>
  </span>
  <label v-else class="check" :class="`check--${size}`">
    <input
      class="check__input"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :aria-label="label"
      @change="onChange"
    />
    <span class="check__box" :class="{ 'is-checked': checked }" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 6.5" /></svg>
    </span>
  </label>
</template>

<style scoped lang="scss" src="./AppCheckbox.scss"></style>
