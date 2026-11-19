import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('inert') && el.getClientRects().length > 0,
  )
}

export function useFocusTrap(container: Ref<HTMLElement | null>, active: Ref<boolean>) {
  let previouslyFocused: HTMLElement | null = null

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !container.value) return
    const items = focusables(container.value)
    if (items.length === 0) {
      event.preventDefault()
      container.value.focus()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const activeEl = document.activeElement
    if (event.shiftKey && (activeEl === first || !container.value.contains(activeEl))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (activeEl === last || !container.value.contains(activeEl))) {
      event.preventDefault()
      first.focus()
    }
  }

  function onFocusIn(event: FocusEvent): void {
    const root = container.value
    if (!root || root.contains(event.target as Node)) return
    const topmost = Array.from(document.querySelectorAll<HTMLElement>('[data-modal-root]')).pop()
    if (topmost && topmost !== root) return
    ;(focusables(root)[0] ?? root).focus()
  }

  async function activate(): Promise<void> {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.addEventListener('focusin', onFocusIn)
    await nextTick()
    const root = container.value
    if (!root) return
    const target = root.querySelector<HTMLElement>('[data-autofocus]') ?? focusables(root)[0] ?? root
    target.focus()
  }

  function deactivate(): void {
    document.removeEventListener('focusin', onFocusIn)
    const target = previouslyFocused
    previouslyFocused = null
    if (target && document.contains(target)) target.focus()
  }

  watch(
    active,
    (value, old) => {
      if (value) void activate()
      else if (old) deactivate()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (active.value) deactivate()
  })

  return { onKeydown }
}
