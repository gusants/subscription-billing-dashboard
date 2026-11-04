import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../../lib/env'
import { server } from '../../mocks/node'
import { renderApp } from '../../test/render-app'

describe('new customer dialog', () => {
  it('creates a customer and opens their page', async () => {
    const { user, router } = renderApp('/customers')
    await screen.findByRole('grid', { name: 'Customers' })

    await user.click(screen.getByRole('button', { name: 'New customer' }))
    const dialog = await screen.findByRole('dialog', { name: 'New customer' })
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Escola Nova Harmonia',
    )
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Billing email' }),
      'ops@nova-harmonia.example',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Create customer' }),
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Escola Nova Harmonia',
      }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/customers\/cus_/)
    expect(screen.getByText('Customer created')).toBeInTheDocument()
  })

  it('shows the API error when the email is taken and keeps the dialog open', async () => {
    const { user } = renderApp('/customers')
    await screen.findByRole('grid', { name: 'Customers' })
    const takenEmail =
      screen
        .getAllByRole('row')[1]!
        .textContent?.match(/financeiro@\S+\.example/)?.[0] ?? ''

    await user.click(screen.getByRole('button', { name: 'New customer' }))
    const dialog = await screen.findByRole('dialog', { name: 'New customer' })
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Duplicate',
    )
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Billing email' }),
      takenEmail,
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Create customer' }),
    )

    expect(await screen.findByText('Action failed')).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'New customer' }),
    ).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const { user } = renderApp('/customers')
    await screen.findByRole('grid', { name: 'Customers' })

    await user.click(screen.getByRole('button', { name: 'New customer' }))
    const dialog = await screen.findByRole('dialog', { name: 'New customer' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Create customer' }),
    )

    await waitFor(() =>
      expect(
        within(dialog).getByText('Enter the school or teacher name'),
      ).toBeInTheDocument(),
    )
    expect(
      within(dialog).getByText('Enter a valid billing email'),
    ).toBeInTheDocument()
  })

  it('puts API validation errors on the matching field instead of a toast', async () => {
    server.use(
      http.post(`${apiBaseUrl}/customers`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: [
              {
                code: 'custom',
                path: ['email'],
                message: 'This domain does not receive email',
              },
            ],
          },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderApp('/customers')
    await screen.findByRole('grid', { name: 'Customers' })

    await user.click(screen.getByRole('button', { name: 'New customer' }))
    const dialog = await screen.findByRole('dialog', { name: 'New customer' })
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Escola Sem Email',
    )
    const email = within(dialog).getByRole('textbox', { name: 'Billing email' })
    await user.type(email, 'ops@nowhere.example')
    await user.click(
      within(dialog).getByRole('button', { name: 'Create customer' }),
    )

    expect(
      await within(dialog).findByText('This domain does not receive email'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Some fields need attention')).toBeNull()

    await user.type(email, 'x')
    await user.tab()
    await waitFor(() =>
      expect(
        within(dialog).queryByText('This domain does not receive email'),
      ).not.toBeInTheDocument(),
    )
  })
})
