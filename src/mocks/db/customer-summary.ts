import type {
  CustomerSummary,
  PaymentBehavior,
  RiskLevel,
} from '../../api/contract'
import type { DemoCharge, DemoDatabase, DemoSummary } from '../demo-types'
import seed from '../seed.json'
import { daysBetween } from './clock'
import { chargesOf, findCustomer, subscriptionsOf } from './lookups'

const PROMPT_VERSION = 'v1'
const AVERAGE_DAYS_PER_MONTH = 30.44
const RESOLVED_CHARGE_STATUSES = new Set([
  'paid',
  'failed',
  'expired',
  'uncollectible',
])
const LATE_DAYS_THRESHOLD = 2
const FREQUENT_DELAY_SUCCESS_RATE = 0.8
const HIGH_RISK_FAILED_ATTEMPTS = 3
const seedDatabase = seed as DemoDatabase

type SummaryMetrics = CustomerSummary['metrics']

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function fingerprint(charges: DemoCharge[]) {
  return charges
    .map((charge) => `${charge.id}:${charge.status}:${charge.attemptCount}`)
    .sort()
    .join('|')
}

function isUnchangedSinceSeed(db: DemoDatabase, customerId: string) {
  return (
    fingerprint(chargesOf(db, customerId)) ===
    fingerprint(chargesOf(seedDatabase, customerId))
  )
}

function computeMetrics(db: DemoDatabase, customerId: string): SummaryMetrics {
  const customer = findCustomer(db, customerId)
  const charges = chargesOf(db, customerId)
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
  const firstSubscription = subscriptionsOf(db, customerId)
    .map((s) => s.createdAt)
    .sort()[0]

  return {
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
  }
}

function paymentBehavior(metrics: SummaryMetrics): PaymentBehavior {
  if (metrics.failedAttempts === 0 && metrics.averageDaysLate < 1)
    return 'on_time'
  if (metrics.paymentSuccessRate < FREQUENT_DELAY_SUCCESS_RATE)
    return 'frequent_delays'
  return 'occasional_delays'
}

function riskLevel(
  db: DemoDatabase,
  customerId: string,
  metrics: SummaryMetrics,
): RiskLevel {
  const statuses = subscriptionsOf(db, customerId).map((s) => s.status)
  if (
    statuses.includes('past_due') &&
    metrics.failedAttempts >= HIGH_RISK_FAILED_ATTEMPTS
  )
    return 'high'
  if (
    statuses.includes('past_due') ||
    metrics.averageDaysLate > LATE_DAYS_THRESHOLD
  )
    return 'medium'
  return 'low'
}

const ruleSummaries: Record<
  RiskLevel,
  Pick<DemoSummary, 'summary' | 'suggestedAction'>
> = {
  low: {
    summary: 'Payments are settling normally. No open overdue charge.',
    suggestedAction: 'No action needed.',
  },
  medium: {
    summary: 'There is an overdue charge or payments are arriving late.',
    suggestedAction:
      'Contact the customer and offer a Pix payment link for the open charge.',
  },
  high: {
    summary:
      'Several declined attempts on an overdue subscription. Retries may run out soon.',
    suggestedAction:
      'Call the customer today and ask for a new payment method before the next retry.',
  },
}

function ruleBasedNarrative(
  db: DemoDatabase,
  customerId: string,
  metrics: SummaryMetrics,
): DemoSummary {
  const risk = riskLevel(db, customerId, metrics)
  return {
    ...ruleSummaries[risk],
    riskLevel: risk,
    paymentBehavior: paymentBehavior(metrics),
  }
}

export function customerSummary(
  db: DemoDatabase,
  customerId: string,
  { isLlmFailing }: { isLlmFailing: boolean },
): CustomerSummary {
  const metrics = computeMetrics(db, customerId)
  const preWritten = db.summaries[customerId]
  const usePreWritten =
    !isLlmFailing &&
    preWritten !== undefined &&
    isUnchangedSinceSeed(db, customerId)
  const narrative = usePreWritten
    ? preWritten
    : ruleBasedNarrative(db, customerId, metrics)

  return {
    customerId,
    source: usePreWritten ? 'llm' : 'fallback',
    promptVersion: PROMPT_VERSION,
    metrics,
    ...narrative,
  }
}
