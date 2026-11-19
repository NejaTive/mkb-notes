import { shallowRef } from 'vue'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void
}

const current = shallowRef<ConfirmRequest | null>(null)

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    current.value?.resolve(false)
    return new Promise<boolean>((resolve) => {
      current.value = { ...options, resolve }
    })
  }

  function settle(value: boolean): void {
    const request = current.value
    current.value = null
    request?.resolve(value)
  }

  return { current, confirm, settle }
}
