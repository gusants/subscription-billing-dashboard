import { request } from './client'
import type {
  CardToken,
  ChargeHistory,
  ChargeHistoryParams,
  ChargeRetryResult,
  CreateCustomerInput,
  CreatePlanInput,
  CreateSubscriptionInput,
  CreatedSubscription,
  Customer,
  CustomerDetail,
  CustomerList,
  CustomerListParams,
  CustomerSummary,
  MetricsOverview,
  MetricsOverviewParams,
  Plan,
  PlanList,
  PlanListParams,
  RetriesRunResult,
  Subscription,
} from './contract'

export const customersApi = {
  list: (params: CustomerListParams = {}) =>
    request<CustomerList>('/customers', { query: params }),
  get: (id: string) => request<CustomerDetail>(`/customers/${id}`),
  create: (input: CreateCustomerInput) =>
    request<Customer>('/customers', { method: 'POST', body: input }),
  charges: (id: string, params: ChargeHistoryParams = {}) =>
    request<ChargeHistory>(`/customers/${id}/charges`, { query: params }),
  summary: (id: string) => request<CustomerSummary>(`/customers/${id}/summary`),
}

export const plansApi = {
  list: (params: PlanListParams = {}) =>
    request<PlanList>('/plans', { query: params }),
  create: (input: CreatePlanInput) =>
    request<Plan>('/plans', { method: 'POST', body: input }),
}

export const subscriptionsApi = {
  get: (id: string) => request<Subscription>(`/subscriptions/${id}`),
  create: (input: CreateSubscriptionInput) =>
    request<CreatedSubscription>('/subscriptions', {
      method: 'POST',
      body: input,
    }),
  cancel: (id: string) =>
    request<Subscription>(`/subscriptions/${id}/cancel`, { method: 'POST' }),
}

export const chargesApi = {
  retry: (id: string) =>
    request<ChargeRetryResult>(`/charges/${id}/retry`, { method: 'POST' }),
}

export const metricsApi = {
  overview: (params: MetricsOverviewParams = {}) =>
    request<MetricsOverview>('/metrics/overview', { query: params }),
}

export const simulatorApi = {
  payCharge: (chargeId: string) =>
    request<void>(`/fake-gateway/charges/${chargeId}/pay`, { method: 'POST' }),
  expireCharge: (chargeId: string) =>
    request<void>(`/fake-gateway/charges/${chargeId}/expire`, {
      method: 'POST',
    }),
  setSubscriptionCard: (subscriptionId: string, cardToken: CardToken) =>
    request<void>(`/fake-gateway/subscriptions/${subscriptionId}/card`, {
      method: 'POST',
      body: { cardToken },
    }),
  runRetriesNow: () =>
    request<RetriesRunResult>('/dev/retries/run-now', { method: 'POST' }),
  reset: () => request<void>('/fake-gateway/reset', { method: 'POST' }),
}
