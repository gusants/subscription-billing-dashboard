import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../lib/env'
import { server } from '../../mocks/node'
import { waitForSettlement } from './wait-for-settlement'

const FAST_POLLING = { intervalMs: 0, maxPolls: 3 }

function chargesAnswering(statuses: string[]) {
  let call = 0
  server.use(
    http.get(`${apiBaseUrl}/customers/:id/charges`, () => {
      const status = statuses[Math.min(call, statuses.length - 1)]
      call += 1
      return HttpResponse.json({
        data: [{ id: 'ch_1', status }],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      })
    }),
  )
  return () => call
}

describe('waitForSettlement', () => {
  it('waits until the webhook settles the charge', async () => {
    const calls = chargesAnswering(['pending', 'pending', 'paid'])

    await expect(
      waitForSettlement('cus_1', 'ch_1', FAST_POLLING),
    ).resolves.toBe(true)
    expect(calls()).toBe(3)
  })

  it('gives up when the charge stays pending', async () => {
    chargesAnswering(['pending'])

    await expect(
      waitForSettlement('cus_1', 'ch_1', FAST_POLLING),
    ).resolves.toBe(false)
  })
})
