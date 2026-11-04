const CENTS_PER_REAL = 100
const MONEY_INPUT = /^\d{1,7}([.,]\d{1,2})?$/

export function isMoneyInput(value: string) {
  return MONEY_INPUT.test(value.trim())
}

export function parseMoneyToCents(value: string) {
  return Math.round(Number(value.trim().replace(',', '.')) * CENTS_PER_REAL)
}
