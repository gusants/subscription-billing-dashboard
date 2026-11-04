import { nextRetryDate } from './retry-schedule'

const declined = (createdAt: string) => ({
  id: createdAt,
  createdAt,
  result: 'declined' as const,
  failureReason: 'insufficient_funds',
})

describe('nextRetryDate', () => {
  it('follows D+1, D+3 and D+7 from the first attempt', () => {
    const first = '2026-11-01T09:00:00.000Z'
    const attempts = [declined(first), declined('2026-11-02T09:00:00.000Z')]

    expect(
      nextRetryDate({
        status: 'failed',
        method: 'card',
        attempts: attempts.slice(0, 1),
        attemptCount: 1,
      }),
    ).toBe('2026-11-02T09:00:00.000Z')
    expect(
      nextRetryDate({
        status: 'failed',
        method: 'card',
        attempts,
        attemptCount: 2,
      }),
    ).toBe('2026-11-04T09:00:00.000Z')
  })

  it('has no retry once the schedule is exhausted or the charge is not a failed card charge', () => {
    const attempts = [declined('2026-11-01T09:00:00.000Z')]

    expect(
      nextRetryDate({
        status: 'failed',
        method: 'card',
        attempts,
        attemptCount: 4,
      }),
    ).toBeNull()
    expect(
      nextRetryDate({
        status: 'paid',
        method: 'card',
        attempts,
        attemptCount: 1,
      }),
    ).toBeNull()
    expect(
      nextRetryDate({
        status: 'failed',
        method: 'pix',
        attempts,
        attemptCount: 1,
      }),
    ).toBeNull()
  })
})
