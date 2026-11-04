import { writeFileSync } from 'node:fs'
import { buildDatabase } from './seed/build-database.ts'

const SEED = 20261103
const DEMO_NOW = new Date('2026-11-03T12:00:00.000Z')
const OUTPUT = new URL('../src/mocks/seed.json', import.meta.url)

const database = buildDatabase(SEED, DEMO_NOW)
writeFileSync(OUTPUT, `${JSON.stringify(database)}\n`)

console.log(
  `seed.json: ${database.customers.length} customers, ${database.subscriptions.length} subscriptions, ${database.charges.length} charges`,
)
