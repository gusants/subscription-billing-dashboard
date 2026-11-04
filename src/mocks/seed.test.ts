import { buildDatabase } from '../../scripts/seed/build-database.ts'
import seed from './seed.json'

const SEED = 20261103
const DEMO_NOW = new Date('2026-11-03T12:00:00.000Z')

describe('demo seed', () => {
  const database = buildDatabase(SEED, DEMO_NOW)

  it('is reproducible and matches the committed seed.json', () => {
    expect(buildDatabase(SEED, DEMO_NOW)).toEqual(database)
    expect(seed).toEqual(database)
  })

  it('is labelled synthetic and covers every billing situation', () => {
    expect(database.synthetic).toBe(true)
    expect(database.plans).toHaveLength(3)
    expect(database.customers).toHaveLength(40)

    const subscriptionStatuses = new Set(
      database.subscriptions.map((s) => s.status),
    )
    expect(subscriptionStatuses).toEqual(
      new Set(['active', 'past_due', 'canceled', 'incomplete']),
    )

    const chargeStatuses = new Set(database.charges.map((c) => c.status))
    expect(chargeStatuses).toEqual(
      new Set(['paid', 'pending', 'failed', 'expired', 'uncollectible']),
    )
  })

  it('never records activity after the demo clock', () => {
    const now = database.now
    const timestamps = database.charges.flatMap((charge) => [
      charge.createdAt,
      charge.paidAt ?? charge.createdAt,
      ...charge.attempts.map((attempt) => attempt.createdAt),
    ])

    expect(timestamps.every((timestamp) => timestamp <= now)).toBe(true)
  })

  it('schedules the next retry for every failed charge', () => {
    const failed = database.charges.filter(
      (charge) => charge.status === 'failed',
    )

    expect(failed.length).toBeGreaterThan(0)
    expect(
      failed.every(
        (charge) =>
          charge.nextRetryAt !== null && charge.nextRetryAt > database.now,
      ),
    ).toBe(true)
  })

  it('has a pre-written summary for every customer', () => {
    expect(Object.keys(database.summaries).sort()).toEqual(
      database.customers.map((customer) => customer.id).sort(),
    )
  })
})
