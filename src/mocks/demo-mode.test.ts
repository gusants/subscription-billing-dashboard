import {
  customersApi,
  metricsApi,
  plansApi,
  simulatorApi,
  subscriptionsApi,
} from '../api/endpoints'
import seed from './seed.json'

async function anyCustomerId() {
  const { data } = await customersApi.list({ limit: 1 })
  return data[0]!.id
}

async function planId(name: string) {
  const { data } = await plansApi.list()
  return data.find((plan) => plan.name === name)!.id
}

async function latestCharge(customerId: string) {
  const { data } = await customersApi.charges(customerId, { limit: 1 })
  return data[0]!
}

describe('demo mode behavior', () => {
  it('turns a declined card into a past due customer and a higher delinquency rate', async () => {
    const before = await metricsApi.overview()
    const customerId = await anyCustomerId()

    await subscriptionsApi.create({
      customerId,
      planId: await planId('Studio'),
      paymentMethod: 'card',
      cardToken: 'tok_insufficient_funds',
    })

    const after = await metricsApi.overview()
    const pastDue = await customersApi.list({
      subscriptionStatus: 'past_due',
      limit: 100,
    })
    const charge = await latestCharge(customerId)

    expect(charge.status).toBe('failed')
    expect(charge.attempts.at(-1)?.failureReason).toBe('insufficient_funds')
    expect(pastDue.data.map((c) => c.id)).toContain(customerId)
    expect(after.pastDueSubscriptions).toBe(before.pastDueSubscriptions + 1)
    expect(after.delinquencyRate).toBeGreaterThan(before.delinquencyRate!)
  })

  it('settles a Pix charge from the simulator and updates revenue and MRR', async () => {
    const customerId = await anyCustomerId()
    const created = await subscriptionsApi.create({
      customerId,
      planId: await planId('Solo'),
      paymentMethod: 'pix',
    })
    const before = await metricsApi.overview()

    await simulatorApi.payCharge(created.latestCharge!.id)

    const after = await metricsApi.overview()
    const charge = await latestCharge(customerId)
    expect(created.status).toBe('incomplete')
    expect(charge.status).toBe('paid')
    expect(await subscriptionsApi.get(created.id)).toMatchObject({
      status: 'active',
    })
    expect(after.monthlyRecurringRevenueCents).toBe(
      before.monthlyRecurringRevenueCents + created.latestCharge!.amountCents,
    )
    expect(after.revenueByMonth.at(-1)!.revenueCents).toBe(
      before.revenueByMonth.at(-1)!.revenueCents +
        created.latestCharge!.amountCents,
    )
  })

  it('runs scheduled retries when time is advanced and recovers the subscription', async () => {
    const customerId = await anyCustomerId()
    const created = await subscriptionsApi.create({
      customerId,
      planId: await planId('Studio'),
      paymentMethod: 'card',
      cardToken: 'tok_fail_then_success',
    })
    expect(created.status).toBe('past_due')

    const run = await simulatorApi.runRetriesNow()

    const charge = await latestCharge(customerId)
    expect(run.promoted).toBeGreaterThan(0)
    expect(charge.status).toBe('paid')
    expect(charge.attempts.map((a) => a.result)).toEqual([
      'declined',
      'succeeded',
    ])
    expect(await subscriptionsApi.get(created.id)).toMatchObject({
      status: 'active',
    })
  })

  it('forces a decline on an active card subscription through the simulator', async () => {
    const created = await subscriptionsApi.create({
      customerId: await anyCustomerId(),
      planId: await planId('Studio'),
      paymentMethod: 'card',
      cardToken: 'tok_fail_then_success',
    })

    await simulatorApi.setSubscriptionCard(created.id, 'tok_insufficient_funds')
    await simulatorApi.runRetriesNow()

    expect(await subscriptionsApi.get(created.id)).toMatchObject({
      status: 'past_due',
    })
  })

  it('resets back to the seed', async () => {
    const customerId = await anyCustomerId()
    await customersApi.create({
      name: 'Temporary School',
      email: 'temp@school.example',
    })
    await subscriptionsApi.create({
      customerId,
      planId: await planId('Solo'),
      paymentMethod: 'pix',
    })

    await simulatorApi.reset()

    const customers = await customersApi.list({ limit: 1 })
    const overview = await metricsApi.overview()
    expect(customers.meta.total).toBe(seed.customers.length)
    expect(
      Object.values(overview.subscriptionsByStatus).reduce(
        (total, count) => total + count,
        0,
      ),
    ).toBe(seed.subscriptions.length)
  })
})
