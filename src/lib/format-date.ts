const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const LOCALE = 'en-US'

const SECOND_MS = 1000
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['week', 7 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: 'auto',
})

export function parseApiDate(value: string) {
  if (!DATE_ONLY.test(value)) return new Date(value)
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

export function formatDate(value: string) {
  return dateFormatter.format(parseApiDate(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(parseApiDate(value))
}

export function formatRelative(value: string, now: Date = new Date()) {
  const seconds = (parseApiDate(value).getTime() - now.getTime()) / SECOND_MS
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit)
    }
  }
  return 'just now'
}
