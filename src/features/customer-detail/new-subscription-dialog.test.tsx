import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../lib/env'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { server } from '../../mocks/node'
import { renderApp } from '../../test/render-app'

async function openDialog() {
  const customer = demoDbStore.getState().db.customers[0]!
  const view = renderApp(`/customers/${customer.id}`)
  await view.user.click(
    await screen.findByRole('button', { name: 'New subscription' }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New subscription' })
  return { ...view, customer, dialog }
}

async function choose(
  user: ReturnType<typeof renderApp>['user'],
  dialog: HTMLElement,
  label: string,
  option: RegExp,
) {
  await user.click(
    within(dialog).getByRole('button', { name: new RegExp(label) }),
  )
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('new subscription dialog', () => {
  it('creates a card subscription that is declined and reports it', async () => {
    const { user, dialog, customer } = await openDialog()

    await choose(user, dialog, 'Plan', /^Studio · /)
    await choose(user, dialog, 'Test card', /insufficient funds/)
    await user.click(
      within(dialog).getByRole('button', { name: 'Create subscription' }),
    )

    expect(
      await screen.findByText('Subscription created, first charge declined'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      demoDbStore
        .getState()
        .db.subscriptions.filter(
          (s) => s.customerId === customer.id && s.status === 'past_due',
        ),
    ).toHaveLength(1)
  })

  it('hides the test card for Pix and requires a plan', async () => {
    const { user, dialog } = await openDialog()

    await user.click(within(dialog).getByRole('radio', { name: /Pix/ }))
    expect(
      within(dialog).queryByRole('button', { name: /Test card/ }),
    ).not.toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Create subscription' }),
    )

    expect(
      await within(dialog).findByText('Pick the plan to subscribe to'),
    ).toBeInTheDocument()
  })

  it('reuses the same Idempotency-Key when resubmitting after a network error', async () => {
    const keys: (string | null)[] = []
    let calls = 0
    server.use(
      http.post(`${apiBaseUrl}/subscriptions`, ({ request }) => {
        keys.push(request.headers.get('Idempotency-Key'))
        calls += 1
        if (calls === 1) return HttpResponse.error()
      }),
    )
    const { user, dialog } = await openDialog()

    await choose(user, dialog, 'Plan', /^Solo · /)
    await user.click(
      within(dialog).getByRole('button', { name: 'Create subscription' }),
    )
    expect(await screen.findByText('Can’t reach the API')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Create subscription' }),
    )
    expect(await screen.findByText('Subscription created')).toBeInTheDocument()

    expect(keys).toHaveLength(2)
    expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/)
    expect(keys[1]).toBe(keys[0])
  })

  it('replays the first response for a repeated key in demo mode', async () => {
    const { subscriptionsApi } = await import('../../api/endpoints')
    const { customers, plans } = demoDbStore.getState().db
    const input = {
      customerId: customers[0]!.id,
      planId: plans[0]!.id,
      paymentMethod: 'pix' as const,
    }

    const first = await subscriptionsApi.create(input, 'key-1')
    const replay = await subscriptionsApi.create(input, 'key-1')

    expect(replay.id).toBe(first.id)
    await expect(
      subscriptionsApi.create({ ...input, paymentMethod: 'boleto' }, 'key-1'),
    ).rejects.toMatchObject({
      status: 422,
    })
  })
})
