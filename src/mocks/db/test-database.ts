import type { DemoDatabase } from '../demo-types'
import seed from '../seed.json'

export function testDatabase() {
  return structuredClone(seed as DemoDatabase)
}

export function firstPlan(db: DemoDatabase, name: string) {
  const plan = db.plans.find((candidate) => candidate.name === name)
  if (!plan) throw new Error(`Seed has no plan ${name}`)
  return plan
}

export function firstCustomer(db: DemoDatabase) {
  const customer = db.customers[0]
  if (!customer) throw new Error('Seed has no customers')
  return customer
}
