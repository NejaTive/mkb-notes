export interface Debounced {
  (): void
  flush: () => void
  cancel: () => void
  readonly pending: boolean
}

export function debounce(fn: () => void, wait: number): Debounced {
  let timer: ReturnType<typeof setTimeout> | null = null

  const run = () => {
    timer = null
    fn()
  }

  const debounced = (() => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(run, wait)
  }) as Debounced

  debounced.flush = () => {
    if (timer === null) return
    clearTimeout(timer)
    run()
  }
  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }
  Object.defineProperty(debounced, 'pending', { get: () => timer !== null })
  return debounced
}
