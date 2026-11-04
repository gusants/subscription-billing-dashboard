import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouteError } from './route-error'

function renderFailingRoute() {
  let attempts = 0
  const rootRoute = createRootRoute({ component: Outlet })
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    loader: () => {
      attempts += 1
      if (attempts === 1) throw new Error('Customers request timed out.')
    },
    component: () => <h1>Customers loaded</h1>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultErrorComponent: RouteError,
  })

  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('RouteError', () => {
  it('explains the failure and recovers on try again', async () => {
    const user = userEvent.setup()
    renderFailingRoute()

    expect(
      await screen.findByRole('heading', { name: 'This page could not load' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Customers request timed out.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Customers loaded' }),
    ).toBeInTheDocument()
  })
})
