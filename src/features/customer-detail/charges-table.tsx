import { Fragment } from 'react'
import { StatusBadge } from '../../components/ui/status-badge'
import { chargeStatusLabel, paymentMethodLabel } from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate, formatDateTime } from '../../lib/format-date'
import { ChargeAttempts } from './charge-attempts'
import {
  chargeOutcome,
  hasDeclines,
  latestDeclineReason,
} from './charge-outcome'
import { PendingAttemptLabel } from './pending-attempt'
import { useFlashOnChange } from '../../lib/use-flash-on-change'
import { chargeSignature } from './charge-signature'
import { RetryButton } from './retry-button'
import { canRetry, type ChargeView } from './use-optimistic-retry'

const headerClass = 'px-4 py-2.5 text-left text-xs font-medium text-fg-muted'
const cellClass = 'border-t border-border px-4 py-2.5'
type ChargeRowProps = {
  charge: ChargeView
  onRetry: (chargeId: string) => void
}

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

function AttemptsRow({ charge }: { charge: ChargeView }) {
  return (
    <tr>
      <td colSpan={5} className="text-fg-muted py-1.5 pr-4 pl-8">
        <div className="flex flex-col gap-1.5">
          {hasDeclines(charge) && <ChargeAttempts attempts={charge.attempts} />}
          {charge.isRetrying && (
            <PendingAttemptLabel attemptNumber={charge.attemptCount + 1} />
          )}
        </div>
      </td>
    </tr>
  )
}

function ChargeRow({ charge, onRetry }: ChargeRowProps) {
  const flash = useFlashOnChange(chargeSignature(charge))

  return (
    <tr data-flash={flash} className="hover:bg-surface-muted/40">
      <td
        className={`${cellClass} whitespace-nowrap tabular-nums`}
        title={
          charge.paidAt ? `Paid ${formatDateTime(charge.paidAt)}` : undefined
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
            <ChargeRow charge={charge} onRetry={onRetry} />
            {(hasDeclines(charge) || charge.isRetrying) && (
              <AttemptsRow charge={charge} />
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
