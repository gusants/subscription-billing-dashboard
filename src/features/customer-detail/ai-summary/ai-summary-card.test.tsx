import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../../lib/env'
import { demoDbStore } from '../../../mocks/db/demo-db-store'
import { demoFlags } from '../../../mocks/demo-flags'
import { server } from '../../../mocks/node'
import { renderApp } from '../../../test/render-app'

function pastDueCustomerId() {
  return demoDbStore
    .getState()
    .db.subscriptions.find((s) => s.status === 'past_due')!.customerId
}

async function openCard(customerId = pastDueCustomerId()) {
  const view = renderApp(`/customers/${customerId}`)
  const card = await screen.findByRole('region', { name: 'AI summary' })
  return { ...view, card, customerId }
}

describe('AI summary card', () => {
  it('explains itself, loads on demand and announces when ready', async () => {
    let requests = 0
    server.use(
      http.get(`${apiBaseUrl}/customers/:id/summary`, async () => {
        requests += 1
        await delay(200)
      }),
    )
    const { user, card } = await openCard()

    expect(
      within(card).getByText(/the AI only writes the text/),
    ).toBeInTheDocument()
    expect(requests).toBe(0)

    await user.click(
      within(card).getByRole('button', { name: 'Generate summary' }),
    )

    expect(card).toHaveAttribute('aria-busy', 'true')
    expect(
      within(card).getByText(/^Analyzing \d+ charges…$/),
    ).toBeInTheDocument()
    expect(await within(card).findByText('Medium risk')).toBeInTheDocument()
    expect(card).toHaveAttribute('aria-busy', 'false')
    expect(
      within(card).getByText('Summary ready: Medium risk'),
    ).toBeInTheDocument()
    expect(requests).toBe(1)
  })

  it('separates computed metrics from the AI text and marks the action as human', async () => {
    const { user, card } = await openCard()

    await user.click(
      within(card).getByRole('button', { name: 'Generate summary' }),
    )

    const metrics = await within(card).findByRole('region', {
      name: 'Computed from the charges, not by the AI',
    })
    expect(within(metrics).getByText('Total paid')).toBeInTheDocument()
    expect(
      within(card).getByText('Suggested action (for a human)'),
    ).toBeInTheDocument()
    expect(
      within(card).getByText(/Nothing happens automatically/),
    ).toBeInTheDocument()
    expect(within(card).getByText(/^AI-written\./)).toBeInTheDocument()
    expect(within(card).getByText(/^Prompt v1 · Generated/)).toBeInTheDocument()
  })

  it('shows the rule-based fallback cue when the LLM fails', async () => {
    demoFlags.getState().setLlmFailing(true)
    const { user, card } = await openCard()

    await user.click(
      within(card).getByRole('button', { name: 'Generate summary' }),
    )

    expect(
      await within(card).findByText(/^Rule-based fallback\./),
    ).toBeInTheDocument()
    expect(
      within(card).getByText(/fixed rules wrote this summary/),
    ).toBeInTheDocument()
  })

  it('offers a retry when the request fails', async () => {
    server.use(
      http.get(
        `${apiBaseUrl}/customers/:id/summary`,
        () =>
          HttpResponse.json(
            {
              statusCode: 503,
              error: 'Unavailable',
              message: 'Summary service is down',
            },
            { status: 503 },
          ),
        { once: true },
      ),
    )
    const { user, card } = await openCard()

    await user.click(
      within(card).getByRole('button', { name: 'Generate summary' }),
    )
    expect(await within(card).findByRole('alert')).toHaveTextContent(
      'Summary service is down',
    )

    await user.click(within(card).getByRole('button', { name: 'Try again' }))
    expect(await within(card).findByText('Medium risk')).toBeInTheDocument()
  })

  it('marks the summary outdated after a payment event and regenerates it', async () => {
    const { user, card } = await openCard()
    await user.click(
      within(card).getByRole('button', { name: 'Generate summary' }),
    )
    await within(card).findByText('Medium risk')

    const table = screen.getByRole('table', { name: 'Charges' })
    await user.click(
      within(table).getAllByRole('button', { name: /Retry charge due/ })[0]!,
    )

    expect(
      await within(card).findByText(
        /New payment activity happened after this summary/,
      ),
    ).toBeInTheDocument()
    await user.click(within(card).getByRole('button', { name: 'Regenerate' }))

    await waitFor(() =>
      expect(
        within(card).queryByText(/New payment activity/),
      ).not.toBeInTheDocument(),
    )
    expect(
      await within(card).findByText(/^Rule-based fallback\./),
    ).toBeInTheDocument()
  })
})
