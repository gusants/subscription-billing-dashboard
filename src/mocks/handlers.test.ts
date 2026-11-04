import { apiBaseUrl } from '../lib/env'

describe('demo handlers', () => {
  it('answers the health check without a backend', async () => {
    const response = await fetch(
      new URL(`${apiBaseUrl}/health`, location.origin),
    )

    expect(await response.json()).toEqual({ status: 'ok' })
  })
})
