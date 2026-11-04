import { screen, within } from '@testing-library/react'
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
      await within(overview).findByText('Studio · R$389.90/mo'),
    ).toBeInTheDocument()
    expect(await within(overview).findByText('Card')).toBeInTheDocument()

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
