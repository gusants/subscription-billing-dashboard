import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { createAppRouter } from './router'

function renderAt(path: string) {
  const queryClient = new QueryClient()
  const router = createAppRouter(
    queryClient,
    createMemoryHistory({ initialEntries: [path] }),
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('router', () => {
  it.each([
    ['/', 'Overview'],
    ['/customers', 'Customers'],
    ['/customers/cus_123', 'Customer cus_123'],
    ['/plans', 'Plans'],
    ['/unknown', 'Page not found'],
  ])('renders %s', async (path, heading) => {
    renderAt(path)

    expect(
      await screen.findByRole('heading', { name: heading }),
    ).toBeInTheDocument()
  })
})
