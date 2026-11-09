import { createSubscription } from './billing'
import { metricsOverview } from './metrics'
import { firstCustomer, firstPlan, testDatabase } from './test-database'

describe('demo metrics', () => {
  it('summarises the seeded portfolio', () => {
    const db = testDatabase()
    const overview = metricsOverview(db, {})
    const count = (status: string) =>
      db.subscriptions.filter((s) => s.status === status).length

    expect(overview.activeSubscriptions).toBe(count('active'))
    expect(overview.pastDueSubscriptions).toBe(count('past_due'))
    expect(overview.delinquencyRate).toBeCloseTo(
      count('past_due') / (count('active') + count('past_due')),
      4,
    )
    expect(overview.monthlyRecurringRevenueCents).toBeGreaterThan(0)
    expect(overview.from).toBe('2026-11-01T00:00:00.000Z')
    expect(overview.to).toBe('2026-11-03T23:59:59.999Z')
    expect(overview.revenueByMonth).toHaveLength(12)
    expect(overview.revenueByMonth.at(-1)?.month).toBe('2026-11')
    expect(overview.subscriptionsByStatus).toEqual({
      active: count('active'),
      past_due: count('past_due'),
      incomplete: count('incomplete'),
      canceled: count('canceled'),
    })
  })

  it('reports no delinquency rate when there is nothing to measure', () => {
    const db = testDatabase()
    db.subscriptions = []
    db.charges = []

    expect(metricsOverview(db, {}).delinquencyRate).toBeNull()
  })

  it('counts cancellations for payment failure inside the period as delinquent', () => {
    const db = testDatabase()
    const churned = db.subscriptions.find(
      (s) => s.cancelReason === 'payment_failed',
    )!
    const day = churned.canceledAt!.slice(0, 10)
    const overview = metricsOverview(db, { from: day, to: day })

    expect(overview.delinquencyRate).toBeGreaterThan(0)
    expect(overview.subscriptionsByStatus.canceled).toBeGreaterThan(0)
  })

  it('counts annual plans as one twelfth of their price in MRR', () => {
    const db = testDatabase()
    db.subscriptions = []
    const annual = firstPlan(db, 'Studio Annual')
    createSubscription(db, {
      customerId: firstCustomer(db).id,
      planId: annual.id,
      paymentMethod: 'card',
      cardToken: 'tok_success',
    })

    expect(metricsOverview(db, {}).monthlyRecurringRevenueCents).toBe(
      Math.round(annual.amountCents / 12),
    )
  })

  it('raises the delinquency rate when a renewal is declined', () => {
    const db = testDatabase()
    const before = metricsOverview(db, {}).delinquencyRate!

    createSubscription(db, {
      customerId: firstCustomer(db).id,
      planId: firstPlan(db, 'Studio').id,
      paymentMethod: 'card',
      cardToken: 'tok_insufficient_funds',
    })

    expect(metricsOverview(db, {}).delinquencyRate).toBeGreaterThan(before)
  })
})

describe('demo metrics over time', () => {
  it('reconstructs earlier periods from the charge history', () => {
    const db = testDatabase()
    const lastMonth = metricsOverview(db, {
      from: '2026-10-01',
      to: '2026-10-31',
    })
    const sixMonthsAgo = metricsOverview(db, {
      from: '2026-05-01',
      to: '2026-05-31',
    })
    const total = (overview: typeof lastMonth) =>
      Object.values(overview.subscriptionsByStatus).reduce(
        (sum, count) => sum + count,
        0,
      )

    expect(total(sixMonthsAgo)).toBeLessThan(total(lastMonth))
    expect(lastMonth.activeSubscriptions).toBeGreaterThan(0)
    expect(lastMonth.revenueByMonth.at(-1)?.month).toBe('2026-10')
  })

  it('counts a declined renewal as past due from the decline until it is paid', () => {
    const db = testDatabase()
    const recovered = db.charges.find(
      (charge) =>
        charge.status === 'paid' &&
        charge.attempts.length === 2 &&
        charge.attempts[0]?.result === 'declined',
    )!
    const subscription = db.subscriptions.find(
      (s) => s.id === recovered.subscriptionId,
    )!
    const declinedDay = recovered.attempts[0]!.createdAt.slice(0, 10)
    const paidDay = recovered.paidAt!.slice(0, 10)

    const pastDueOnDecline = metricsOverview(db, { to: declinedDay })
    const afterPayment = metricsOverview(db, { to: paidDay })

    expect(pastDueOnDecline.pastDueSubscriptions).toBeGreaterThanOrEqual(1)
    expect(subscription.status).not.toBe('past_due')
    expect(afterPayment.pastDueSubscriptions).toBeLessThanOrEqual(
      pastDueOnDecline.pastDueSubscriptions,
    )
  })
})
