import { screen, waitFor, within } from '@testing-library/react'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { renderApp } from '../../test/render-app'

function customerWithSubscriptions(minimum: number) {
  const { customers, subscriptions } = demoDbStore.getState().db
  return customers.find(
    (customer) =>
      subscriptions.filter((s) => s.customerId === customer.id).length >=
      minimum,
  )!
}

describe('customer detail', () => {
  it('shows the profile and the most relevant subscription', async () => {
    const customer = customerWithSubscriptions(2)
    renderApp(`/customers/${customer.id}`)

    expect(
      await screen.findByRole('heading', { level: 1, name: customer.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp(customer.email))).toBeInTheDocument()

    const overview = screen.getByRole('region', {
      name: 'Subscription overview',
    })
    expect(within(overview).getByText('Active')).toBeInTheDocument()
    expect(
      await within(overview).findByText('Amount · Studio'),
    ).toBeInTheDocument()
    expect(within(overview).getByText(/^R\$\s389,90\/mo$/)).toBeInTheDocument()
    expect(
      await within(overview).findByText('None scheduled'),
    ).toBeInTheDocument()
    expect(
      await within(overview).findByText(/^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/),
    ).toBeInTheDocument()

    const subscriptions = screen.getByRole('region', { name: 'Subscriptions' })
    expect(within(subscriptions).getAllByRole('listitem')).toHaveLength(2)
    expect(within(subscriptions).getByText('Canceled')).toBeInTheDocument()
  })

  it('leads past due subscriptions first', async () => {
    const { subscriptions } = demoDbStore.getState().db
    const pastDue = subscriptions.find((s) => s.status === 'past_due')!
    renderApp(`/customers/${pastDue.customerId}`)

    const overview = await screen.findByRole('region', {
      name: 'Subscription overview',
    })
    expect(within(overview).getByText('Past due')).toBeInTheDocument()
  })

  it('shows a dedicated not found page for unknown customers', async () => {
    const { user } = renderApp('/customers/cus_missing')

    await user.click(
      await screen.findByRole('link', { name: 'Back to customers' }),
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Customers' }),
    ).toBeInTheDocument()
  })
})

describe('charges timeline', () => {
  it('explains every declined attempt', async () => {
    const { charges, subscriptions } = demoDbStore.getState().db
    const failed = charges.find((c) => c.status === 'failed')!
    const customerId = subscriptions.find(
      (s) => s.id === failed.subscriptionId,
    )!.customerId
    renderApp(`/customers/${customerId}`)

    const table = await screen.findByRole('table', { name: 'Charges' })
    const attemptRows = within(table)
      .getAllByRole('row')
      .filter((row) => /Attempt \d/.test(row.textContent ?? ''))
    const declinedRows = attemptRows.filter((row) =>
      row.textContent?.includes('Insufficient funds'),
    )
    expect(declinedRows.length).toBeGreaterThanOrEqual(failed.attemptCount)
    expect(
      within(table).getByText(/^Next retry [A-Z][a-z]{2} \d{1,2}, \d{4}$/),
    ).toBeInTheDocument()

    const overview = screen.getByRole('region', {
      name: 'Subscription overview',
    })
    expect(
      within(overview).getByText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/),
    ).toBeInTheDocument()
  })

  it('loads older charges on demand', async () => {
    const { subscriptions, charges } = demoDbStore.getState().db
    const longest = subscriptions
      .map((s) => ({
        customerId: s.customerId,
        count: charges.filter((c) => c.subscriptionId === s.id).length,
      }))
      .sort((a, b) => b.count - a.count)[0]!
    const { user } = renderApp(`/customers/${longest.customerId}`)

    const timeline = await screen.findByRole('list', { name: 'Charges list' })
    expect(
      within(timeline)
        .getAllByRole('listitem')
        .filter((li) => li.parentElement === timeline),
    ).toHaveLength(10)

    await user.click(screen.getByRole('button', { name: 'Load older charges' }))

    await waitFor(() =>
      expect(
        within(timeline)
          .getAllByRole('listitem')
          .filter((li) => li.parentElement === timeline).length,
      ).toBeGreaterThan(10),
    )
  })
})
