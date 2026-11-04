import type { Charge } from '../../api/contract'
import {
  declineReasonLabel,
  paymentMethodLabel,
} from '../../lib/billing-labels'
import { formatDate } from '../../lib/format-date'
import { nextRetryDate } from '../../lib/retry-schedule'

export function hasDeclines(charge: Charge) {
  return charge.attempts.some((attempt) => attempt.result === 'declined')
}

export function latestDeclineReason(charge: Charge) {
  const decline = charge.attempts.findLast(
    (attempt) => attempt.result === 'declined',
  )
  return decline ? declineReasonLabel(decline.failureReason ?? '') : null
}

export function chargeOutcome(charge: Charge) {
  switch (charge.status) {
    case 'failed': {
      const retryAt = nextRetryDate(charge)
      return retryAt ? `Next retry ${formatDate(retryAt)}` : 'No retries left'
    }
    case 'pending':
      return charge.method === 'pix'
        ? 'Waiting for the Pix payment'
        : `Waiting for boleto payment, due ${formatDate(charge.dueDate)}`
    case 'expired':
      return `${paymentMethodLabel(charge.method)} expired unpaid`
    case 'uncollectible':
      return 'Retries exhausted, subscription canceled'
    case 'paid':
      return null
  }
}
