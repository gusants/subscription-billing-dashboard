import { CircleCheck, CircleX } from 'lucide-react'
import { Fragment } from 'react'
import type { Charge } from '../../api/contract'
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

const headerClass = 'px-4 py-2.5 text-left text-xs font-medium text-fg-muted'
const cellClass = 'border-t border-border px-4 py-2.5'

function ReasonCell({ charge }: { charge: Charge }) {
  const reason = latestDeclineReason(charge)
  const outcome = chargeOutcome(charge)
  if (!reason && !outcome) return <span className="text-fg-subtle">—</span>
  return (
    <span className="flex flex-col">
      {reason && <span className="text-danger font-medium">{reason}</span>}
      {outcome && <span className="text-fg-muted">{outcome}</span>}
    </span>
  )
}

function AttemptRows({ charge }: { charge: Charge }) {
  return charge.attempts.map((attempt, index) => {
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
  })
}

export function ChargesTable({ charges }: { charges: Charge[] }) {
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
                <StatusBadge {...chargeStatusLabel(charge.status)} />
              </td>
              <td className={cellClass}>
                <ReasonCell charge={charge} />
              </td>
              <td
                className={`${cellClass} text-right font-semibold whitespace-nowrap tabular-nums`}
              >
                {formatCurrency(charge.amountCents)}
              </td>
            </tr>
            {hasDeclines(charge) && <AttemptRows charge={charge} />}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
