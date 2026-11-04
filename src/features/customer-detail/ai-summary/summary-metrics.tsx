import type { CustomerSummary } from '../../../api/contract'
import { formatCurrency } from '../../../lib/format-currency'
import { formatInteger, formatPercent } from '../../../lib/format-number'

export function SummaryMetrics({
  metrics,
}: {
  metrics: CustomerSummary['metrics']
}) {
  const rows = [
    ['Customer for', `${formatInteger(metrics.monthsAsCustomer)} months`],
    ['Total paid', formatCurrency(metrics.totalPaidCents)],
    ['Declined attempts', formatInteger(metrics.failedAttempts)],
    ['Average days late', metrics.averageDaysLate.toFixed(1)],
    ['Payment success', formatPercent(metrics.paymentSuccessRate)],
  ] as const

  return (
    <section
      aria-labelledby="summary-metrics-heading"
      className="bg-surface-muted/60 flex flex-col gap-2 rounded-md p-3"
    >
      <h3
        id="summary-metrics-heading"
        className="text-fg-muted text-xs font-medium"
      >
        Computed from the charges, not by the AI
      </h3>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-fg-muted text-xs">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
