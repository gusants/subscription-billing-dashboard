import { createSubscription } from './billing'
import { customerSummary, metricsOverview } from './metrics'
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
    expect(overview.mrrCents).toBeGreaterThan(0)
    expect(overview.revenueByMonth).toHaveLength(12)
    expect(overview.revenueByMonth.at(-1)?.month).toBe('2026-11')
    expect(
      overview.subscriptionsByStatus.reduce((total, s) => total + s.count, 0),
    ).toBe(db.subscriptions.length)
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

    expect(metricsOverview(db, {}).mrrCents).toBe(
      Math.round(annual.amountCents / 12),
    )
  })

  it('raises the delinquency rate when a renewal is declined', () => {
    const db = testDatabase()
    const before = metricsOverview(db, {}).delinquencyRate

    createSubscription(db, {
      customerId: firstCustomer(db).id,
      planId: firstPlan(db, 'Studio').id,
      paymentMethod: 'card',
      cardToken: 'tok_insufficient_funds',
    })

    expect(metricsOverview(db, {}).delinquencyRate).toBeGreaterThan(before)
  })

  it('computes the customer summary numbers from the charges', () => {
    const db = testDatabase()
    const customer = firstCustomer(db)
    const summary = customerSummary(db, customer.id)
    const paidCharges = db.charges.filter(
      (charge) =>
        charge.status === 'paid' &&
        db.subscriptions.some(
          (s) => s.id === charge.subscriptionId && s.customerId === customer.id,
        ),
    )

    expect(summary.customerId).toBe(customer.id)
    expect(summary.source).toBe('fallback')
    expect(summary.metrics.totalPaidCents).toBe(
      paidCharges.reduce((total, c) => total + c.amountCents, 0),
    )
    expect(summary.metrics.paymentSuccessRate).toBeGreaterThan(0)
    expect(summary.summary).toBe(db.summaries[customer.id]?.summary)
  })
})
