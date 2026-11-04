import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { subscriptionsApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { notify } from '../../components/toast/toast-queue'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'

type CancelSubscriptionDialogProps = {
  customerId: string
  subscriptionId: string
  planName: string
}

export function CancelSubscriptionDialog({
  customerId,
  subscriptionId,
  planName,
}: CancelSubscriptionDialogProps) {
  const [isOpen, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const cancel = useMutation({
    mutationFn: () => subscriptionsApi.cancel(subscriptionId),
    onSuccess: async () => {
      await invalidateAfter(queryClient, {
        type: 'subscription-canceled',
        customerId,
        subscriptionId,
      })
      notify.success(
        'Subscription canceled',
        `${planName} will not be billed again.`,
      )
      setOpen(false)
    },
  })

  return (
    <>
      <Button
        variant="danger"
        onPress={() => setOpen(true)}
        className="h-8 self-start px-2.5 whitespace-nowrap"
      >
        Cancel subscription
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setOpen}
        title={`Cancel the ${planName} subscription?`}
        role="alertdialog"
        isDismissable={!cancel.isPending}
      >
        <p className="text-fg-muted">
          Scheduled retries stop and the customer is not billed again. Paid
          charges stay in the history. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            autoFocus
            onPress={() => setOpen(false)}
            isDisabled={cancel.isPending}
          >
            Keep subscription
          </Button>
          <Button
            variant="danger"
            isPending={cancel.isPending}
            onPress={() => cancel.mutate()}
          >
            {cancel.isPending ? 'Canceling…' : 'Cancel subscription'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
