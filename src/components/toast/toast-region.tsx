import {
  CircleAlert,
  CircleCheck,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion,
} from 'react-aria-components'
import { toastQueue, type ToastTone } from './toast-queue'

const toneIcon: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  success: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-accent' },
}

export function AppToastRegion() {
  return (
    <ToastRegion
      queue={toastQueue}
      className="fixed right-4 bottom-4 z-40 flex w-[min(24rem,calc(100vw-2rem))] flex-col-reverse gap-2 outline-none"
    >
      {({ toast }) => {
        const { icon: Icon, className } = toneIcon[toast.content.tone]
        return (
          <Toast
            toast={toast}
            style={{ viewTransitionName: toast.key }}
            className="border-border bg-surface shadow-panel flex items-start gap-3 rounded-lg border p-3.5 outline-none"
          >
            <Icon
              aria-hidden
              size={18}
              strokeWidth={1.75}
              className={`mt-px shrink-0 ${className}`}
            />
            <ToastContent className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Text slot="title" className="font-medium">
                {toast.content.title}
              </Text>
              {toast.content.description && (
                <Text slot="description" className="text-fg-muted">
                  {toast.content.description}
                </Text>
              )}
            </ToastContent>
            <Button
              slot="close"
              aria-label="Dismiss"
              className="text-fg-subtle hover:bg-surface-muted hover:text-fg -m-1 grid size-7 shrink-0 cursor-default place-items-center rounded-md transition-colors"
            >
              <X aria-hidden size={15} strokeWidth={1.75} />
            </Button>
          </Toast>
        )
      }}
    </ToastRegion>
  )
}
