import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { Select } from '../../components/ui/select'
import { KpiGrid } from './kpi-grid'
import {
  comparisonLabel,
  overviewPeriodLabels,
  overviewPeriods,
  periodRanges,
} from './overview-period'
import { metricsOverviewQuery } from './overview-queries'
import { RevenueChart } from './revenue-chart'
import { SubscriptionsByStatusChart } from './subscriptions-by-status-chart'
import { WidgetState } from './widget-state'

const route = getRouteApi('/')

const periodOptions = overviewPeriods.map((period) => ({
  id: period,
  label: overviewPeriodLabels[period],
}))

function openMonth(periodEnd: string, today: Date) {
  const todayIso = today.toISOString().slice(0, 10)
  return periodEnd >= todayIso ? periodEnd.slice(0, 7) : undefined
}

function hasNoData(overview: { subscriptionsByStatus: { count: number }[] }) {
  return overview.subscriptionsByStatus.every((entry) => entry.count === 0)
}

export function OverviewPage() {
  const { period } = route.useSearch()
  const navigate = route.useNavigate()
  const [today] = useState(() => new Date())
  const ranges = periodRanges(period, today)
  const current = useQuery(metricsOverviewQuery(ranges.current))
  const previous = useQuery(metricsOverviewQuery(ranges.previous))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="text-fg-muted">
            Revenue health and subscriptions that need attention.
          </p>
        </div>
        <Select
          label="Period"
          options={periodOptions}
          value={period}
          onChange={(next) => void navigate({ search: { period: next } })}
        />
      </header>

      <WidgetState query={current} title="Key metrics" skeletonClassName="h-32">
        {(data) =>
          hasNoData(data) ? (
            <p className="border-border-strong text-fg-muted rounded-lg border border-dashed px-4 py-6">
              No subscriptions existed in this period yet.
            </p>
          ) : (
            <KpiGrid
              current={data}
              previous={previous.data}
              comparison={comparisonLabel(period)}
            />
          )
        }
      </WidgetState>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <WidgetState
          query={current}
          title="Revenue by month"
          skeletonClassName="h-80"
        >
          {(data) => (
            <RevenueChart
              points={data.revenueByMonth}
              openMonth={openMonth(ranges.current.to, today)}
            />
          )}
        </WidgetState>
        <WidgetState
          query={current}
          title="Subscriptions by status"
          skeletonClassName="h-80"
        >
          {(data) => (
            <SubscriptionsByStatusChart entries={data.subscriptionsByStatus} />
          )}
        </WidgetState>
      </div>
    </div>
  )
}
