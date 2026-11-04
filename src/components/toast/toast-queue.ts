import { flushSync } from 'react-dom'
import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components'

export type ToastTone = 'success' | 'error' | 'info'

export type AppToast = {
  tone: ToastTone
  title: string
  description?: string
}

const TOAST_TIMEOUT_MS = 5000

function withViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    document.startViewTransition(() => flushSync(update))
  } else {
    update()
  }
}

export const toastQueue = new ToastQueue<AppToast>({
  maxVisibleToasts: 3,
  wrapUpdate: withViewTransition,
})

function show(tone: ToastTone, title: string, description?: string) {
  return toastQueue.add(
    { tone, title, description },
    { timeout: TOAST_TIMEOUT_MS },
  )
}

export const notify = {
  success: (title: string, description?: string) =>
    show('success', title, description),
  error: (title: string, description?: string) =>
    show('error', title, description),
  info: (title: string, description?: string) =>
    show('info', title, description),
}
