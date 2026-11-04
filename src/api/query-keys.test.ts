import { queryKeys } from './query-keys'

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
