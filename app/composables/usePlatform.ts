export function useModKey(): string {
  const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  return isApple ? '⌘' : 'Ctrl'
}
