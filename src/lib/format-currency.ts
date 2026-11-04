const CENTS_PER_REAL = 100

const brlFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(amountCents: number) {
  return brlFormatter.format(amountCents / CENTS_PER_REAL)
}
