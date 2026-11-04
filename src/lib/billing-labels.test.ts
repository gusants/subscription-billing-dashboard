import {
  chargeStatusLabel,
  declineReasonLabel,
  paymentMethodLabel,
  subscriptionStatusLabel,
  subscriptionStatuses,
} from './billing-labels'

describe('billing labels', () => {
  it('labels statuses with a tone', () => {
    expect(subscriptionStatusLabel('past_due')).toEqual({
      label: 'Past due',
      tone: 'danger',
    })
    expect(chargeStatusLabel('paid')).toEqual({
      label: 'Paid',
      tone: 'success',
    })
    expect(subscriptionStatuses).toEqual([
      'active',
      'past_due',
      'incomplete',
      'canceled',
    ])
  })

  it('keeps Pix and boleto as proper nouns', () => {
    expect(paymentMethodLabel('pix')).toBe('Pix')
    expect(paymentMethodLabel('boleto')).toBe('Boleto')
  })

  it('explains decline reasons in plain words', () => {
    expect(declineReasonLabel('insufficient_funds')).toBe('Insufficient funds')
    expect(declineReasonLabel('something_new')).toBe(
      'Declined by the card issuer',
    )
  })
})
