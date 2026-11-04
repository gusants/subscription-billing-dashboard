import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { metricsApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'
import type { DateRange } from './overview-period'

export function metricsOverviewQuery(range: DateRange) {
  return queryOptions({
    queryKey: queryKeys.metrics.overview(range),
    queryFn: () => metricsApi.overview(range),
    placeholderData: keepPreviousData,
  })
}
