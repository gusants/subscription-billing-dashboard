import { CircleCheck, CircleX } from 'lucide-react'
import type { PaymentAttempt } from '../../api/contract'
import { declineReasonLabel } from '../../lib/billing-labels'
import { formatDateTime } from '../../lib/format-date'

export function ChargeAttempts({ attempts }: { attempts: PaymentAttempt[] }) {
  return (
    <ol
      aria-label="Payment attempts"
      className="border-border flex flex-col gap-1.5 border-l pl-3"
    >
      {attempts.map((attempt, index) => {
        const isDeclined = attempt.result === 'declined'
        const Icon = isDeclined ? CircleX : CircleCheck
        return (
          <li
            key={attempt.id}
            className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
          >
            <Icon
              aria-hidden
              size={14}
              strokeWidth={2}
              className={isDeclined ? 'text-danger' : 'text-success'}
            />
            <span className="font-medium">
              Attempt {index + 1}:{' '}
              {isDeclined
                ? declineReasonLabel(attempt.failureReason ?? '')
                : 'Approved'}
            </span>
            <span className="text-fg-subtle tabular-nums">
              {formatDateTime(attempt.createdAt)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
