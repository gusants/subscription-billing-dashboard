import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  comparisonLabel,
  periodRanges,
  type OverviewPeriod,
} from './overview-period'
import { metricsOverviewQuery } from './overview-queries'
import { KpiGrid } from './kpi-grid'
import { RevenueChart } from './revenue-chart'
import { SubscriptionsByStatusChart } from './subscriptions-by-status-chart'

const DEFAULT_PERIOD: OverviewPeriod = 'this-month'

export function OverviewPage() {
  const period = DEFAULT_PERIOD
  const [today] = useState(() => new Date())
  const ranges = periodRanges(period, today)
  const current = useQuery(metricsOverviewQuery(ranges.current))
  const previous = useQuery(metricsOverviewQuery(ranges.previous))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-fg-muted">
          Revenue health and subscriptions that need attention.
        </p>
      </header>
      {current.data && (
        <KpiGrid
          current={current.data}
          previous={previous.data}
          comparison={comparisonLabel(period)}
        />
      )}
      {current.data && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <RevenueChart points={current.data.revenueByMonth} />
          <SubscriptionsByStatusChart
            entries={current.data.subscriptionsByStatus}
          />
        </div>
      )}
    </div>
  )
}
