import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type {
  ChargeHistoryParams,
  CustomerListParams,
  MetricsOverviewParams,
  PlanListParams,
} from './contract'

export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    list: (params: CustomerListParams) =>
      ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    charges: (id: string, params: ChargeHistoryParams = {}) =>
      ['customers', 'detail', id, 'charges', params] as const,
    summary: (id: string) => ['customers', 'detail', id, 'summary'] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: (params: PlanListParams) => ['plans', 'list', params] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    detail: (id: string) => ['subscriptions', id] as const,
  },
  metrics: {
    all: ['metrics'] as const,
    overview: (params: MetricsOverviewParams = {}) =>
      ['metrics', 'overview', params] as const,
  },
}

export type BillingEvent =
  | {
      type: 'charge-paid' | 'charge-expired' | 'charge-retried'
      customerId: string
    }
  | {
      type: 'subscription-created' | 'subscription-canceled'
      customerId: string
      subscriptionId: string
    }
  | { type: 'card-changed'; subscriptionId: string }
  | { type: 'customer-created' | 'plan-created' | 'retries-run' | 'demo-reset' }

const customerLists = ['customers', 'list'] as const

export function keysToInvalidate(event: BillingEvent): readonly QueryKey[] {
  switch (event.type) {
    case 'charge-paid':
    case 'charge-expired':
    case 'charge-retried':
      return [
        queryKeys.customers.detail(event.customerId),
        customerLists,
        queryKeys.metrics.all,
      ]
    case 'subscription-created':
    case 'subscription-canceled':
      return [
        queryKeys.customers.detail(event.customerId),
        queryKeys.subscriptions.detail(event.subscriptionId),
        customerLists,
        queryKeys.metrics.all,
      ]
    case 'card-changed':
      return [queryKeys.subscriptions.detail(event.subscriptionId)]
    case 'customer-created':
      return [customerLists]
    case 'plan-created':
      return [queryKeys.plans.all]
    case 'retries-run':
    case 'demo-reset':
      return [
        queryKeys.customers.all,
        queryKeys.subscriptions.all,
        queryKeys.plans.all,
        queryKeys.metrics.all,
      ]
  }
}

export function invalidateAfter(queryClient: QueryClient, event: BillingEvent) {
  return Promise.all(
    keysToInvalidate(event).map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  )
}
