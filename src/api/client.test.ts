import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../lib/env'
import { server } from '../mocks/node'
import { ApiError, request } from './client'

describe('request', () => {
  it('sends defined query params and returns the JSON body', async () => {
    let receivedUrl: URL | undefined
    server.use(
      http.get(`${apiBaseUrl}/customers`, ({ request: incoming }) => {
        receivedUrl = new URL(incoming.url)
        return HttpResponse.json({ data: [] })
      }),
    )

    const body = await request('/customers', {
      query: { page: 2, search: '', subscriptionStatus: undefined },
    })

    expect(body).toEqual({ data: [] })
    expect(receivedUrl?.searchParams.get('page')).toBe('2')
    expect(receivedUrl?.searchParams.has('search')).toBe(false)
    expect(receivedUrl?.searchParams.has('subscriptionStatus')).toBe(false)
  })

  it('posts a JSON body', async () => {
    server.use(
      http.post(`${apiBaseUrl}/plans`, async ({ request: incoming }) =>
        HttpResponse.json(await incoming.json(), { status: 201 }),
      ),
    )

    const body = await request('/plans', {
      method: 'POST',
      body: { name: 'Studio', amountCents: 38990, interval: 'monthly' },
    })

    expect(body).toEqual({
      name: 'Studio',
      amountCents: 38990,
      interval: 'monthly',
    })
  })

  it('resolves no content as undefined', async () => {
    server.use(
      http.post(
        `${apiBaseUrl}/fake-gateway/reset`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    await expect(
      request('/fake-gateway/reset', { method: 'POST' }),
    ).resolves.toBeUndefined()
  })

  it('raises the API error message', async () => {
    server.use(
      http.get(`${apiBaseUrl}/customers/missing`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            message: 'Customer missing not found',
          },
          { status: 404 },
        ),
      ),
    )

    const failure = request('/customers/missing')

    await expect(failure).rejects.toBeInstanceOf(ApiError)
    await expect(failure).rejects.toMatchObject({
      status: 404,
      message: 'Customer missing not found',
    })
  })

  it('falls back to the status when the error has no body', async () => {
    server.use(
      http.get(
        `${apiBaseUrl}/health`,
        () => new HttpResponse('Bad gateway', { status: 502 }),
      ),
    )

    await expect(request('/health')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    })
  })
})
