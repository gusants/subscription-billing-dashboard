import { act, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { simulatorApi, subscriptionsApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { apiBaseUrl } from '../../lib/env'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { server } from '../../mocks/node'
import { renderApp } from '../../test/render-app'

async function metricValue(label: string) {
  const metrics = await screen.findByRole('region', { name: 'Key metrics' })
  const term = within(metrics).getByText(label)
  return term.nextElementSibling?.firstElementChild?.textContent
}

describe('overview page', () => {
  it('formats the key metrics and shows the delinquency formula', async () => {
    const { subscriptions } = demoDbStore.getState().db
    const active = subscriptions.filter((s) => s.status === 'active').length
    const pastDue = subscriptions.filter((s) => s.status === 'past_due').length
    renderApp('/')

    expect(await metricValue('Monthly recurring revenue')).toMatch(
      /^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/,
    )
    expect(await metricValue('Active subscriptions')).toBe(String(active))
    expect(await metricValue('Past due subscriptions')).toBe(String(pastDue))
    expect(await metricValue('Delinquency rate')).toBe(
      `${((pastDue / (active + pastDue)) * 100).toFixed(1)}%`,
    )
    expect(
      screen.getByText(
        'Past due and canceled for payment failure ÷ those plus active',
      ),
    ).toBeInTheDocument()
  })

  it('updates the metrics after a billing action', async () => {
    const { queryClient } = renderAppWithClient()
    const before = Number(await metricValue('Past due subscriptions'))
    const customer = demoDbStore.getState().db.customers[0]!
    const plan = demoDbStore.getState().db.plans[0]!

    await act(async () => {
      const created = await subscriptionsApi.create({
        customerId: customer.id,
        planId: plan.id,
        paymentMethod: 'card',
        cardToken: 'tok_insufficient_funds',
      })
      await invalidateAfter(queryClient, {
        type: 'subscription-created',
        customerId: customer.id,
        subscriptionId: created.id,
      })
    })

    await waitFor(async () =>
      expect(Number(await metricValue('Past due subscriptions'))).toBe(
        before + 1,
      ),
    )

    await act(async () => {
      await simulatorApi.reset()
      await invalidateAfter(queryClient, { type: 'demo-reset' })
    })

    await waitFor(async () =>
      expect(Number(await metricValue('Past due subscriptions'))).toBe(before),
    )
  })

  it('describes each chart in text for screen readers and offers a table', async () => {
    renderApp('/')

    const revenue = await screen.findByRole('region', {
      name: 'Revenue by month',
    })
    const status = screen.getByRole('region', {
      name: 'Subscriptions by status',
    })

    expect(
      within(revenue).getByText(
        /^Revenue went from R\$.* The highest month was/,
      ),
    ).toBeInTheDocument()
    expect(
      within(status).getByText(/^\d+ subscriptions: \d+ active, \d+ past due/),
    ).toBeInTheDocument()
    expect(within(revenue).getAllByRole('row')).toHaveLength(13)
  })

  it('keeps the period in the URL', async () => {
    const { user, router } = renderApp('/')
    await screen.findByRole('region', { name: 'Key metrics' })

    await user.click(screen.getByRole('button', { name: /Period/ }))
    await user.click(
      await screen.findByRole('option', { name: 'Last 90 days' }),
    )

    await waitFor(() =>
      expect(router.state.location.search).toEqual({ period: 'last-90-days' }),
    )
    expect(await screen.findAllByText('vs previous 90 days')).toHaveLength(4)
  })

  it('shows the metrics without comparison when the previous period fails', async () => {
    server.use(
      http.get(`${apiBaseUrl}/metrics/overview`, ({ request }) => {
        const from = new URL(request.url).searchParams.get('from') ?? ''
        const isCurrentMonth =
          from === new Date().toISOString().slice(0, 8) + '01'
        if (!isCurrentMonth) {
          return HttpResponse.json(
            { statusCode: 503, error: 'Unavailable', message: 'Down' },
            { status: 503 },
          )
        }
      }),
    )
    renderApp('/')

    expect(await metricValue('Active subscriptions')).toMatch(/^\d+$/)
    expect(
      screen.queryByText('vs same days last month'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Revenue by month' }),
    ).toBeInTheDocument()
  })

  it('shows a retry when the metrics fail and recovers', async () => {
    server.use(
      http.get(`${apiBaseUrl}/metrics/overview`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Metrics unavailable',
          },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderApp('/')

    const errors = await screen.findAllByText('Metrics unavailable')
    expect(errors).toHaveLength(3)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()

    server.resetHandlers()
    await user.click(screen.getAllByRole('button', { name: 'Try again' })[0]!)

    expect(
      await screen.findByRole('region', { name: 'Key metrics' }),
    ).toBeInTheDocument()
  })
})

function renderAppWithClient() {
  const view = renderApp('/')
  return { ...view, queryClient: view.router.options.context.queryClient }
}
