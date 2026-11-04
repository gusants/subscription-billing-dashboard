import { Link } from '@tanstack/react-router'
import type { MetricsOverview } from '../../api/contract'
import { formatCurrency } from '../../lib/format-currency'
import { formatInteger, formatPercent } from '../../lib/format-number'
import { KpiCard } from './kpi-card'
import { kpiDeltas } from './kpi-deltas'

type KpiGridProps = {
  current: MetricsOverview
  previous: MetricsOverview | undefined
  comparison: string
}

export function KpiGrid({ current, previous, comparison }: KpiGridProps) {
  const deltas = kpiDeltas(current, previous)

  return (
    <section aria-label="Key metrics">
      <dl className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
        <KpiCard
          label="Monthly recurring revenue"
          value={formatCurrency(current.mrrCents)}
          delta={deltas?.mrr}
          comparison={comparison}
          footnote="Active and past due, annual plans ÷ 12"
        />
        <KpiCard
          label="Active subscriptions"
          value={formatInteger(current.activeSubscriptions)}
          delta={deltas?.active}
          comparison={comparison}
        />
        <KpiCard
          label="Past due subscriptions"
          value={formatInteger(current.pastDueSubscriptions)}
          delta={deltas?.pastDue}
          comparison={comparison}
          action={
            <Link
              to="/customers"
              search={{ status: 'past_due' }}
              className="text-accent hover:text-accent-hover text-xs font-medium hover:underline"
            >
              View past due customers
            </Link>
          }
        />
        <KpiCard
          label="Delinquency rate"
          value={formatPercent(current.delinquencyRate)}
          delta={deltas?.delinquency}
          comparison={comparison}
          footnote="Past due ÷ (active + past due)"
        />
      </dl>
    </section>
  )
}
