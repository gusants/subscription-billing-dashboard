const CENTS_PER_REAL = 100

const brlFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(amountCents: number) {
  return brlFormatter.format(amountCents / CENTS_PER_REAL)
}

const compactBrlFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCompactCurrency(amountCents: number) {
  return compactBrlFormatter.format(amountCents / CENTS_PER_REAL)
}
