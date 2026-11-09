import type { MetricsOverview } from '../../api/contract'
import { formatCurrency } from '../../lib/format-currency'
import {
  formatInteger,
  formatPercentagePoints,
  formatSigned,
} from '../../lib/format-number'
import type { KpiDelta } from './kpi-card'

type Goal = 'higher-is-better' | 'lower-is-better'

function delta(
  current: number,
  previous: number,
  goal: Goal,
  text: string,
): KpiDelta {
  const change = current - previous
  const direction = change === 0 ? 'flat' : change > 0 ? 'up' : 'down'
  const isGood = goal === 'higher-is-better' ? change >= 0 : change <= 0
  return { text, direction, isGood }
}

export function kpiDeltas(
  current: MetricsOverview,
  previous: MetricsOverview | undefined,
) {
  if (!previous) return undefined
  return {
    mrr: delta(
      current.monthlyRecurringRevenueCents,
      previous.monthlyRecurringRevenueCents,
      'higher-is-better',
      formatSigned(
        current.monthlyRecurringRevenueCents -
          previous.monthlyRecurringRevenueCents,
        formatCurrency,
      ),
    ),
    active: delta(
      current.activeSubscriptions,
      previous.activeSubscriptions,
      'higher-is-better',
      formatSigned(
        current.activeSubscriptions - previous.activeSubscriptions,
        formatInteger,
      ),
    ),
    pastDue: delta(
      current.pastDueSubscriptions,
      previous.pastDueSubscriptions,
      'lower-is-better',
      formatSigned(
        current.pastDueSubscriptions - previous.pastDueSubscriptions,
        formatInteger,
      ),
    ),
    delinquency: delinquencyDelta(
      current.delinquencyRate,
      previous.delinquencyRate,
    ),
  }
}

function delinquencyDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return undefined
  return delta(
    current,
    previous,
    'lower-is-better',
    formatPercentagePoints(current - previous),
  )
}
