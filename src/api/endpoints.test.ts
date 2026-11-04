import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../lib/env'
import { server } from '../mocks/node'
import {
  chargesApi,
  customersApi,
  metricsApi,
  plansApi,
  simulatorApi,
  subscriptionsApi,
} from './endpoints'

type RecordedRequest = {
  method: string
  path: string
  search: string
  body: unknown
}

function recordRequests() {
  const recorded: RecordedRequest[] = []
  server.use(
    http.all(`${apiBaseUrl}/*`, async ({ request }) => {
      const url = new URL(request.url)
      const text = await request.text()
      recorded.push({
        method: request.method,
        path: url.pathname.replace(apiBaseUrl, ''),
        search: url.search,
        body: text ? JSON.parse(text) : undefined,
      })
      return HttpResponse.json({})
    }),
  )
  return recorded
}

describe('endpoints', () => {
  it.each([
    [
      'customers.list',
      () => customersApi.list({ page: 2 }),
      'GET',
      '/customers',
      '?page=2',
    ],
    [
      'customers.get',
      () => customersApi.get('cus_1'),
      'GET',
      '/customers/cus_1',
      '',
    ],
    [
      'customers.charges',
      () => customersApi.charges('cus_1', { limit: 5 }),
      'GET',
      '/customers/cus_1/charges',
      '?limit=5',
    ],
    [
      'customers.summary',
      () => customersApi.summary('cus_1'),
      'GET',
      '/customers/cus_1/summary',
      '',
    ],
    ['plans.list', () => plansApi.list(), 'GET', '/plans', ''],
    [
      'subscriptions.get',
      () => subscriptionsApi.get('sub_1'),
      'GET',
      '/subscriptions/sub_1',
      '',
    ],
    [
      'subscriptions.cancel',
      () => subscriptionsApi.cancel('sub_1'),
      'POST',
      '/subscriptions/sub_1/cancel',
      '',
    ],
    [
      'charges.retry',
      () => chargesApi.retry('chg_1'),
      'POST',
      '/charges/chg_1/retry',
      '',
    ],
    [
      'metrics.overview',
      () => metricsApi.overview({ from: '2026-11-01' }),
      'GET',
      '/metrics/overview',
      '?from=2026-11-01',
    ],
    [
      'simulator.payCharge',
      () => simulatorApi.payCharge('chg_1'),
      'POST',
      '/fake-gateway/charges/chg_1/pay',
      '',
    ],
    [
      'simulator.expireCharge',
      () => simulatorApi.expireCharge('chg_1'),
      'POST',
      '/fake-gateway/charges/chg_1/expire',
      '',
    ],
    [
      'simulator.runRetriesNow',
      () => simulatorApi.runRetriesNow(),
      'POST',
      '/dev/retries/run-now',
      '',
    ],
    [
      'simulator.reset',
      () => simulatorApi.reset(),
      'POST',
      '/fake-gateway/reset',
      '',
    ],
  ])('%s calls %s %s', async (_name, call, method, path, search) => {
    const recorded = recordRequests()

    await call()

    expect(recorded).toEqual([
      expect.objectContaining({ method, path, search }),
    ])
  })

  it.each([
    [
      'customers.create',
      () => customersApi.create({ name: 'Allegro', email: 'ops@allegro.test' }),
      '/customers',
      { name: 'Allegro', email: 'ops@allegro.test' },
    ],
    [
      'plans.create',
      () =>
        plansApi.create({
          name: 'Studio',
          amountCents: 38990,
          interval: 'monthly',
        }),
      '/plans',
      { name: 'Studio', amountCents: 38990, interval: 'monthly' },
    ],
    [
      'subscriptions.create',
      () =>
        subscriptionsApi.create({
          customerId: 'cus_1',
          planId: 'pln_1',
          paymentMethod: 'pix',
        }),
      '/subscriptions',
      { customerId: 'cus_1', planId: 'pln_1', paymentMethod: 'pix' },
    ],
    [
      'simulator.setSubscriptionCard',
      () => simulatorApi.setSubscriptionCard('sub_1', 'tok_insufficient_funds'),
      '/fake-gateway/subscriptions/sub_1/card',
      { cardToken: 'tok_insufficient_funds' },
    ],
  ])('%s posts its body to %s', async (_name, call, path, body) => {
    const recorded = recordRequests()

    await call()

    expect(recorded).toEqual([
      expect.objectContaining({ method: 'POST', path, body }),
    ])
  })
})
