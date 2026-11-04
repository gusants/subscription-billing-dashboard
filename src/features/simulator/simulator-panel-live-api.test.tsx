import { screen, within } from '@testing-library/react'
import { renderApp } from '../../test/render-app'

vi.mock('../../lib/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/env')>()),
  apiMode: 'api',
  isDemoMode: false,
}))

describe('simulator against the live API', () => {
  it('labels the data source and disables demo-only controls with a reason', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByText('Live API')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Simulator' })[0]!)
    const panel = await screen.findByRole('complementary', {
      name: /Simulator/,
    })

    const retries = within(panel).getByRole('form', {
      name: 'Advance retry clock',
    })
    expect(
      within(retries).getByRole('button', { name: 'Run retries' }),
    ).toBeDisabled()
    expect(retries).toHaveTextContent('Not in the live API yet')

    const reset = within(panel).getByRole('form', { name: 'Reset demo' })
    expect(within(reset).getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(reset).toHaveTextContent('Only demo data can be reset')

    for (const name of [/Simulate API error/, /Simulate LLM failure/]) {
      expect(within(panel).getByRole('switch', { name })).toBeDisabled()
    }
    expect(panel).toHaveTextContent('Demo only')
  })
})
