import { createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '../app-providers'
import { createQueryClient } from '../lib/query-client'
import { createAppRouter } from '../router'

export function renderApp(path = '/') {
  const queryClient = createQueryClient()
  const router = createAppRouter(
    queryClient,
    createMemoryHistory({ initialEntries: [path] }),
  )
  const user = userEvent.setup()
  const view = render(
    <AppProviders queryClient={queryClient} router={router} />,
  )
  return { ...view, router, user }
}
