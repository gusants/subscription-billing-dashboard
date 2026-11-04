import { screen } from '@testing-library/react'
import { renderApp } from './test/render-app'

describe('router', () => {
  it.each([
    ['/', 'Overview'],
    ['/customers', 'Customers'],
    ['/customers/cus_missing', 'Customer not found'],
    ['/plans', 'Plans'],
    ['/unknown', 'Page not found'],
  ])('renders %s', async (path, heading) => {
    renderApp(path)

    expect(
      await screen.findByRole('heading', { name: heading }),
    ).toBeInTheDocument()
  })

  it('leads from a missing page back to the overview', async () => {
    const { user } = renderApp('/unknown')

    await user.click(
      await screen.findByRole('link', { name: 'Back to overview' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Overview' }),
    ).toBeInTheDocument()
  })
})
