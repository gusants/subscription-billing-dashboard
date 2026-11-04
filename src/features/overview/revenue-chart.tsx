import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { niceTicks } from '../../lib/nice-ticks'
import { ChartCard } from './chart-card'
import { ChartTooltip } from './chart-tooltip'
import { describeRevenue } from './chart-summaries'

const CHART_HEIGHT = 240
const MAX_BAR_SIZE = 24
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const AXIS_TICK = { fill: 'var(--fg-subtle)', fontSize: 12 }
const OPEN_MONTH_OPACITY = 0.4

type RevenueChartProps = {
  points: RevenuePoint[]
  openMonth: string | undefined
}

function monthLabel(month: string, openMonth: string | undefined) {
  return month === openMonth
    ? `${formatLongMonth(month)} (to date)`
    : formatLongMonth(month)
}

function shortMonthLabel(month: string, openMonth: string | undefined) {
  return month === openMonth
    ? `${formatShortMonth(month)} MTD`
    : formatShortMonth(month)
}

function RevenueTable({ points, openMonth }: RevenueChartProps) {
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
            <td className="py-1">{monthLabel(point.month, openMonth)}</td>
            <td className="py-1 text-right">
              {formatCurrency(point.revenueCents)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RevenueChart({ points, openMonth }: RevenueChartProps) {
  const ticks = niceTicks(
    Math.max(0, ...points.map((point) => point.revenueCents)),
  )

  return (
    <ChartCard
      title="Revenue by month"
      description="Payments received in the last 12 months"
      summary={describeRevenue(points, openMonth)}
      table={<RevenueTable points={points} openMonth={openMonth} />}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          accessibilityLayer={false}
          data={points}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => shortMonthLabel(month, openMonth)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
          />
          <YAxis
            ticks={ticks}
            domain={[0, ticks.at(-1) ?? 0]}
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
                  label={point && monthLabel(point.month, openMonth)}
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
          >
            {points.map((point) => (
              <Cell
                key={point.month}
                fillOpacity={point.month === openMonth ? OPEN_MONTH_OPACITY : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
