import type {
  CancelReason,
  CardToken,
  CreateSubscriptionInput,
  PaymentMethod,
  Plan,
} from '../../api/contract'
import {
  BOLETO_DUE_IN_DAYS,
  BOLETO_EXPIRES_AFTER_DUE_DAYS,
  PIX_EXPIRES_IN_DAYS,
  RETRY_SCHEDULE_DAYS,
} from '../billing-rules'
import type { DemoCharge, DemoDatabase, DemoSubscription } from '../demo-types'
import { decideCardOutcome, toCardToken } from './card-gateway'
import { addDays, addMonths, newId, tick } from './clock'
import { conflict, unprocessable } from './demo-api-error'
import { findCharge, findCustomer, findPlan, findSubscription } from './lookups'

function periodEnd(start: Date, plan: Plan) {
  return addMonths(start, plan.interval === 'yearly' ? 12 : 1)
}

function instantChargeDates(method: PaymentMethod, issuedAt: Date) {
  if (method === 'boleto') {
    const dueDate = addDays(issuedAt, BOLETO_DUE_IN_DAYS)
    return {
      dueDate,
      expiresAt: addDays(dueDate, BOLETO_EXPIRES_AFTER_DUE_DAYS),
    }
  }
  return {
    dueDate: issuedAt,
    expiresAt: addDays(issuedAt, PIX_EXPIRES_IN_DAYS),
  }
}

function issueCharge(
  db: DemoDatabase,
  subscription: DemoSubscription,
  amountCents: number,
  issuedAt: Date,
): DemoCharge {
  const isCard = subscription.paymentMethod === 'card'
  const dates = isCard
    ? { dueDate: issuedAt, expiresAt: null }
    : instantChargeDates(subscription.paymentMethod, issuedAt)
  const charge: DemoCharge = {
    id: newId('chg'),
    subscriptionId: subscription.id,
    amountCents,
    method: subscription.paymentMethod,
    status: 'pending',
    attemptCount: 0,
    attempts: [],
    createdAt: issuedAt.toISOString(),
    dueDate: dates.dueDate.toISOString(),
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    paidAt: null,
    nextRetryAt: null,
    expiresAt: dates.expiresAt?.toISOString() ?? null,
  }
  db.charges.push(charge)
  return charge
}

function cancel(
  subscription: DemoSubscription,
  at: Date,
  reason: CancelReason,
) {
  subscription.status = 'canceled'
  subscription.cancelReason = reason
  subscription.canceledAt = at.toISOString()
  subscription.updatedAt = at.toISOString()
}

function markPaid(db: DemoDatabase, charge: DemoCharge, at: Date) {
  charge.status = 'paid'
  charge.paidAt = at.toISOString()
  charge.nextRetryAt = null
  const subscription = findSubscription(db, charge.subscriptionId)
  if (subscription.status !== 'canceled') subscription.status = 'active'
  subscription.updatedAt = at.toISOString()
}

function markPastDue(subscription: DemoSubscription, at: Date) {
  if (subscription.status === 'active') subscription.status = 'past_due'
  subscription.updatedAt = at.toISOString()
}

function attemptCardCharge(db: DemoDatabase, charge: DemoCharge, at: Date) {
  const subscription = findSubscription(db, charge.subscriptionId)
  const attemptNumber = charge.attemptCount + 1
  const outcome = decideCardOutcome(subscription.cardToken, attemptNumber)
  charge.attempts.push({
    id: newId('att'),
    createdAt: at.toISOString(),
    ...outcome,
  })
  charge.attemptCount = attemptNumber

  if (outcome.result === 'succeeded') {
    markPaid(db, charge, at)
    return
  }

  const retryInDays = RETRY_SCHEDULE_DAYS[attemptNumber - 1]
  const firstAttemptAt = new Date(charge.attempts[0]?.createdAt ?? at)
  if (retryInDays === undefined) {
    charge.status = 'uncollectible'
    charge.nextRetryAt = null
    cancel(subscription, at, 'payment_failed')
    return
  }
  charge.status = 'failed'
  charge.nextRetryAt = addDays(firstAttemptAt, retryInDays).toISOString()
  if (subscription.status === 'incomplete') subscription.status = 'past_due'
  markPastDue(subscription, at)
}

