import { screen, waitFor, within } from '@testing-library/react'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { renderApp } from '../../test/render-app'

function activeSubscription() {
  return demoDbStore
    .getState()
    .db.subscriptions.find((s) => s.status === 'active')!
}

async function openCancel() {
  const subscription = activeSubscription()
  const view = renderApp(`/customers/${subscription.customerId}`)
  const panel = await screen.findByRole('region', { name: 'Subscriptions' })
  await view.user.click(
    within(panel).getAllByRole('button', { name: 'Cancel subscription' })[0]!,
  )
  const dialog = await screen.findByRole('alertdialog')
  return { ...view, subscription, dialog }
}

describe('cancel subscription', () => {
  it('asks for confirmation and keeps the subscription when dismissed', async () => {
    const { user, dialog, subscription } = await openCancel()

    expect(
      within(dialog).getByRole('button', { name: 'Keep subscription' }),
    ).toHaveFocus()
    await user.click(
      within(dialog).getByRole('button', { name: 'Keep subscription' }),
    )

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(
      demoDbStore
        .getState()
        .db.subscriptions.find((s) => s.id === subscription.id)?.status,
    ).toBe('active')
  })

  it('cancels after confirmation and updates the page', async () => {
    const { user, dialog, subscription } = await openCancel()

    await user.click(
      within(dialog).getByRole('button', { name: 'Cancel subscription' }),
    )

    expect(await screen.findByText('Subscription canceled')).toBeInTheDocument()
    expect(
      demoDbStore
        .getState()
        .db.subscriptions.find((s) => s.id === subscription.id)?.status,
    ).toBe('canceled')
    const panel = screen.getByRole('region', { name: 'Subscriptions' })
    await waitFor(() =>
      expect(within(panel).getAllByText('Canceled').length).toBeGreaterThan(0),
    )
  })
})
