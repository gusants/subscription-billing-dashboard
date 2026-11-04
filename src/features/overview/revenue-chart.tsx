import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenuePoint } from '../../api/contract'
import {
  formatCompactCurrency,
  formatCurrency,
} from '../../lib/format-currency'
import { formatLongMonth, formatShortMonth } from '../../lib/format-month'
import { ChartCard } from './chart-card'
import { ChartTooltip } from './chart-tooltip'
import { describeRevenue } from './chart-summaries'

const CHART_HEIGHT = 240
const MAX_BAR_SIZE = 24
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const AXIS_TICK = { fill: 'var(--fg-subtle)', fontSize: 12 }

function RevenueTable({ points }: { points: RevenuePoint[] }) {
  return (
    <table className="w-full text-left tabular-nums">
      <thead>
        <tr className="text-fg-subtle text-xs">
          <th className="py-1 font-medium">Month</th>
          <th className="py-1 text-right font-medium">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.month} className="border-border border-t">
            <td className="py-1">{formatLongMonth(point.month)}</td>
            <td className="py-1 text-right">
              {formatCurrency(point.revenueCents)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  return (
    <ChartCard
      title="Revenue by month"
      description="Payments received in the last 12 months"
      summary={describeRevenue(points)}
      table={<RevenueTable points={points} />}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={points}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="month"
            tickFormatter={formatShortMonth}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
          />
          <YAxis
            tickFormatter={formatCompactCurrency}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as RevenuePoint | undefined
              return (
                <ChartTooltip
                  active={active}
                  label={point && formatLongMonth(point.month)}
                  value={point && formatCurrency(point.revenueCents)}
                />
              )
            }}
          />
          <Bar
            dataKey="revenueCents"
            fill="var(--chart-accent)"
            radius={BAR_RADIUS}
            maxBarSize={MAX_BAR_SIZE}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
