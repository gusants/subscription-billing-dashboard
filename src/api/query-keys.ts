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
    detail: (id: string) => ['subscriptions', id] as const,
  },
  metrics: {
    all: ['metrics'] as const,
    overview: (params: MetricsOverviewParams = {}) =>
      ['metrics', 'overview', params] as const,
  },
}
