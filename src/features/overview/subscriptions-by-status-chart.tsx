import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SubscriptionsByStatus } from '../../api/contract'
import { subscriptionStatusLabel } from '../../lib/billing-labels'
import { formatInteger } from '../../lib/format-number'
import { ChartCard } from './chart-card'
import { describeSubscriptionsByStatus } from './chart-summaries'
import { ChartTooltip } from './chart-tooltip'

const ROW_HEIGHT = 44
const MAX_BAR_SIZE = 24
const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0]
const AXIS_TICK = { fill: 'var(--fg-muted)', fontSize: 13 }
const VALUE_LABEL = { fill: 'var(--fg)', fontSize: 13 }

type StatusRow = SubscriptionsByStatus & { label: string }

function toRows(entries: SubscriptionsByStatus[]): StatusRow[] {
  return entries.map((entry) => ({
    ...entry,
    label: subscriptionStatusLabel(entry.status).label,
  }))
}

function StatusTable({ rows }: { rows: StatusRow[] }) {
  return (
    <table className="w-full text-left tabular-nums">
      <thead>
        <tr className="text-fg-subtle text-xs">
          <th className="py-1 font-medium">Status</th>
          <th className="py-1 text-right font-medium">Subscriptions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.status} className="border-border border-t">
            <td className="py-1">{row.label}</td>
            <td className="py-1 text-right">{formatInteger(row.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function SubscriptionsByStatusChart({
  entries,
}: {
  entries: SubscriptionsByStatus[]
}) {
  const rows = toRows(entries)

  return (
    <ChartCard
      title="Subscriptions by status"
      description="Every subscription at the end of the period"
      summary={describeSubscriptionsByStatus(rows)}
      table={<StatusTable rows={rows} />}
    >
      <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as StatusRow | undefined
              return (
                <ChartTooltip
                  active={active}
                  label={row?.label}
                  value={row && formatInteger(row.count)}
                />
              )
            }}
          />
          <Bar
            dataKey="count"
            fill="var(--chart-accent)"
            radius={BAR_RADIUS}
            maxBarSize={MAX_BAR_SIZE}
            minPointSize={2}
          >
            <LabelList dataKey="count" position="right" style={VALUE_LABEL} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
