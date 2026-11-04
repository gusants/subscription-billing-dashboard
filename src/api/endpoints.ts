import { api, unwrap } from './client'
import type {
  CardToken,
  ChargeHistoryParams,
  CreateCustomerInput,
  CreatePlanInput,
  CreateSubscriptionInput,
  CustomerListParams,
  MetricsOverviewParams,
  PlanListParams,
} from './contract'

const byId = (id: string) => ({ params: { path: { id } } })

export const customersApi = {
  list: (params: CustomerListParams = {}) =>
    unwrap(api.GET('/customers', { params: { query: params } })),
  get: (id: string) => unwrap(api.GET('/customers/{id}', byId(id))),
  create: (input: CreateCustomerInput) =>
    unwrap(api.POST('/customers', { body: input })),
  charges: (id: string, params: ChargeHistoryParams = {}) =>
    unwrap(
      api.GET('/customers/{id}/charges', {
        params: { path: { id }, query: params },
      }),
    ),
  summary: (id: string) => unwrap(api.GET('/customers/{id}/summary', byId(id))),
}

export const plansApi = {
  list: (params: PlanListParams = {}) =>
    unwrap(api.GET('/plans', { params: { query: params } })),
  create: (input: CreatePlanInput) =>
    unwrap(api.POST('/plans', { body: input })),
}

export const subscriptionsApi = {
  get: (id: string) => unwrap(api.GET('/subscriptions/{id}', byId(id))),
  create: (input: CreateSubscriptionInput, idempotencyKey?: string) =>
    unwrap(
      api.POST('/subscriptions', {
        body: input,
        params: { header: { 'Idempotency-Key': idempotencyKey } },
      }),
    ),
  cancel: (id: string) =>
    unwrap(api.POST('/subscriptions/{id}/cancel', byId(id))),
}

export const chargesApi = {
  retry: (id: string) => unwrap(api.POST('/charges/{id}/retry', byId(id))),
}

export const metricsApi = {
  overview: (params: MetricsOverviewParams = {}) =>
    unwrap(api.GET('/metrics/overview', { params: { query: params } })),
}

export const simulatorApi = {
  payCharge: (chargeId: string) =>
    unwrap(api.POST('/fake-gateway/charges/{id}/pay', byId(chargeId))),
  expireCharge: (chargeId: string) =>
    unwrap(api.POST('/fake-gateway/charges/{id}/expire', byId(chargeId))),
  setSubscriptionCard: (subscriptionId: string, cardToken: CardToken) =>
    unwrap(
      api.POST('/fake-gateway/subscriptions/{id}/card', {
        ...byId(subscriptionId),
        body: { cardToken },
      }),
    ),
  runRetriesNow: () => unwrap(api.POST('/dev/retries/run-now')),
  reset: () => unwrap(api.POST('/fake-gateway/reset')),
}
