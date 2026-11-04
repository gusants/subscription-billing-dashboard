import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useOptimistic, useTransition } from 'react'
import type { Charge, ChargeRetryResult } from '../../api/contract'
import { chargesApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { notify } from '../../components/toast/toast-queue'
import { declineReasonLabel } from '../../lib/billing-labels'

export type ChargeView = Charge & { isRetrying: boolean }

export function canRetry(charge: Charge) {
  return charge.status === 'failed' && charge.method === 'card'
}

function announce({ charge }: ChargeRetryResult) {
  const attempt = charge.attempts.at(-1)
  if (attempt?.result === 'succeeded') {
    notify.success(
      'Payment approved',
      'The retry succeeded and the subscription is active again.',
    )
    return
  }
  notify.error(
    'Retry declined',
    declineReasonLabel(attempt?.failureReason ?? ''),
  )
}

export function useOptimisticRetry(customerId: string, charges: Charge[]) {
  const queryClient = useQueryClient()
  const retry = useMutation({ mutationFn: chargesApi.retry })
  const [, startTransition] = useTransition()
  const confirmed = useMemo(
    () => charges.map((charge) => ({ ...charge, isRetrying: false })),
    [charges],
  )
  const [views, markRetrying] = useOptimistic(
    confirmed,
    (state, chargeId: string) =>
      state.map((charge) =>
        charge.id === chargeId ? { ...charge, isRetrying: true } : charge,
      ),
  )

  function retryCharge(chargeId: string) {
    startTransition(async () => {
      markRetrying(chargeId)
      try {
        const result = await retry.mutateAsync(chargeId)
        await invalidateAfter(queryClient, {
          type: 'charge-retried',
          customerId,
        })
        announce(result)
      } catch {
        return
      }
    })
  }

  return { charges: views, retryCharge }
}
