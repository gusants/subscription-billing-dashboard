import type {
  CreateCustomerInput,
  CreatePlanInput,
  Customer,
  Plan,
} from '../../api/contract'
import type { DemoDatabase } from '../demo-types'
import { newId, tick } from './clock'
import { conflict } from './demo-api-error'

const GENERIC_SUMMARY = {
  summary: 'New account with no payment history yet.',
  paymentBehavior: 'on_time',
  riskLevel: 'low',
  suggestedAction: 'No action needed until the first renewal.',
} as const

export function createCustomer(
  db: DemoDatabase,
  input: CreateCustomerInput,
): Customer {
  const email = input.email.toLowerCase()
  if (db.customers.some((customer) => customer.email === email)) {
    throw conflict(`A customer with email ${email} already exists`)
  }
  const at = tick(db).toISOString()
  const customer = {
    id: newId('cus'),
    name: input.name,
    email,
    createdAt: at,
    updatedAt: at,
  }
  db.customers.push(customer)
  db.summaries[customer.id] = GENERIC_SUMMARY
  return customer
}

export function createPlan(db: DemoDatabase, input: CreatePlanInput): Plan {
  const at = tick(db).toISOString()
  const plan = {
    id: newId('pln'),
    ...input,
    active: true,
    createdAt: at,
    updatedAt: at,
  }
  db.plans.push(plan)
  return plan
}
