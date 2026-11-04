import { QueryClient } from '@tanstack/react-query'
import { invalidateAfter, keysToInvalidate, queryKeys } from './query-keys'

describe('queryKeys', () => {
  it('nests customer detail keys under the customer so one invalidation covers them', () => {
    const detail = queryKeys.customers.detail('cus_1')

    expect(
      queryKeys.customers.charges('cus_1').slice(0, detail.length),
    ).toEqual(detail)
    expect(
      queryKeys.customers.summary('cus_1').slice(0, detail.length),
    ).toEqual(detail)
    expect(detail.slice(0, 1)).toEqual(queryKeys.customers.all)
  })

  it('scopes lists and metrics under their roots', () => {
    expect(queryKeys.customers.list({ page: 1 })[0]).toBe(
      queryKeys.customers.all[0],
    )
    expect(queryKeys.plans.list({})[0]).toBe(queryKeys.plans.all[0])
    expect(queryKeys.metrics.overview()[0]).toBe(queryKeys.metrics.all[0])
    expect(queryKeys.subscriptions.detail('sub_1')).toEqual([
      'subscriptions',
      'sub_1',
    ])
  })
})

describe('invalidation map', () => {
  it.each([
    [
      { type: 'charge-paid', customerId: 'cus_1' },
      [['customers', 'detail', 'cus_1'], ['customers', 'list'], ['metrics']],
    ],
    [
      { type: 'card-changed', subscriptionId: 'sub_1' },
      [['subscriptions', 'sub_1']],
    ],
    [{ type: 'customer-created' }, [['customers', 'list']]],
    [{ type: 'plan-created' }, [['plans']]],
  ] as const)('maps %o to the data it changes', (event, keys) => {
    expect(keysToInvalidate(event)).toEqual(keys)
  })

  it('refreshes the customer, its subscription, lists and metrics when a subscription changes', () => {
    const keys = keysToInvalidate({
      type: 'subscription-canceled',
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
    })

    expect(keys).toContainEqual(['customers', 'detail', 'cus_1'])
    expect(keys).toContainEqual(['subscriptions', 'sub_1'])
    expect(keys).toContainEqual(['metrics'])
  })

  it('refreshes everything after retries run or the demo resets', async () => {
    const queryClient = new QueryClient()
    const keys = [
      ['customers', 'detail', 'cus_1', 'charges', {}],
      ['subscriptions', 'sub_1'],
      ['plans', 'list', {}],
      ['metrics', 'overview', {}],
    ]
    keys.forEach((key) => queryClient.setQueryData(key, {}))

    await invalidateAfter(queryClient, { type: 'demo-reset' })

    expect(
      keys.every((key) => queryClient.getQueryState(key)?.isInvalidated),
    ).toBe(true)
    expect(keysToInvalidate({ type: 'retries-run' })).toEqual(
      keysToInvalidate({ type: 'demo-reset' }),
    )
  })
})
