import type {
  ChargeHistoryParams,
  CustomerListParams,
  GatewayCharge,
  PlanListParams,
} from '../../api/contract'
import type { DemoCharge, DemoDatabase, DemoSubscription } from '../demo-types'
import { chargesOf, findCustomer, subscriptionsOf } from './lookups'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

type PageParams = { page?: number; limit?: number }

export function paginate<T>(
  items: T[],
  { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PageParams,
) {
  const start = (page - 1) * limit
  return {
    data: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  }
}

function newestFirst<T extends { createdAt: string }>(a: T, b: T) {
  return b.createdAt.localeCompare(a.createdAt)
}

function matchesSearch(search: string | undefined, ...fields: string[]) {
  if (!search) return true
  const needle = search.toLocaleLowerCase()
  return fields.some((field) => field.toLocaleLowerCase().includes(needle))
}

export function listCustomers(db: DemoDatabase, params: CustomerListParams) {
  const matches = db.customers.filter(
    (customer) =>
      matchesSearch(params.search, customer.name, customer.email) &&
      (!params.subscriptionStatus ||
        subscriptionsOf(db, customer.id).some(
          (s) => s.status === params.subscriptionStatus,
        )),
  )
  return paginate([...matches].sort(newestFirst), params)
}

function toSubscriptionSummary({
  id,
  planId,
  status,
  currentPeriodEnd,
}: DemoSubscription) {
  return { id, planId, status, currentPeriodEnd }
}

export function customerDetail(db: DemoDatabase, id: string) {
  const customer = findCustomer(db, id)
  return {
    ...customer,
    subscriptions: subscriptionsOf(db, id)
      .sort(newestFirst)
      .map(toSubscriptionSummary),
  }
}

export function toPublicCharge({
  nextRetryAt: _retry,
  expiresAt: _expires,
  ...charge
}: DemoCharge) {
  return charge
}

export function toGatewayCharge(db: DemoDatabase, charge: DemoCharge) {
  const subscription = db.subscriptions.find(
    (candidate) => candidate.id === charge.subscriptionId,
  )
  return {
    id: `gw_${charge.id}`,
    customerId: subscription?.customerId ?? '',
    externalRef: charge.id,
    amountCents: charge.amountCents,
    method: charge.method,
    status: charge.status === 'uncollectible' ? 'failed' : charge.status,
    createdAt: charge.createdAt,
    ...(charge.paidAt ? { paidAt: charge.paidAt } : {}),
    ...(charge.expiresAt ? { expiresAt: charge.expiresAt } : {}),
  } satisfies GatewayCharge
}

export function toPublicSubscription({
  cardToken: _cardToken,
  ...subscription
}: DemoSubscription) {
  return subscription
}

export function customerCharges(
  db: DemoDatabase,
  id: string,
  params: ChargeHistoryParams,
) {
  findCustomer(db, id)
  const charges = [...chargesOf(db, id)].sort(newestFirst).map(toPublicCharge)
  return paginate(charges, params)
}

export function listPlans(db: DemoDatabase, params: PlanListParams) {
  const plans = params.active
    ? db.plans.filter((plan) => String(plan.active) === params.active)
    : db.plans
  return paginate([...plans].sort(newestFirst), params)
}
