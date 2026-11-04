import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { notify } from './toast-queue'
import { AppToastRegion } from './toast-region'

describe('AppToastRegion', () => {
  it('shows a toast and dismisses it', async () => {
    const user = userEvent.setup()
    render(<AppToastRegion />)

    act(() => {
      notify.success('Plan created', 'Studio is now available to customers.')
    })

    expect(await screen.findByText('Plan created')).toBeInTheDocument()
    expect(
      screen.getByText('Studio is now available to customers.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByText('Plan created')).not.toBeInTheDocument()
  })
})
