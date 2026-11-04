import type { Charge } from '../../api/contract'
import { StatusBadge } from '../../components/ui/status-badge'
import { chargeStatusLabel, paymentMethodLabel } from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate } from '../../lib/format-date'
import { ChargeAttempts } from './charge-attempts'
import { chargeOutcome, hasDeclines } from './charge-outcome'

export function ChargeItem({ charge }: { charge: Charge }) {
  const outcome = chargeOutcome(charge)

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge {...chargeStatusLabel(charge.status)} />
          <span className="font-medium">
            {paymentMethodLabel(charge.method)}
          </span>
          <span className="text-fg-muted whitespace-nowrap tabular-nums">
            {formatDate(charge.dueDate)}
          </span>
        </div>
        <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">
          {formatCurrency(charge.amountCents)}
        </span>
      </div>
      {hasDeclines(charge) && <ChargeAttempts attempts={charge.attempts} />}
      {outcome && <p className="text-fg-muted">{outcome}</p>}
    </li>
  )
}
