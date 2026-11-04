import type {
  CardToken,
  Charge,
  Customer,
  CustomerSummary,
  Plan,
  Subscription,
} from '../api/contract'

export type DemoSubscription = Subscription & {
  cardToken: CardToken | null
}

export type DemoCharge = Charge & {
  nextRetryAt: string | null
  expiresAt: string | null
}

export type DemoSummary = Pick<
  CustomerSummary,
  'summary' | 'paymentBehavior' | 'riskLevel' | 'suggestedAction'
>

export type DemoDatabase = {
  synthetic: true
  now: string
  plans: Plan[]
  customers: Customer[]
  subscriptions: DemoSubscription[]
  charges: DemoCharge[]
  summaries: Record<string, DemoSummary>
}
