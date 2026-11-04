import {
  DEMO_DB_STORAGE_KEY,
  DEMO_DB_VERSION,
  demoDbStore,
} from './demo-db-store'

describe('demoDbStore', () => {
  afterEach(() => demoDbStore.getState().reset())

  it('persists changes to localStorage and resets to the seed', () => {
    const originalCount = demoDbStore.getState().db.customers.length

    demoDbStore.getState().transact((db) => {
      db.customers.pop()
    })

    expect(demoDbStore.getState().db.customers).toHaveLength(originalCount - 1)
    expect(
      JSON.parse(localStorage.getItem(DEMO_DB_STORAGE_KEY) ?? '{}').version,
    ).toBe(DEMO_DB_VERSION)

    demoDbStore.getState().reset()

    expect(demoDbStore.getState().db.customers).toHaveLength(originalCount)
  })

  it('discards stored data from an older seed version', async () => {
    localStorage.setItem(
      DEMO_DB_STORAGE_KEY,
      JSON.stringify({
        state: { db: { customers: [] } },
        version: DEMO_DB_VERSION - 1,
      }),
    )

    await demoDbStore.persist.rehydrate()

    expect(demoDbStore.getState().db.customers.length).toBeGreaterThan(0)
  })
})
