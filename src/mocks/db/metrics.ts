import type {
  MetricsOverview,
  MetricsOverviewParams,
  Plan,
  SubscriptionStatus,
} from '../../api/contract'
import type { DemoCharge, DemoDatabase, DemoSubscription } from '../demo-types'
import { addMonths } from './clock'
import { findPlan } from './lookups'

const MONTHS_IN_CHART = 12
const MONTHS_PER_YEAR = 12

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

const START_OF_DAY = 'T00:00:00.000Z'
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
  const fromDate = params.from ?? startOfMonth(now).toISOString().slice(0, 10)
  const toDate = params.to ?? now.toISOString().slice(0, 10)
  const from = `${fromDate}${START_OF_DAY}`
  const to = `${toDate}${END_OF_DAY}`
  const statuses = db.subscriptions.flatMap((subscription) => {
    const status = statusAt(db, subscription, to)
    return status ? [{ subscription, status }] : []
  })
  const count = (status: SubscriptionStatus) =>
    statuses.filter((entry) => entry.status === status).length
  const activeSubscriptions = count('active')
  const pastDueSubscriptions = count('past_due')
  const canceledForPaymentFailure = statuses.filter(
    ({ subscription, status }) =>
      status === 'canceled' &&
      subscription.cancelReason === 'payment_failed' &&
      subscription.canceledAt !== null &&
      subscription.canceledAt >= from,
  ).length
  const denominator =
    activeSubscriptions + pastDueSubscriptions + canceledForPaymentFailure

  return {
    from,
    to,
    monthlyRecurringRevenueCents: statuses
      .filter((entry) => entry.status === 'active')
      .reduce(
        (total, { subscription }) =>
          total + monthlyAmountCents(findPlan(db, subscription.planId)),
        0,
      ),
    activeSubscriptions,
    pastDueSubscriptions,
    delinquencyRate:
      denominator === 0
        ? null
        : roundTo(
            (pastDueSubscriptions + canceledForPaymentFailure) / denominator,
            4,
          ),
    revenueByMonth: revenueByMonth(db, new Date(to)),
    subscriptionsByStatus: {
      active: activeSubscriptions,
      past_due: pastDueSubscriptions,
      incomplete: count('incomplete'),
      canceled: count('canceled'),
    },
  }
}
