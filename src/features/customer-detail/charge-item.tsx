import type { Charge } from '../../api/contract'
import { StatusBadge } from '../../components/ui/status-badge'
import { chargeStatusLabel, paymentMethodLabel } from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate, formatDateTime } from '../../lib/format-date'
import { ChargeAttempts } from './charge-attempts'

function settlementNote(charge: Charge) {
  if (charge.status === 'paid' && charge.paidAt)
    return `Paid ${formatDateTime(charge.paidAt)}`
  if (charge.status === 'pending' && charge.method === 'pix')
    return 'Waiting for the customer to pay the Pix code'
  if (charge.status === 'pending' && charge.method === 'boleto') {
    return `Waiting for boleto payment, due ${formatDate(charge.dueDate)}`
  }
  if (charge.status === 'expired')
    return `${paymentMethodLabel(charge.method)} expired without payment`
  if (charge.status === 'uncollectible')
    return 'Retries exhausted, the subscription was canceled'
  if (charge.status === 'failed') return 'Declined, a retry is scheduled'
  return null
}

function hasDeclines(charge: Charge) {
  return charge.attempts.some((attempt) => attempt.result === 'declined')
}

export function ChargeItem({ charge }: { charge: Charge }) {
  const note = settlementNote(charge)

  return (
    <li className="flex flex-col gap-2.5 px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge {...chargeStatusLabel(charge.status)} />
            <span className="font-medium">
              {paymentMethodLabel(charge.method)}
            </span>
            <span className="text-fg-muted tabular-nums">
              due {formatDate(charge.dueDate)}
            </span>
          </div>
          <span className="text-fg-subtle tabular-nums">
            Period {formatDate(charge.periodStart)} –{' '}
            {formatDate(charge.periodEnd)}
          </span>
        </div>
        <span className="shrink-0 font-semibold tabular-nums">
          {formatCurrency(charge.amountCents)}
        </span>
      </div>
      {hasDeclines(charge) && <ChargeAttempts attempts={charge.attempts} />}
      {note && <p className="text-fg-muted">{note}</p>}
    </li>
  )
}
