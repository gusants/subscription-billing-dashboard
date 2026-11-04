import { ApiError, request } from '../api/client'
import {
  chargesApi,
  customersApi,
  metricsApi,
  plansApi,
  simulatorApi,
  subscriptionsApi,
} from '../api/endpoints'
import { demoDbStore } from './db/demo-db-store'

function seeded() {
  return demoDbStore.getState().db
}

function cardCustomer() {
  const subscription = seeded().subscriptions.find(
    (s) => s.paymentMethod === 'card' && s.status === 'active',
  )!
  return {
    customerId: subscription.customerId,
    subscriptionId: subscription.id,
  }
}

async function expectApiError(promise: Promise<unknown>, status: number) {
  await expect(promise).rejects.toBeInstanceOf(ApiError)
  await expect(promise).rejects.toMatchObject({ status })
}

describe('demo handlers', () => {
  it('answers the health check without a backend', async () => {
    await expect(request('/health')).resolves.toEqual({ status: 'ok' })
  })

  it('lists, searches and paginates customers', async () => {
    const page = await customersApi.list({ limit: 10, page: 2 })
    const target = seeded().customers[0]!
    const search = await customersApi.list({ search: target.name })

    expect(page.meta).toEqual({ page: 2, limit: 10, total: 40, totalPages: 4 })
    expect(search.data.map((c) => c.id)).toContain(target.id)
  })

  it('serves customer detail, charges and the AI summary', async () => {
    const { customerId } = cardCustomer()

    const detail = await customersApi.get(customerId)
    const charges = await customersApi.charges(customerId, { limit: 3 })
    const summary = await customersApi.summary(customerId)

    expect(detail.subscriptions.length).toBeGreaterThan(0)
    expect(charges.data).toHaveLength(3)
    expect(charges.data[0]).not.toHaveProperty('nextRetryAt')
    expect(summary).toMatchObject({ customerId, source: 'fallback' })
  })

  it('creates customers and rejects duplicate emails', async () => {
    const created = await customersApi.create({
      name: 'Escola Nova',
      email: 'Ops@Nova.example',
    })

    expect(created.email).toBe('ops@nova.example')
    await expectApiError(
      customersApi.create({ name: 'Again', email: 'ops@nova.example' }),
      409,
    )
  })

  it('validates request bodies and query params', async () => {
    await expectApiError(
      customersApi.create({ name: '', email: 'not-an-email' }),
      400,
    )
    await expectApiError(customersApi.list({ limit: 500 }), 400)
    await expectApiError(
      simulatorApi.setSubscriptionCard(
        cardCustomer().subscriptionId,
        'tok_bogus' as never,
      ),
      400,
    )
  })

  it('lists and creates plans', async () => {
    const created = await plansApi.create({
      name: 'Ensemble',
      amountCents: 59990,
      interval: 'monthly',
    })
    const active = await plansApi.list({ active: 'true' })

    expect(created).toMatchObject({ name: 'Ensemble', active: true })
    expect(active.data.map((p) => p.id)).toContain(created.id)
  })

  it('creates, reads and cancels a subscription', async () => {
    const plan = seeded().plans[0]!
    const { customerId } = cardCustomer()

    const created = await subscriptionsApi.create({
      customerId,
      planId: plan.id,
      paymentMethod: 'card',
      cardToken: 'tok_insufficient_funds',
    })

    expect(created.status).toBe('past_due')
    expect(created.latestCharge).toMatchObject({
      status: 'failed',
      failureReason: 'insufficient_funds',
    })
    expect(created).not.toHaveProperty('cardToken')
    await expect(subscriptionsApi.get(created.id)).resolves.toMatchObject({
      status: 'past_due',
    })
    await expect(subscriptionsApi.cancel(created.id)).resolves.toMatchObject({
      status: 'canceled',
    })
    await expectApiError(subscriptionsApi.cancel(created.id), 409)
  })

  it('retries a failed card charge and refuses others', async () => {
    const failed = seeded().charges.find((c) => c.status === 'failed')!
    const paid = seeded().charges.find(
      (c) => c.status === 'paid' && c.method === 'card',
    )!

    const result = await chargesApi.retry(failed.id)

    expect(result.charge.attemptCount).toBe(failed.attemptCount + 1)
    expect(result.subscription.id).toBe(failed.subscriptionId)
    await expectApiError(chargesApi.retry(paid.id), 409)
    await expectApiError(chargesApi.retry('chg_missing'), 404)
  })

  it('serves the metrics overview', async () => {
    const overview = await metricsApi.overview({ to: '2026-11-03' })

    expect(overview.revenueByMonth).toHaveLength(12)
    expect(overview.period.to).toBe('2026-11-03')
  })

  it('pays and expires instant charges through the fake gateway', async () => {
    const pending = seeded().charges.filter((c) => c.status === 'pending')
    const [toPay, toExpire] = pending

    await simulatorApi.payCharge(toPay!.id)
    await simulatorApi.expireCharge(toExpire!.id)

    const charges = seeded().charges
    expect(charges.find((c) => c.id === toPay!.id)?.status).toBe('paid')
    expect(charges.find((c) => c.id === toExpire!.id)?.status).toBe('expired')
    await expectApiError(simulatorApi.payCharge(toPay!.id), 409)
  })

  it('swaps the card, runs retries and resets the demo', async () => {
    const { subscriptionId } = cardCustomer()

    await simulatorApi.setSubscriptionCard(subscriptionId, 'tok_expired_card')
    const run = await simulatorApi.runRetriesNow()

    expect(run.promoted).toBeGreaterThan(0)
    expect(
      seeded().subscriptions.find((s) => s.id === subscriptionId)?.cardToken,
    ).toBe('tok_expired_card')

    await simulatorApi.reset()

    expect(
      seeded().subscriptions.find((s) => s.id === subscriptionId)?.cardToken,
    ).toBe('tok_success')
  })

  it('fails every request while API errors are simulated', async () => {
    demoDbStore.getState().setFailingRequests(true)

    await expectApiError(customersApi.list(), 503)
  })
})
