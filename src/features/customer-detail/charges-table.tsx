import { CircleCheck, CircleX } from 'lucide-react'
import { Fragment } from 'react'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  chargeStatusLabel,
  declineReasonLabel,
  paymentMethodLabel,
} from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate, formatDateTime } from '../../lib/format-date'
import {
  chargeOutcome,
  hasDeclines,
  latestDeclineReason,
} from './charge-outcome'
import { PendingAttemptLabel } from './pending-attempt'
import { RetryButton } from './retry-button'
import { canRetry, type ChargeView } from './use-optimistic-retry'

const headerClass = 'px-4 py-2.5 text-left text-xs font-medium text-fg-muted'
const cellClass = 'border-t border-border px-4 py-2.5'
const RETRYING_STATUS = { label: 'Retrying', tone: 'warning' } as const

type ChargesTableProps = {
  charges: ChargeView[]
  onRetry: (chargeId: string) => void
}

function ReasonCell({
  charge,
  onRetry,
}: {
  charge: ChargeView
  onRetry: (chargeId: string) => void
}) {
  const reason = latestDeclineReason(charge)
  const outcome = chargeOutcome(charge)
  if (!reason && !outcome) return <span className="text-fg-subtle">—</span>
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex flex-col">
        {reason && <span className="text-danger font-medium">{reason}</span>}
        {outcome && <span className="text-fg-muted">{outcome}</span>}
      </span>
      {canRetry(charge) && <RetryButton charge={charge} onRetry={onRetry} />}
    </div>
  )
}

function AttemptRows({ charge }: { charge: ChargeView }) {
  return (
    <>
      {charge.attempts.map((attempt, index) => {
        const isDeclined = attempt.result === 'declined'
        const Icon = isDeclined ? CircleX : CircleCheck
        return (
          <tr key={attempt.id} className="text-fg-muted">
            <td className="py-1.5 pr-4 pl-8 whitespace-nowrap tabular-nums">
              {formatDateTime(attempt.createdAt)}
            </td>
            <td className="px-4 py-1.5" colSpan={2}>
              <span className="inline-flex items-center gap-1.5">
                <Icon
                  aria-hidden
                  size={14}
                  strokeWidth={2}
                  className={isDeclined ? 'text-danger' : 'text-success'}
                />
                Attempt {index + 1}
              </span>
            </td>
            <td className="px-4 py-1.5" colSpan={2}>
              {isDeclined
                ? declineReasonLabel(attempt.failureReason ?? '')
                : 'Approved'}
            </td>
          </tr>
        )
      })}
      {charge.isRetrying && (
        <tr>
          <td className="text-fg-muted py-1.5 pr-4 pl-8">Now</td>
          <td className="px-4 py-1.5" colSpan={4}>
            <PendingAttemptLabel attemptNumber={charge.attemptCount + 1} />
          </td>
        </tr>
      )}
    </>
  )
}

export function ChargesTable({ charges, onRetry }: ChargesTableProps) {
  return (
    <table
      aria-label="Charges"
      className="w-full border-separate border-spacing-0"
    >
      <thead className="bg-surface-muted/60">
        <tr>
          <th scope="col" className={`${headerClass} rounded-tl-lg`}>
            Due date
          </th>
          <th scope="col" className={headerClass}>
            Method
          </th>
          <th scope="col" className={headerClass}>
            Status
          </th>
          <th scope="col" className={headerClass}>
            Reason
          </th>
          <th scope="col" className={`${headerClass} rounded-tr-lg text-right`}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {charges.map((charge) => (
          <Fragment key={charge.id}>
            <tr className="hover:bg-surface-muted/40">
              <td
                className={`${cellClass} whitespace-nowrap tabular-nums`}
                title={
                  charge.paidAt
                    ? `Paid ${formatDateTime(charge.paidAt)}`
                    : undefined
                }
              >
                {formatDate(charge.dueDate)}
              </td>
              <td className={cellClass}>{paymentMethodLabel(charge.method)}</td>
              <td className={cellClass}>
                <StatusBadge
                  {...(charge.isRetrying
                    ? RETRYING_STATUS
                    : chargeStatusLabel(charge.status))}
                />
              </td>
              <td className={cellClass}>
                <ReasonCell charge={charge} onRetry={onRetry} />
              </td>
              <td
                className={`${cellClass} text-right font-semibold whitespace-nowrap tabular-nums`}
              >
                {formatCurrency(charge.amountCents)}
              </td>
            </tr>
            {(hasDeclines(charge) || charge.isRetrying) && (
              <AttemptRows charge={charge} />
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
