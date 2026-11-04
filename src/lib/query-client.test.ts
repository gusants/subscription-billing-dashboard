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