function expiredReissues(db: DemoDatabase, charge: DemoCharge) {
  return db.charges.filter(
    (candidate) =>
      candidate.subscriptionId === charge.subscriptionId &&
      candidate.periodStart === charge.periodStart &&
      candidate.status === 'expired',
  ).length
}

export function createSubscription(
  db: DemoDatabase,
  input: CreateSubscriptionInput,
) {
  const customer = findCustomer(db, input.customerId)
  const plan = findPlan(db, input.planId)
  if (!plan.active) throw unprocessable(`Plan ${plan.id} is not active`)

  const at = tick(db)
  const subscription: DemoSubscription = {
    id: newId('sub'),
    customerId: customer.id,
    planId: plan.id,
    paymentMethod: input.paymentMethod,
    status: 'incomplete',
    billingAnchor: at.toISOString(),
    currentPeriodStart: at.toISOString(),
    currentPeriodEnd: periodEnd(at, plan).toISOString(),
    canceledAt: null,
    cancelReason: null,
    cardToken:
      input.paymentMethod === 'card' ? toCardToken(input.cardToken) : null,
    createdAt: at.toISOString(),
    updatedAt: at.toISOString(),
  }
  db.subscriptions.push(subscription)

  const charge = issueCharge(db, subscription, plan.amountCents, at)
  if (subscription.paymentMethod === 'card') attemptCardCharge(db, charge, at)
  return { subscription, charge }
}

export function cancelSubscription(db: DemoDatabase, id: string) {
  const subscription = findSubscription(db, id)
  if (subscription.status === 'canceled')
    throw conflict(`Subscription ${id} is already canceled`)
  const at = tick(db)
  cancel(subscription, at, 'customer_request')
  for (const charge of db.charges) {
    if (charge.subscriptionId === id) charge.nextRetryAt = null
  }
  return subscription
}

export function retryCharge(db: DemoDatabase, id: string) {
  const charge = findCharge(db, id)
  if (charge.method !== 'card')
    throw unprocessable(`Charge ${id} is not a card charge`)
  if (charge.status !== 'failed') throw conflict(`Charge ${id} is not failed`)
  attemptCardCharge(db, charge, tick(db))
  return { charge, subscription: findSubscription(db, charge.subscriptionId) }
}

function findPendingInstantCharge(db: DemoDatabase, id: string) {
  const charge = findCharge(db, id)
  if (charge.method === 'card')
    throw unprocessable(`Charge ${id} is a card charge`)
  if (charge.status !== 'pending') throw conflict(`Charge ${id} is not pending`)
  return charge
}

export function payInstantCharge(db: DemoDatabase, id: string) {
  const charge = findPendingInstantCharge(db, id)
  markPaid(db, charge, tick(db))
  return charge
}

export function expireInstantCharge(db: DemoDatabase, id: string) {
  const charge = findPendingInstantCharge(db, id)
  const at = tick(db)
  const subscription = findSubscription(db, charge.subscriptionId)
  charge.status = 'expired'
  const retryInDays = RETRY_SCHEDULE_DAYS[expiredReissues(db, charge) - 1]
  if (retryInDays === undefined) {
    cancel(
      subscription,
      at,
      subscription.status === 'incomplete'
        ? 'initial_payment_expired'
        : 'payment_failed',
    )
    return charge
  }
  charge.nextRetryAt = addDays(at, retryInDays).toISOString()
  markPastDue(subscription, at)
  return charge
}

export function setSubscriptionCard(
  db: DemoDatabase,
  id: string,
  cardToken: CardToken,
) {
  const subscription = findSubscription(db, id)
  if (subscription.paymentMethod !== 'card') {
    throw unprocessable(`Subscription ${id} does not pay by card`)
  }
  subscription.cardToken = cardToken
  subscription.updatedAt = tick(db).toISOString()
  return subscription
}

export function runRetriesNow(db: DemoDatabase) {
  const at = tick(db)
  const scheduled = db.charges.filter((charge) => charge.nextRetryAt !== null)
  for (const charge of scheduled) {
    charge.nextRetryAt = null
    if (charge.status === 'failed') {
      attemptCardCharge(db, charge, at)
    } else if (charge.status === 'expired') {
      const subscription = findSubscription(db, charge.subscriptionId)
      if (subscription.status !== 'canceled')
        issueCharge(db, subscription, charge.amountCents, at)
    }
  }
  return { promoted: scheduled.length }
}
