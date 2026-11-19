<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from '~/composables/useConfirm'

const { current, settle } = useConfirm()
const isDanger = computed(() => current.value?.tone === 'danger')
</script>

<template>
  <BaseModal
    :open="current !== null"
    :title="current?.title ?? ''"
    :color="isDanger ? 'pink' : 'yellow'"
    role="alertdialog"
    @close="settle(false)"
  >
    <p v-if="current?.message">{{ current.message }}</p>
    <template #actions>
      <BaseButton data-autofocus :label="current?.cancelText ?? 'Отмена'" @click="settle(false)" />
      <BaseButton
        :variant="isDanger ? 'danger' : 'primary'"
        :label="current?.confirmText ?? 'Подтвердить'"
        @click="settle(true)"
      />
    </template>
  </BaseModal>
</template>
