import { queryOptions } from '@tanstack/react-query'
import type { Plan } from '../../api/contract'
import { plansApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'

const ALL_PLANS = { limit: 100 } as const

export function allPlansQuery() {
  return queryOptions({
    queryKey: queryKeys.plans.list(ALL_PLANS),
    queryFn: () => plansApi.list(ALL_PLANS),
    select: (list) =>
      new Map<string, Plan>(list.data.map((plan) => [plan.id, plan])),
  })
}
