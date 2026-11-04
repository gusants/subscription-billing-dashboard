import { screen, waitFor, within } from '@testing-library/react'
import { subscriptionsApi } from '../../api/endpoints'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { renderApp } from '../../test/render-app'

function customerWithPending(method: 'pix' | 'boleto') {
  const { charges, subscriptions } = demoDbStore.getState().db
  const pending = charges.find(
    (charge) => charge.status === 'pending' && charge.method === method,
  )!
  return {
    pending,
    customerId: subscriptions.find((s) => s.id === pending.subscriptionId)!
      .customerId,
  }
}

async function openSimulator(path: string) {
  const view = renderApp(path)
  await screen.findByRole('heading', { level: 1 })
  await view.user.click(
    screen.getAllByRole('button', { name: 'Simulator' })[0]!,
  )
  const panel = await screen.findByRole('complementary', { name: /Simulator/ })
  return { ...view, panel }
}

function action(panel: HTMLElement, name: string) {
  return within(panel).getByRole('form', { name })
}

function stubViewport(isDesktop: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: isDesktop,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }))
}

describe('simulator panel below lg', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is a modal dialog that Escape closes, returning focus to the toggle', async () => {
    stubViewport(false)
    const view = renderApp('/customers')
    await screen.findByRole('heading', { level: 1 })
    const toggle = screen.getAllByRole('button', { name: 'Simulator' })[0]!
    await view.user.click(toggle)

    const dialog = await screen.findByRole('dialog', { name: /Simulator/ })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    await view.user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(toggle).toHaveFocus())
  })

  it('stays a docked non-modal complementary region from lg up', async () => {
    stubViewport(true)
    const view = renderApp('/customers')
    await screen.findByRole('heading', { level: 1 })
    await view.user.click(
      screen.getAllByRole('button', { name: 'Simulator' })[0]!,
    )

    expect(
      await screen.findByRole('complementary', { name: /Simulator/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('simulator panel', () => {
  it('approves a pending Pix and the timeline shows it paid', async () => {
    const { pending, customerId } = customerWithPending('pix')
    const { user, panel } = await openSimulator(`/customers/${customerId}`)
    const approve = action(panel, 'Approve Pix')

    await waitFor(() =>
      expect(
        within(approve).getByRole('combobox', { name: 'Pending Pix charge' }),
      ).toBeInTheDocument(),
    )
    await user.click(within(approve).getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(within(approve).getByRole('status')).toHaveTextContent(
        'Pix payment approved',
      ),
    )
    expect(
      demoDbStore.getState().db.charges.find((c) => c.id === pending.id)
        ?.status,
    ).toBe('paid')
    const table = screen.getByRole('table', { name: 'Charges' })
    await waitFor(() =>
      expect(
        within(table).queryByText('Waiting for the Pix payment'),
      ).not.toBeInTheDocument(),
    )
    expect(
      within(panel).getByRole('region', { name: 'Recent actions' }),
    ).toHaveTextContent('Approve Pix')
  })

  it('expires a pending boleto and shows it on the timeline', async () => {
    const { customers, plans } = demoDbStore.getState().db
    const customerId = customers[0]!.id
    await subscriptionsApi.create({
      customerId,
      planId: plans[0]!.id,
      paymentMethod: 'boleto',
    })
    const { user, panel } = await openSimulator(`/customers/${customerId}`)
    const expire = action(panel, 'Expire boleto')

    await waitFor(() =>
      expect(
        within(expire).getByRole('button', { name: 'Expire' }),
      ).toBeEnabled(),
    )
    await user.click(within(expire).getByRole('button', { name: 'Expire' }))

    await waitFor(() =>
      expect(within(expire).getByRole('status')).toHaveTextContent(
        'Boleto expired',
      ),
    )
    expect(
      demoDbStore
        .getState()
        .db.charges.filter(
          (c) => c.method === 'boleto' && c.status === 'expired',
        ).length,
    ).toBeGreaterThan(0)
    expect(
      (await screen.findAllByText('Boleto expired unpaid')).length,
    ).toBeGreaterThan(0)
  })

  it('forces a decline and advances the retry clock, raising past due on the overview', async () => {
    const subscription = demoDbStore
      .getState()
      .db.subscriptions.find(
        (s) =>
          s.status === 'active' &&
          s.paymentMethod === 'card' &&
          s.cardToken === 'tok_success',
      )!
    const { user, panel } = await openSimulator(
      `/customers/${subscription.customerId}`,
    )

    const decline = action(panel, 'Force card decline')
    await waitFor(() =>
      expect(
        within(decline).getByRole('button', { name: 'Force decline' }),
      ).toBeEnabled(),
    )
    await user.click(
      within(decline).getByRole('button', { name: 'Force decline' }),
    )
    await waitFor(() =>
      expect(within(decline).getByRole('status')).toHaveTextContent(
        'next card attempt will be declined',
      ),
    )
    expect(
      demoDbStore
        .getState()
        .db.subscriptions.find((s) => s.id === subscription.id)?.cardToken,
    ).toBe('tok_insufficient_funds')

    const retries = action(panel, 'Advance retry clock')
    await user.click(
      within(retries).getByRole('button', { name: 'Run retries' }),
    )
    await waitFor(() =>
      expect(within(retries).getByRole('status')).toHaveTextContent(
        /^Ran \d+ scheduled retr(y|ies)$/,
      ),
    )
  })

  it('simulates API errors and recovers when turned off', async () => {
    const { user, panel } = await openSimulator('/customers')

    await user.click(
      within(panel).getByRole('switch', { name: /Simulate API error/ }),
    )
    expect(
      await screen.findByText('Customers could not load'),
    ).toBeInTheDocument()

    await user.click(
      within(panel).getByRole('switch', { name: /Simulate API error/ }),
    )
    expect(
      await screen.findByRole('grid', { name: 'Customers' }),
    ).toBeInTheDocument()
  })

  it('resets the demo data', async () => {
    const before = demoDbStore.getState().db.subscriptions.length
    demoDbStore.getState().transact((db) => {
      db.subscriptions.pop()
    })
    const { user, panel } = await openSimulator('/')

    await user.click(
      within(action(panel, 'Reset demo')).getByRole('button', {
        name: 'Reset',
      }),
    )

    await waitFor(() =>
      expect(
        within(action(panel, 'Reset demo')).getByRole('status'),
      ).toHaveTextContent('Demo data restored'),
    )
    expect(demoDbStore.getState().db.subscriptions).toHaveLength(before)
  })
})
