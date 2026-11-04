import { createSubscription } from './billing'
import { customerSummary } from './customer-summary'
import { firstPlan, testDatabase } from './test-database'

const LLM_OK = { isLlmFailing: false }

function pastDueCustomer(db: ReturnType<typeof testDatabase>) {
  return db.subscriptions.find((s) => s.status === 'past_due')!.customerId
}

describe('customer summary in demo mode', () => {
  it('returns the pre-written summary with metrics computed from the charges', () => {
    const db = testDatabase()
    const customer = db.customers[0]!
    const summary = customerSummary(db, customer.id, LLM_OK)
    const paidCents = db.charges
      .filter(
        (c) =>
          c.status === 'paid' &&
          db.subscriptions.some(
            (s) => s.id === c.subscriptionId && s.customerId === customer.id,
          ),
      )
      .reduce((total, c) => total + c.amountCents, 0)

    expect(summary).toMatchObject({
      customerId: customer.id,
      source: 'llm',
      promptVersion: 'v1',
    })
    expect(summary.summary).toBe(db.summaries[customer.id]?.summary)
    expect(summary.metrics.totalPaidCents).toBe(paidCents)
    expect(summary.metrics.paymentSuccessRate).toBeGreaterThan(0)
  })

  it('falls back to rules once the customer changed in the session', () => {
    const db = testDatabase()
    const customerId = db.customers[0]!.id
    createSubscription(db, {
      customerId,
      planId: firstPlan(db, 'Studio').id,
      paymentMethod: 'card',
      cardToken: 'tok_insufficient_funds',
    })

    const summary = customerSummary(db, customerId, LLM_OK)

    expect(summary.source).toBe('fallback')
    expect(summary.riskLevel).toBe('medium')
    expect(summary.suggestedAction).toMatch(/Pix payment link/)
  })

  it('falls back to rules when the LLM fails', () => {
    const db = testDatabase()
    const customerId = pastDueCustomer(db)

    const summary = customerSummary(db, customerId, { isLlmFailing: true })

    expect(summary.source).toBe('fallback')
    expect(['medium', 'high']).toContain(summary.riskLevel)
  })

  it('rates a clean history as low risk and on time', () => {
    const db = testDatabase()
    const reliable = db.customers.find(
      (c) =>
        db.summaries[c.id]?.paymentBehavior === 'on_time' &&
        db.subscriptions.some(
          (s) => s.customerId === c.id && s.status === 'active',
        ),
    )!

    const summary = customerSummary(db, reliable.id, { isLlmFailing: true })

    expect(summary).toMatchObject({
      riskLevel: 'low',
      paymentBehavior: 'on_time',
      source: 'fallback',
    })
  })
})
