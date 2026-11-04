import type { QueryClient } from '@tanstack/react-query'
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { AppShell } from '../components/app-shell/app-shell'

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function NotFound() {
  return (
    <section className="flex flex-col items-start gap-2 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-fg-muted">
        This address does not match any page in Cadência Billing.
      </p>
      <Link
        to="/"
        className="text-accent hover:text-accent-hover mt-2 font-medium underline"
      >
        Back to overview
      </Link>
    </section>
  )
}
