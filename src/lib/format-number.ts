const LOCALE = 'en-US'

const integerFormatter = new Intl.NumberFormat(LOCALE)
const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const PERCENTAGE_POINTS = 100

export function formatInteger(value: number) {
  return integerFormatter.format(value)
}

export function formatPercent(ratio: number) {
  return percentFormatter.format(ratio)
}

export function formatSigned(value: number, format: (value: number) => string) {
  if (value === 0) return format(0)
  return `${value > 0 ? '+' : '−'}${format(Math.abs(value))}`
}

export function formatPercentagePoints(ratioDelta: number) {
  return `${formatSigned(ratioDelta * PERCENTAGE_POINTS, (value) => value.toFixed(1))} pp`
}
