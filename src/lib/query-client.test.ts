import { screen } from '@testing-library/react'
import { renderApp } from '../test/render-app'
import { createQueryClient } from './query-client'

describe('createQueryClient', () => {
  it('turns a failed action into an error toast', async () => {
    renderApp('/')
    await screen.findByRole('heading', { name: 'Overview' })
    const queryClient = createQueryClient()

    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: () => Promise.reject(new Error('Card was declined.')),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(await screen.findByText('Action failed')).toBeInTheDocument()
    expect(screen.getByText('Card was declined.')).toBeInTheDocument()
  })
})

describe('shouldRetryQuery', () => {
  it('retries server and network errors once but never client errors', async () => {
    const { ApiError } = await import('../api/client')
    const { shouldRetryQuery } = await import('./query-client')

    expect(shouldRetryQuery(0, new ApiError(503, undefined))).toBe(true)
    expect(shouldRetryQuery(1, new ApiError(503, undefined))).toBe(false)
    expect(shouldRetryQuery(0, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetryQuery(0, new ApiError(404, undefined))).toBe(false)
  })
})
