import { computed, ref } from 'vue'

const openCount = ref(0)

export function useModalStack() {
  return {
    isAnyOpen: computed(() => openCount.value > 0),
    push: () => {
      openCount.value++
    },
    pop: () => {
      openCount.value = Math.max(0, openCount.value - 1)
    },
  }
}
