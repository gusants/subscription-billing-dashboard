import { render, screen } from '@testing-library/react'
import { PageSkeleton } from './page-skeleton'

describe('PageSkeleton', () => {
  it('announces the loading state', () => {
    render(<PageSkeleton />)

    expect(
      screen.getByRole('status', { name: 'Loading page' }),
    ).toBeInTheDocument()
  })
})
