import { render, screen } from '@testing-library/react'
import { SummaryMetrics } from './summary-metrics'
import { behaviorLabel } from './summary-labels'

describe('summary metrics', () => {
  it('says there is not enough history instead of inventing zeros', () => {
    render(
      <SummaryMetrics
        metrics={{
          monthsAsCustomer: 0,
          totalPaidCents: 0,
          failedAttempts: 0,
          averageDaysLate: null,
          paymentSuccessRate: null,
        }}
      />,
    )

    expect(screen.getAllByText('Not enough history')).toHaveLength(2)
  })

  it('labels the new payment behaviors in plain English', () => {
    expect(behaviorLabel('unreliable')).toBe('Unreliable payer')
    expect(behaviorLabel('insufficient_history')).toBe('Not enough history')
  })
})
