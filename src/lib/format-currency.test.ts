import { formatCompactCurrency, formatCurrency } from './format-currency'

const NBSP = ' '

describe('formatCurrency', () => {
  it.each([
    [38990, `R$${NBSP}389,90`],
    [123456, `R$${NBSP}1.234,56`],
    [0, `R$${NBSP}0,00`],
    [5, `R$${NBSP}0,05`],
    [-38990, `-R$${NBSP}389,90`],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatCurrency(cents)).toBe(expected)
  })
})

describe('formatCompactCurrency', () => {
  it.each([
    [120000, `R$${NBSP}1,2${NBSP}mil`],
    [230000000, `R$${NBSP}2,3${NBSP}mi`],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatCompactCurrency(cents)).toBe(expected)
  })
})
