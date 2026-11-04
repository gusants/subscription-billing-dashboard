import type { components, paths } from './generated/schema'

type Schemas = components['schemas']

export type ApiErrorBody = Schemas['ErrorResponseDto']
export type PageMeta = Schemas['CustomerListResponseDto_Output']['meta']

export type Customer = Schemas['CustomerResponseDto_Output']
export type CustomerList = Schemas['CustomerListResponseDto_Output']
export type CustomerDetail = Schemas['CustomerDetailResponseDto_Output']
export type CreateCustomerInput = Schemas['CreateCustomerDto']
export type CustomerListParams = NonNullable<
  paths['/customers']['get']['parameters']['query']
>

export type Plan = Schemas['PlanResponseDto_Output']
export type PlanList = Schemas['PlanListResponseDto_Output']
export type PlanInterval = Plan['interval']
export type CreatePlanInput = Schemas['CreatePlanDto']
export type PlanListParams = NonNullable<
  paths['/plans']['get']['parameters']['query']
>

export type Subscription = Schemas['SubscriptionResponseDto_Output']
export type SubscriptionStatus = Subscription['status']
export type PaymentMethod = Subscription['paymentMethod']
export type CreatedSubscription =
  Schemas['CreatedSubscriptionResponseDto_Output']
export type CreateSubscriptionInput = Schemas['CreateSubscriptionDto']

export type ChargeHistory = Schemas['ChargeHistoryResponseDto_Output']
export type Charge = ChargeHistory['data'][number]
export type ChargeStatus = Charge['status']
export type PaymentAttempt = Charge['attempts'][number]
export type ChargeRetryResult = Schemas['ChargeRetryResponseDto_Output']
export type ChargeHistoryParams = NonNullable<
  paths['/customers/{id}/charges']['get']['parameters']['query']
>

export type CardToken =
  | 'tok_success'
  | 'tok_insufficient_funds'
  | 'tok_expired_card'
  | 'tok_fail_then_success'

export type RevenuePoint = {
  month: string
  revenueCents: number
}

export type SubscriptionsByStatus = {
  status: SubscriptionStatus
  count: number
}

export type MetricsOverview = {
  period: { from: string; to: string }
  mrrCents: number
  activeSubscriptions: number
  pastDueSubscriptions: number
  delinquencyRate: number
  revenueByMonth: RevenuePoint[]
  subscriptionsByStatus: SubscriptionsByStatus[]
}

export type MetricsOverviewParams = {
  from?: string
  to?: string
}

export type RiskLevel = 'baixo' | 'medio' | 'alto'

export type PaymentBehavior =
  'em_dia' | 'atrasos_ocasionais' | 'inadimplente_recorrente'

export type CustomerSummary = {
  customerId: string
  source: 'llm' | 'fallback'
  promptVersion: string
  metrics: {
    monthsAsCustomer: number
    totalPaidCents: number
    failedAttempts: number
    averageDaysLate: number
    paymentSuccessRate: number
  }
  summary: string
  paymentBehavior: PaymentBehavior
  riskLevel: RiskLevel
  suggestedAction: string
}

export type RetriesRunResult = {
  promoted: number
}
