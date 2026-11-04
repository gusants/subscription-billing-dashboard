import { StatusBadge } from '../../components/ui/status-badge'
import { chargeStatusLabel, paymentMethodLabel } from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate } from '../../lib/format-date'
import { ChargeAttempts } from './charge-attempts'
import { chargeOutcome, hasDeclines } from './charge-outcome'
import { PendingAttemptLabel } from './pending-attempt'
import { RetryButton } from './retry-button'
import { canRetry, type ChargeView } from './use-optimistic-retry'

const RETRYING_STATUS = { label: 'Retrying', tone: 'warning' } as const

type ChargeItemProps = {
  charge: ChargeView
  onRetry: (chargeId: string) => void
}

export function ChargeItem({ charge, onRetry }: ChargeItemProps) {
  const outcome = chargeOutcome(charge)

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge
            {...(charge.isRetrying
              ? RETRYING_STATUS
              : chargeStatusLabel(charge.status))}
          />
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
      {charge.isRetrying && (
        <PendingAttemptLabel attemptNumber={charge.attemptCount + 1} />
      )}
      {(outcome || canRetry(charge)) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {outcome && <p className="text-fg-muted">{outcome}</p>}
          {canRetry(charge) && (
            <RetryButton charge={charge} onRetry={onRetry} />
          )}
        </div>
      )}
    </li>
  )
}
