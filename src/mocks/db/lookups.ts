import type { DemoDatabase } from '../demo-types'
import { notFound } from './demo-api-error'

export function findCustomer(db: DemoDatabase, id: string) {
  const customer = db.customers.find((candidate) => candidate.id === id)
  if (!customer) throw notFound('Customer', id)
  return customer
}

export function findPlan(db: DemoDatabase, id: string) {
  const plan = db.plans.find((candidate) => candidate.id === id)
  if (!plan) throw notFound('Plan', id)
  return plan
}

export function findSubscription(db: DemoDatabase, id: string) {
  const subscription = db.subscriptions.find((candidate) => candidate.id === id)
  if (!subscription) throw notFound('Subscription', id)
  return subscription
}

export function findCharge(db: DemoDatabase, id: string) {
  const charge = db.charges.find((candidate) => candidate.id === id)
  if (!charge) throw notFound('Charge', id)
  return charge
}

export function subscriptionsOf(db: DemoDatabase, customerId: string) {
  return db.subscriptions.filter(
    (subscription) => subscription.customerId === customerId,
  )
}

export function chargesOf(db: DemoDatabase, customerId: string) {
  const subscriptionIds = new Set(
    subscriptionsOf(db, customerId).map((s) => s.id),
  )
  return db.charges.filter((charge) =>
    subscriptionIds.has(charge.subscriptionId),
  )
}
