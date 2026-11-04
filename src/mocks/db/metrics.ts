import type {
  CustomerSummary,
  MetricsOverview,
  MetricsOverviewParams,
  Plan,
  SubscriptionStatus,
} from '../../api/contract'
import type { DemoCharge, DemoDatabase, DemoSubscription } from '../demo-types'
import { addMonths, daysBetween } from './clock'
import { notFound } from './demo-api-error'
import { chargesOf, findCustomer, findPlan, subscriptionsOf } from './lookups'

const MONTHS_IN_CHART = 12
const MONTHS_PER_YEAR = 12
const AVERAGE_DAYS_PER_MONTH = 30.44
const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'active',
  'past_due',
  'incomplete',
  'canceled',
]
const RESOLVED_CHARGE_STATUSES = new Set([
  'paid',
  'failed',
  'expired',
  'uncollectible',
])
const DEMO_PROMPT_VERSION = 'demo'

function monthlyAmountCents(plan: Plan) {
  return plan.interval === 'yearly'
    ? Math.round(plan.amountCents / MONTHS_PER_YEAR)
    : plan.amountCents
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function revenueByMonth(db: DemoDatabase, lastMonth: Date) {
  const firstMonth = addMonths(startOfMonth(lastMonth), -(MONTHS_IN_CHART - 1))
  const months = Array.from({ length: MONTHS_IN_CHART }, (_, index) =>
    monthKey(addMonths(firstMonth, index)),
  )
  const totals = new Map(months.map((month) => [month, 0]))
  for (const charge of db.charges) {
    if (charge.status !== 'paid' || !charge.paidAt) continue
    const month = charge.paidAt.slice(0, 7)
    const total = totals.get(month)
    if (total !== undefined) totals.set(month, total + charge.amountCents)
  }
  return months.map((month) => ({
    month,
    revenueCents: totals.get(month) ?? 0,
  }))
}

const END_OF_DAY = 'T23:59:59.999Z'

function isPaidBy(charge: DemoCharge, at: string) {
  return charge.paidAt !== null && charge.paidAt <= at
}

function becameOverdueAt(charge: DemoCharge) {
  const firstDecline = charge.attempts.find(
    (attempt) => attempt.result === 'declined',
  )
  return (
    firstDecline?.createdAt ??
    (charge.status === 'expired' ? charge.expiresAt : null)
  )
}

function statusAt(
  db: DemoDatabase,
  subscription: DemoSubscription,
  at: string,
): SubscriptionStatus | null {
  if (at >= db.now) return subscription.status
  if (subscription.createdAt > at) return null
  if (subscription.canceledAt && subscription.canceledAt <= at)
    return 'canceled'
  const charges = db.charges.filter(
    (charge) =>
      charge.subscriptionId === subscription.id && charge.createdAt <= at,
  )
  const isOverdue = charges.some((charge) => {
    const overdueSince = becameOverdueAt(charge)
    return overdueSince !== null && overdueSince <= at && !isPaidBy(charge, at)
  })
  if (isOverdue) return 'past_due'
  return charges.some((charge) => isPaidBy(charge, at))
    ? 'active'
    : 'incomplete'
}

export function metricsOverview(
  db: DemoDatabase,
  params: MetricsOverviewParams,
): MetricsOverview {
  const now = new Date(db.now)
  const from = params.from ?? startOfMonth(now).toISOString().slice(0, 10)
  const to = params.to ?? now.toISOString().slice(0, 10)
  const statuses = db.subscriptions.flatMap((subscription) => {
    const status = statusAt(db, subscription, `${to}${END_OF_DAY}`)
    return status ? [{ subscription, status }] : []
  })
  const count = (status: SubscriptionStatus) =>
    statuses.filter((entry) => entry.status === status).length
  const billable = statuses.filter(
    (entry) => entry.status === 'active' || entry.status === 'past_due',
  )
  const pastDueSubscriptions = count('past_due')

  return {
    period: { from, to },
    mrrCents: billable.reduce(
      (total, { subscription }) =>
        total + monthlyAmountCents(findPlan(db, subscription.planId)),
      0,
    ),
    activeSubscriptions: count('active'),
    pastDueSubscriptions,
    delinquencyRate:
      billable.length === 0
        ? 0
        : roundTo(pastDueSubscriptions / billable.length, 4),
    revenueByMonth: revenueByMonth(db, new Date(to)),
    subscriptionsByStatus: SUBSCRIPTION_STATUSES.map((status) => ({
      status,
      count: count(status),
    })),
  }
}

export function customerSummary(db: DemoDatabase, id: string): CustomerSummary {
  const customer = findCustomer(db, id)
  const narrative = db.summaries[id]
  if (!narrative) throw notFound('Summary for customer', id)

  const charges = chargesOf(db, id)
  const paid = charges.filter(
    (charge) => charge.status === 'paid' && charge.paidAt,
  )
  const resolved = charges.filter((charge) =>
    RESOLVED_CHARGE_STATUSES.has(charge.status),
  )
  const daysLate = paid.map((charge) =>
    Math.max(
      0,
      daysBetween(
        new Date(charge.dueDate),
        new Date(charge.paidAt ?? charge.dueDate),
      ),
    ),
  )
  const firstSubscription = subscriptionsOf(db, id)
    .map((s) => s.createdAt)
    .sort()[0]

  return {
    customerId: customer.id,
    source: 'fallback',
    promptVersion: DEMO_PROMPT_VERSION,
    metrics: {
      monthsAsCustomer: Math.floor(
        daysBetween(
          new Date(firstSubscription ?? customer.createdAt),
          new Date(db.now),
        ) / AVERAGE_DAYS_PER_MONTH,
      ),
      totalPaidCents: paid.reduce(
        (total, charge) => total + charge.amountCents,
        0,
      ),
      failedAttempts: charges
        .flatMap((charge) => charge.attempts)
        .filter((a) => a.result === 'declined').length,
      averageDaysLate:
        daysLate.length === 0
          ? 0
          : roundTo(daysLate.reduce((a, b) => a + b, 0) / daysLate.length, 1),
      paymentSuccessRate:
        resolved.length === 0 ? 0 : roundTo(paid.length / resolved.length, 2),
    },
    ...narrative,
  }
}
