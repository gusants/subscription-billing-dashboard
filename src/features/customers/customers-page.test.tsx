import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../lib/env'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { server } from '../../mocks/node'
import { renderApp } from '../../test/render-app'

function customerTable() {
  return screen.findByRole('grid', { name: 'Customers' })
}

describe('customers page', () => {
  it('shows a skeleton and then the first page of customers', async () => {
    server.use(
      http.get(`${apiBaseUrl}/customers`, async () => {
        await delay(400)
      }),
    )
    renderApp('/customers')

    expect(
      await screen.findByRole('status', { name: 'Loading customers' }),
    ).toBeInTheDocument()
    const table = await customerTable()
    expect(within(table).getAllByRole('row')).toHaveLength(21)
    expect(screen.getByText('1–20 of 40 customers')).toBeInTheDocument()
  })

  it('searches by name and writes the query to the URL', async () => {
    const target = demoDbStore.getState().db.customers[3]!
    const { user, router } = renderApp('/customers')
    await customerTable()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search customers' }),
      target.name,
    )

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ q: target.name }),
    )
    const table = await customerTable()
    await waitFor(() =>
      expect(within(table).getAllByRole('row')).toHaveLength(2),
    )
    expect(
      within(table).getByRole('link', { name: target.name }),
    ).toBeInTheDocument()
  })

  it('filters by subscription status from the URL', async () => {
    const pastDueCount = new Set(
      demoDbStore
        .getState()
        .db.subscriptions.filter((s) => s.status === 'past_due')
        .map((s) => s.customerId),
    ).size
    renderApp('/customers?status=past_due')

    const table = await customerTable()
    expect(within(table).getAllByRole('row')).toHaveLength(pastDueCount + 1)
    expect(screen.getByRole('button', { name: /Past due/ })).toBeInTheDocument()
  })

  it('pages through results and keeps the page in the URL', async () => {
    const { user, router } = renderApp('/customers')
    await customerTable()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ page: 2 }),
    )
    expect(await screen.findByText('21–40 of 40 customers')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('discards invalid search params', async () => {
    const { router } = renderApp('/customers?status=nope&page=-3')

    await customerTable()

    expect(router.state.location.search).toEqual({})
  })

  it('offers to clear filters when nothing matches', async () => {
    const { user, router } = renderApp('/customers?q=no-such-customer')

    expect(
      await screen.findByRole('heading', {
        name: 'No customers match these filters',
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    await waitFor(() => expect(router.state.location.search).toEqual({}))
    expect(await customerTable()).toBeInTheDocument()
  })

  it('shows an error with a working retry', async () => {
    server.use(
      http.get(
        `${apiBaseUrl}/customers`,
        () =>
          HttpResponse.json(
            {
              statusCode: 400,
              error: 'Bad Request',
              message: 'Customers are temporarily unavailable',
            },
            { status: 400 },
          ),
        { once: true },
      ),
    )
    const { user } = renderApp('/customers')

    expect(
      await screen.findByText('Customers are temporarily unavailable'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await customerTable()).toBeInTheDocument()
  })
})
