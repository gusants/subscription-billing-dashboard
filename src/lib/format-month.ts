const LOCALE = 'en-US'

const shortMonth = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  timeZone: 'UTC',
})
const longMonth = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function monthDate(month: string) {
  return new Date(`${month}-01T00:00:00Z`)
}

export function formatShortMonth(month: string) {
  return shortMonth.format(monthDate(month))
}

export function formatLongMonth(month: string) {
  return longMonth.format(monthDate(month))
}
