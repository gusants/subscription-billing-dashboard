import type { ReactNode } from 'react'
import {
  Dialog,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
} from 'react-aria-components'

type ModalProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  role?: 'dialog' | 'alertdialog'
  isDismissable?: boolean
  children: ReactNode
}

export function Modal({
  isOpen,
  onOpenChange,
  title,
  role = 'dialog',
  isDismissable = true,
  children,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      className="bg-fg/30 fixed inset-0 z-50 grid place-items-center p-4"
    >
      <AriaModal className="border-border bg-surface shadow-panel w-full max-w-md rounded-lg border">
        <Dialog role={role} className="flex flex-col gap-4 p-5 outline-none">
          <Heading slot="title" className="text-base font-semibold">
            {title}
          </Heading>
          {children}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
