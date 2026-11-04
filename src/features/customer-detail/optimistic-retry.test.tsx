import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../lib/env'
import { demoDbStore } from '../../mocks/db/demo-db-store'
import { server } from '../../mocks/node'
import { renderApp } from '../../test/render-app'

function failedChargeCustomer() {
  const { charges, subscriptions } = demoDbStore.getState().db
  const failed = charges.find(
    (charge) => charge.status === 'failed' && charge.method === 'card',
  )!
  const customerId = subscriptions.find(
    (s) => s.id === failed.subscriptionId,
  )!.customerId
  return { failed, customerId }
}

async function retryFromTable() {
  const { failed, customerId } = failedChargeCustomer()
  const view = renderApp(`/customers/${customerId}`)
  const table = await screen.findByRole('table', { name: 'Charges' })
  const [retryButton] = within(table).getAllByRole('button', {
    name: /Retry charge due/,
  })
  await view.user.click(retryButton!)
  return { ...view, table, failed }
}

describe('optimistic retry', () => {
  it('shows the attempt immediately and then the real outcome', async () => {
    server.use(
      http.post(`${apiBaseUrl}/charges/:id/retry`, async () => {
        await delay(300)
      }),
    )
    const { table, failed } = await retryFromTable()

    expect(within(table).getByText('Retrying')).toBeInTheDocument()
    expect(
      within(table).getByText(
        `Attempt ${failed.attemptCount + 1}: charging the card…`,
      ),
    ).toBeInTheDocument()

    expect(await screen.findByText('Retry declined')).toBeInTheDocument()
    await waitFor(() =>
      expect(within(table).queryByText('Retrying')).not.toBeInTheDocument(),
    )
    await waitFor(() =>
      expect(
        within(table)
          .getAllByRole('row')
          .filter((row) =>
            row.textContent?.includes(`Attempt ${failed.attemptCount + 1}`),
          ),
      ).toHaveLength(1),
    )
  })

  it('rolls the attempt back and explains when the API fails', async () => {
    server.use(
      http.post(`${apiBaseUrl}/charges/:id/retry`, async () => {
        await delay(100)
        return HttpResponse.json(
          {
            statusCode: 409,
            error: 'Conflict',
            message: 'Charge is already being retried',
          },
          { status: 409 },
        )
      }),
    )
    const { table, failed } = await retryFromTable()

    expect(within(table).getByText('Retrying')).toBeInTheDocument()
    expect(
      await screen.findByText('Charge is already being retried'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(within(table).queryByText('Retrying')).not.toBeInTheDocument(),
    )
    expect(
      within(table).queryByText(
        `Attempt ${failed.attemptCount + 1}: charging the card…`,
      ),
    ).not.toBeInTheDocument()
    expect(
      demoDbStore.getState().db.charges.find((c) => c.id === failed.id)
        ?.attemptCount,
    ).toBe(failed.attemptCount)
  })
})
