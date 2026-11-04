import type { RevenuePoint } from '../../api/contract'
import { formatCurrency } from '../../lib/format-currency'
import { formatLongMonth } from '../../lib/format-month'

export function describeRevenue(points: RevenuePoint[]) {
  const first = points[0]
  const last = points.at(-1)
  const best = points.reduce<RevenuePoint | undefined>(
    (top, point) =>
      !top || point.revenueCents > top.revenueCents ? point : top,
    undefined,
  )
  if (!first || !last || !best) return 'No revenue recorded in this period.'
  return `Revenue went from ${formatCurrency(first.revenueCents)} in ${formatLongMonth(first.month)} to ${formatCurrency(last.revenueCents)} in ${formatLongMonth(last.month)}. The highest month was ${formatLongMonth(best.month)} with ${formatCurrency(best.revenueCents)}.`
}

export function describeSubscriptionsByStatus(
  rows: { label: string; count: number }[],
) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  const parts = rows.map((row) => `${row.count} ${row.label.toLowerCase()}`)
  return `${total} subscriptions: ${parts.join(', ')}.`
}
