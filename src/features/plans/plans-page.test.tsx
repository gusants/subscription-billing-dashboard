import { screen, waitFor, within } from '@testing-library/react'
import { renderApp } from '../../test/render-app'

describe('plans page', () => {
  it('lists the plans with their price', async () => {
    renderApp('/plans')

    const table = await screen.findByRole('table', { name: 'Plans' })
    expect(
      within(table).getByRole('row', { name: /Studio R\$389\.90\/mo Active/ }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('row', {
        name: /Studio Annual R\$3,990\.00\/yr/,
      }),
    ).toBeInTheDocument()
  })

  it('validates the price before creating a plan', async () => {
    const { user } = renderApp('/plans')
    await screen.findByRole('table', { name: 'Plans' })

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ensemble')
    await user.type(screen.getByRole('textbox', { name: 'Price (R$)' }), 'abc')
    await user.click(screen.getByRole('button', { name: 'Create plan' }))

    expect(
      await screen.findByText('Enter a price like 389.90'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Price (R$)' }),
    ).toHaveAccessibleDescription('Enter a price like 389.90')
  })

  it('creates a plan, confirms it and shows it in the list', async () => {
    const { user } = renderApp('/plans')
    await screen.findByRole('table', { name: 'Plans' })

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ensemble')
    await user.type(
      screen.getByRole('textbox', { name: 'Price (R$)' }),
      '599,9',
    )
    await user.click(screen.getByRole('radio', { name: /Yearly/ }))
    await user.click(screen.getByRole('button', { name: 'Create plan' }))

    expect(await screen.findByText('Plan created')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Plans' })
    await waitFor(() =>
      expect(
        within(table).getByRole('row', {
          name: /Ensemble R\$599\.90\/yr Active/,
        }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('')
  })
})
