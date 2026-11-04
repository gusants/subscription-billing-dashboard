import { screen, within } from '@testing-library/react'
import { UI_PREFERENCES_STORAGE_KEY } from '../../lib/ui-preferences'
import { renderApp } from '../../test/render-app'

function mainNav() {
  return screen.getByRole('navigation', { name: 'Main' })
}

describe('AppShell', () => {
  it('navigates between sections and marks the current one', async () => {
    const { user, router } = renderApp('/')
    await screen.findByRole('heading', { name: 'Overview' })

    await user.click(within(mainNav()).getByRole('link', { name: 'Customers' }))

    expect(
      await screen.findByRole('heading', { name: 'Customers' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/customers')
    expect(
      within(mainNav()).getByRole('link', { name: 'Customers' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(mainNav()).getByRole('link', { name: 'Overview' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('keeps Customers current on a customer detail page', async () => {
    renderApp('/customers/cus_missing')
    await screen.findByRole('heading', { name: 'Customer not found' })

    expect(
      within(mainNav()).getByRole('link', { name: 'Customers' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('offers a skip link to the main content', async () => {
    renderApp('/')
    await screen.findByRole('heading', { name: 'Overview' })

    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('applies and remembers the chosen theme', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { name: 'Overview' })

    const [darkTheme] = screen.getAllByRole('radio', { name: 'Dark theme' })
    await user.click(darkTheme!)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(UI_PREFERENCES_STORAGE_KEY)).toContain(
      '"theme":"dark"',
    )

    const [systemTheme] = screen.getAllByRole('radio', { name: 'System theme' })
    await user.click(systemTheme!)

    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('opens and closes the simulator panel', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { name: 'Overview' })

    const [simulatorToggle] = screen.getAllByRole('button', {
      name: 'Simulator',
    })
    await user.click(simulatorToggle!)

    const panel = screen.getByRole('complementary', { name: /Simulator/ })
    const approvePix = within(panel).getByRole('form', { name: 'Approve Pix' })
    expect(
      within(approvePix).getByRole('button', { name: 'Approve' }),
    ).toBeDisabled()

    await user.click(
      within(panel).getByRole('button', { name: 'Close simulator' }),
    )

    expect(
      screen.queryByRole('complementary', { name: /Simulator/ }),
    ).not.toBeInTheDocument()
  })
})
