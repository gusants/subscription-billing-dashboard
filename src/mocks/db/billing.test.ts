import type { CreateSubscriptionInput } from '../../api/contract'
import { addDays } from './clock'
import {
  cancelSubscription,
  createSubscription,
  expireInstantCharge,
  payInstantCharge,
  retryCharge,
  runRetriesNow,
  setSubscriptionCard,
} from './billing'
import { DemoApiError } from './demo-api-error'
import { firstCustomer, firstPlan, testDatabase } from './test-database'

function subscribe(
  paymentMethod: 'card' | 'pix' | 'boleto',
  cardToken = 'tok_success',
) {
  const db = testDatabase()
  const input: CreateSubscriptionInput =
    paymentMethod === 'card'
      ? {
          customerId: firstCustomer(db).id,
          planId: firstPlan(db, 'Studio').id,
          paymentMethod,
          cardToken,
        }
      : {
          customerId: firstCustomer(db).id,
          planId: firstPlan(db, 'Studio').id,
          paymentMethod,
        }
  return { db, ...createSubscription(db, input) }
}

function expectApiError(action: () => unknown, statusCode: number) {
  expect(action).toThrow(DemoApiError)
  try {
    action()
  } catch (error) {
    expect((error as DemoApiError).statusCode).toBe(statusCode)
  }
}

describe('demo billing rules', () => {
  it('activates a card subscription when the first charge is approved', () => {
    const { subscription, charge } = subscribe('card', 'tok_success')

    expect(subscription.status).toBe('active')
    expect(charge.status).toBe('paid')
    expect(charge.attempts).toEqual([
      expect.objectContaining({ result: 'succeeded' }),
    ])
  })

  it('puts a declined card subscription past due with a D+1 retry', () => {
    const { subscription, charge } = subscribe('card', 'tok_insufficient_funds')
    const firstAttemptAt = new Date(charge.attempts[0]!.createdAt)

    expect(subscription.status).toBe('past_due')
    expect(charge.status).toBe('failed')
    expect(charge.attempts[0]?.failureReason).toBe('insufficient_funds')
    expect(charge.nextRetryAt).toBe(addDays(firstAttemptAt, 1).toISOString())
  })

  it('recovers tok_fail_then_success on the next retry', () => {
    const { db, subscription, charge } = subscribe(
      'card',
      'tok_fail_then_success',
    )

    runRetriesNow(db)

    const stored = db.charges.find((c) => c.id === charge.id)
    expect(stored?.status).toBe('paid')
    expect(stored?.attemptCount).toBe(2)
    expect(db.subscriptions.find((s) => s.id === subscription.id)?.status).toBe(
      'active',
    )
  })

  it('follows D+1, D+3, D+7 and cancels when retries run out', () => {
    const { db, subscription, charge } = subscribe('card', 'tok_expired_card')
    const firstAttemptAt = new Date(charge.attempts[0]!.createdAt)
    const stored = () => db.charges.find((c) => c.id === charge.id)

    runRetriesNow(db)
    expect(stored()?.nextRetryAt).toBe(addDays(firstAttemptAt, 3).toISOString())
    runRetriesNow(db)
    expect(stored()?.nextRetryAt).toBe(addDays(firstAttemptAt, 7).toISOString())
    runRetriesNow(db)

    expect(stored()?.status).toBe('uncollectible')
    expect(stored()?.attemptCount).toBe(4)
    expect(db.subscriptions.find((s) => s.id === subscription.id)?.status).toBe(
      'canceled',
    )
  })

  it('declines an unknown card token as invalid', () => {
    const { charge } = subscribe('card', 'tok_unknown')

    expect(charge.attempts[0]?.failureReason).toBe('invalid_token')
  })

  it('keeps a Pix subscription incomplete until the charge is paid', () => {
    const { db, subscription, charge } = subscribe('pix')

    expect(subscription.status).toBe('incomplete')
    expect(charge.status).toBe('pending')

    payInstantCharge(db, charge.id)

    expect(db.charges.find((c) => c.id === charge.id)?.status).toBe('paid')
    expect(db.subscriptions.find((s) => s.id === subscription.id)?.status).toBe(
      'active',
    )
  })

  it('reissues an expired boleto when retries run', () => {
    const { db, subscription, charge } = subscribe('boleto')
    payInstantCharge(db, charge.id)
    const renewal = db.charges.find((c) => c.id === charge.id)!
    renewal.status = 'pending'

    expireInstantCharge(db, charge.id)

    expect(db.subscriptions.find((s) => s.id === subscription.id)?.status).toBe(
      'past_due',
    )
    expect(
      db.charges.find((c) => c.id === charge.id)?.nextRetryAt,
    ).not.toBeNull()

    runRetriesNow(db)

    const reissued = db.charges.filter(
      (c) => c.subscriptionId === subscription.id && c.status === 'pending',
    )
    expect(reissued).toHaveLength(1)
    expect(reissued[0]?.method).toBe('boleto')
  })

  it('forces declines after the card is swapped', () => {
    const { db, subscription, charge } = subscribe('card', 'tok_success')
    setSubscriptionCard(db, subscription.id, 'tok_insufficient_funds')
    const stored = db.charges.find((c) => c.id === charge.id)!
    stored.status = 'failed'

    const result = retryCharge(db, charge.id)

    expect(result.charge.attempts.at(-1)?.result).toBe('declined')
    expect(result.subscription.status).toBe('past_due')
  })

  it('rejects invalid transitions with API errors', () => {
    const { db, subscription, charge } = subscribe('pix')

    expectApiError(() => retryCharge(db, charge.id), 422)
    expectApiError(
      () => setSubscriptionCard(db, subscription.id, 'tok_success'),
      422,
    )
    payInstantCharge(db, charge.id)
    expectApiError(() => payInstantCharge(db, charge.id), 409)
    cancelSubscription(db, subscription.id)
    expectApiError(() => cancelSubscription(db, subscription.id), 409)
    expectApiError(() => retryCharge(db, 'chg_missing'), 404)
  })

  it('refuses subscriptions to unknown customers or inactive plans', () => {
    const db = testDatabase()
    const plan = firstPlan(db, 'Solo')

    expectApiError(
      () =>
        createSubscription(db, {
          customerId: 'cus_missing',
          planId: plan.id,
          paymentMethod: 'pix',
        }),
      404,
    )
    plan.active = false
    expectApiError(
      () =>
        createSubscription(db, {
          customerId: firstCustomer(db).id,
          planId: plan.id,
          paymentMethod: 'pix',
        }),
      422,
    )
  })
})
