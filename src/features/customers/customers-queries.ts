import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { CustomerListParams } from '../../api/contract'
import { customersApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'

export function customersListQuery(params: CustomerListParams) {
  return queryOptions({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData,
  })
}
