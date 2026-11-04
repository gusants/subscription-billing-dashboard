import type { DemoDatabase } from '../demo-types'

const DAY_MS = 86_400_000
const ACTION_STEP_MS = 60_000

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}

export function daysBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / DAY_MS
}

export function tick(db: DemoDatabase) {
  const next = new Date(new Date(db.now).getTime() + ACTION_STEP_MS)
  db.now = next.toISOString()
  return next
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
}
