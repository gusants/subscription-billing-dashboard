import { infiniteQueryOptions } from '@tanstack/react-query'
import { customersApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'

export const CHARGES_PAGE_SIZE = 10

export function customerChargesQuery(customerId: string) {
  return infiniteQueryOptions({
    queryKey: queryKeys.customers.charges(customerId, {
      limit: CHARGES_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      customersApi.charges(customerId, {
        page: pageParam,
        limit: CHARGES_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  })
}
