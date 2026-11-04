import type { QueryClient } from '@tanstack/react-query'
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <>
      <nav aria-label="Main">
        <Link to="/">Overview</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/plans">Plans</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  )
}

function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/">Back to overview</Link>
    </section>
  )
}
