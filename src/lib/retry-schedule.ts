import type { Charge } from '../api/contract'

export const RETRY_SCHEDULE_DAYS = [1, 3, 7] as const

const DAY_MS = 86_400_000

export function nextRetryDate(
  charge: Pick<Charge, 'status' | 'method' | 'attempts' | 'attemptCount'>,
) {
  if (charge.status !== 'failed' || charge.method !== 'card') return null
  const firstAttempt = charge.attempts[0]
  const retryInDays = RETRY_SCHEDULE_DAYS[charge.attemptCount - 1]
  if (!firstAttempt || retryInDays === undefined) return null
  return new Date(
    new Date(firstAttempt.createdAt).getTime() + retryInDays * DAY_MS,
  ).toISOString()
}
