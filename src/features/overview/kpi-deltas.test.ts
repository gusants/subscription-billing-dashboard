import type { MetricsOverview } from '../../api/contract'
import { kpiDeltas } from './kpi-deltas'

function overview(delinquencyRate: number | null): MetricsOverview {
  return {
    from: '2026-10-01T00:00:00.000Z',
    to: '2026-10-31T23:59:59.999Z',
    monthlyRecurringRevenueCents: 10000,
    activeSubscriptions: 4,
    pastDueSubscriptions: 1,
    delinquencyRate,
    revenueByMonth: [],
    subscriptionsByStatus: {
      active: 4,
      canceled: 0,
      incomplete: 0,
      past_due: 1,
    },
  }
}

describe('kpi deltas', () => {
  it('compares delinquency when both periods have a rate', () => {
    const deltas = kpiDeltas(overview(0.2), overview(0.1))

    expect(deltas?.delinquency).toMatchObject({
      direction: 'up',
      isGood: false,
    })
  })

  it('omits the delinquency delta when either period has no rate', () => {
    expect(
      kpiDeltas(overview(null), overview(0.1))?.delinquency,
    ).toBeUndefined()
    expect(
      kpiDeltas(overview(0.1), overview(null))?.delinquency,
    ).toBeUndefined()
  })
})
