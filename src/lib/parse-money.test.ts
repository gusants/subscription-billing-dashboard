import { isMoneyInput, parseMoneyToCents } from './parse-money'

describe('money input', () => {
  it.each([
    ['389.90', 38990],
    ['389,9', 38990],
    ['89', 8900],
    [' 0.05 ', 5],
  ])('parses %s to %i cents', (input, cents) => {
    expect(isMoneyInput(input)).toBe(true)
    expect(parseMoneyToCents(input)).toBe(cents)
  })

  it.each(['', 'abc', '1.234', '-5', '1,234.56'])('rejects %s', (input) => {
    expect(isMoneyInput(input)).toBe(false)
  })
})
