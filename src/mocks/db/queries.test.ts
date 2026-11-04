import {
  customerCharges,
  customerDetail,
  listCustomers,
  listPlans,
} from './queries'
import { testDatabase } from './test-database'

describe('demo queries', () => {
  it('searches customers by name or email, case insensitive', () => {
    const db = testDatabase()
    const target = db.customers[5]!

    const byName = listCustomers(db, { search: target.name.toUpperCase() })
    const byEmail = listCustomers(db, { search: target.email.split('@')[1] })

    expect(byName.data.map((c) => c.id)).toContain(target.id)
    expect(byEmail.data.map((c) => c.id)).toContain(target.id)
  })

  it('filters customers by subscription status and paginates', () => {
    const db = testDatabase()
    const pastDue = listCustomers(db, { subscriptionStatus: 'past_due' })
    const page = listCustomers(db, { page: 2, limit: 15 })

    expect(pastDue.meta.total).toBeGreaterThan(0)
    expect(
      pastDue.data.every((customer) =>
        db.subscriptions.some(
          (s) => s.customerId === customer.id && s.status === 'past_due',
        ),
      ),
    ).toBe(true)
    expect(page.meta).toEqual({ page: 2, limit: 15, total: 40, totalPages: 3 })
    expect(page.data).toHaveLength(15)
  })

  it('returns customer detail with subscriptions and charges newest first without internal fields', () => {
    const db = testDatabase()
    const customer = db.customers.find(
      (c) => db.subscriptions.filter((s) => s.customerId === c.id).length > 1,
    )!

    const detail = customerDetail(db, customer.id)
    const charges = customerCharges(db, customer.id, { limit: 100 }).data

    expect(detail.subscriptions.length).toBeGreaterThan(1)
    expect(charges.map((c) => c.createdAt)).toEqual(
      [...charges.map((c) => c.createdAt)].sort().reverse(),
    )
    expect(charges[0]).not.toHaveProperty('nextRetryAt')
    expect(charges[0]).not.toHaveProperty('expiresAt')
  })

  it('filters plans by active flag', () => {
    const db = testDatabase()
    db.plans[0]!.active = false

    expect(listPlans(db, { active: 'true' }).meta.total).toBe(2)
    expect(listPlans(db, { active: 'false' }).meta.total).toBe(1)
    expect(listPlans(db, {}).meta.total).toBe(3)
  })
})
