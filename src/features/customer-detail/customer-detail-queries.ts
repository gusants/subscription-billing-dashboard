import { queryOptions } from '@tanstack/react-query'
import type { CustomerDetail } from '../../api/contract'
import { customersApi, subscriptionsApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'

export function customerDetailQuery(customerId: string) {
  return queryOptions({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => customersApi.get(customerId),
  })
}

export function subscriptionQuery(subscriptionId: string) {
  return queryOptions({
    queryKey: queryKeys.subscriptions.detail(subscriptionId),
    queryFn: () => subscriptionsApi.get(subscriptionId),
  })
}

type SubscriptionRef = CustomerDetail['subscriptions'][number]

const STATUS_PRIORITY: Record<SubscriptionRef['status'], number> = {
  past_due: 0,
  incomplete: 1,
  active: 2,
  canceled: 3,
}

export function primarySubscription(subscriptions: SubscriptionRef[]) {
  return [...subscriptions].sort(
    (a, b) =>
      STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
      b.currentPeriodEnd.localeCompare(a.currentPeriodEnd),
  )[0]
}
