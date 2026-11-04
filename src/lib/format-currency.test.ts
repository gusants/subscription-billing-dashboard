import { formatCurrency } from './format-currency'

describe('formatCurrency', () => {
  it.each([
    [38990, 'R$389.90'],
    [123456, 'R$1,234.56'],
    [0, 'R$0.00'],
    [5, 'R$0.05'],
    [-38990, '-R$389.90'],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatCurrency(cents)).toBe(expected)
  })
})
